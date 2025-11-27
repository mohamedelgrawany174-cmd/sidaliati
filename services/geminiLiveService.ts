import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SYSTEM_INSTRUCTION_VOICE } from '../constants';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export class VoiceSession {
  private nextStartTime = 0;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputNode: GainNode | null = null;
  private outputNode: GainNode | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private sessionPromise: Promise<any> | null = null;
  private active = false;

  constructor(private onStatusChange: (status: 'connecting' | 'connected' | 'disconnected' | 'speaking') => void) {}

  async start() {
    this.onStatusChange('connecting');
    this.active = true;
    this.nextStartTime = 0;
    
    try {
      // 1. Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("المتصفح لا يدعم الوصول للميكروفون");
      }

      // 2. Request Microphone Access FIRST before creating AudioContexts
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error: any) {
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError' || error.message.includes('device not found')) {
            throw new Error("لم يتم العثور على ميكروفون. يرجى التأكد من توصيله.");
        }
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            throw new Error("يرجى السماح بالوصول للميكروفون لاستخدام هذه الميزة.");
        }
        throw error;
      }

      // 3. Initialize Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.inputNode = this.inputAudioContext.createGain();
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      // 4. Connect to Gemini Live
      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            this.onStatusChange('connected');
            this.startAudioInput();
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            
            if (base64Audio && this.outputAudioContext && this.outputNode) {
              this.onStatusChange('speaking');
              
              // Sync timing
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              
              const audioBuffer = await this.decodeAudioData(
                this.decode(base64Audio),
                this.outputAudioContext,
                24000,
                1
              );

              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              
              source.addEventListener('ended', () => {
                this.sources.delete(source);
                if (this.sources.size === 0 && this.active) {
                  this.onStatusChange('connected'); // Back to listening/idle
                }
              });

              source.start(this.nextStartTime);
              this.nextStartTime += audioBuffer.duration;
              this.sources.add(source);
            }
            
            if (message.serverContent?.interrupted) {
               this.stopAudioOutput();
            }
          },
          onclose: () => {
            console.log('Voice session closed');
            this.disconnect();
          },
          onerror: (err) => {
            console.error('Voice session error:', err);
            this.disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION_VOICE,
        },
      });
    } catch (error) {
      console.error("Session start error:", error);
      this.disconnect(); // Ensure cleanup happens
      throw error; // Re-throw to let UI handle it
    }
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.stream) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      if (!this.active) return;
      
      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private stopAudioOutput() {
    for (const source of this.sources.values()) {
      source.stop();
    }
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    this.active = false;
    this.onStatusChange('disconnected');
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
  }

  // --- Helpers ---

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}