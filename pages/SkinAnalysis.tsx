
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, UploadCloud, ScanLine, Activity, Mic, MicOff, Waves, AlertCircle, Sparkles, ShoppingBag, MessageSquare, ArrowRight, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { analyzeSkinImage, generateRoutine } from '../services/geminiService';
import { VoiceSession } from '../services/geminiLiveService';
import { AnalysisStatus, RoutineResponse, Product } from '../types';

type Mode = 'CAMERA' | 'VOICE';

interface SkinAnalysisProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

const SkinAnalysis: React.FC<SkinAnalysisProps> = ({ products, addToCart }) => {
  const [mode, setMode] = useState<Mode>('CAMERA');
  const navigate = useNavigate();
  
  // Camera State
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(''); // New State for error message
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice State
  const [voiceStatus, setVoiceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'speaking'>('disconnected');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceSessionRef = useRef<VoiceSession | null>(null);

  useEffect(() => {
    return () => {
      if (voiceSessionRef.current) {
        voiceSessionRef.current.disconnect();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult('');
        setRoutine(null);
        setErrorMessage('');
        setStatus(AnalysisStatus.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMessage('');
    
    try {
      const base64Data = image.split(',')[1];
      const result = await analyzeSkinImage(base64Data?.map ? base64Data : base64Data);
      setAnalysisResult(result);
      
      // Attempt routine generation - if it fails (null), it won't crash the UI
      const routineRes = await generateRoutine(result);
      setRoutine(routineRes);
      
      setStatus(AnalysisStatus.COMPLETE);
    } catch (error: any) {
      console.error("Analysis UI Error:", error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage(error.message || "حدث خطأ غير متوقع أثناء التحليل.");
    }
  };

  const toggleVoiceSession = async () => {
    setVoiceError(null);
    if (voiceStatus === 'disconnected') {
      try {
        voiceSessionRef.current = new VoiceSession((newStatus) => {
          setVoiceStatus(newStatus);
        });
        await voiceSessionRef.current.start();
      } catch (err: any) {
        setVoiceError(err.message || "عذراً، حدث خطأ أثناء الاتصال بالخدمة الصوتية.");
        setVoiceStatus('disconnected');
      }
    } else {
      voiceSessionRef.current?.disconnect();
      setVoiceStatus('disconnected');
    }
  };

  // Helper to find a product from store that matches the recommendation
  const findMatchingProduct = (productNameOrType: string): Product | undefined => {
    if (!productNameOrType) return undefined;
    const lowerQuery = productNameOrType.toLowerCase();
    
    // Try exact match first (if AI returned correct name)
    const exact = products.find(p => p.name.toLowerCase().includes(lowerQuery));
    if (exact) return exact;

    // Try category match or loose keyword match
    return products.find(p => 
      p.category.toLowerCase().includes(lowerQuery) || 
      lowerQuery.includes(p.category.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-rose-900/20 text-rose-500 mb-4 border border-rose-500/20">
             <ScanLine size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-serif-display tracking-tight">
            مختبر صيدلياتي
          </h1>
          <p className="text-lg text-rose-200/60 max-w-xl mx-auto font-light">
            واجهة تشخيص متقدمة لفهم بشرتك بعمق.
          </p>
        </div>

        {/* Mode Toggles - Simple Tabs */}
        <div className="flex justify-center mb-12 animate-fadeIn">
          <div className="bg-[#1a0508] p-1.5 rounded-xl border border-white/10 flex gap-2">
             <button 
               onClick={() => setMode('CAMERA')}
               className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-bold text-sm ${
                 mode === 'CAMERA' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-rose-200/50 hover:bg-white/5 hover:text-white'
               }`}
             >
               <Camera size={18} />
               تحليل صورة
             </button>
             <button 
               onClick={() => setMode('VOICE')}
               className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-bold text-sm ${
                 mode === 'VOICE' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-rose-200/50 hover:bg-white/5 hover:text-white'
               }`}
             >
               <Mic size={18} />
               محادثة صوتية
             </button>
          </div>
        </div>

        {mode === 'CAMERA' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn">
            
            {/* Upload Area */}
            <div className="bg-[#150305] rounded-[2rem] p-6 border border-white/5 shadow-lg">
              <div 
                className={`
                  relative h-[400px] rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                  ${image ? 'border-none bg-black' : 'border-white/10 hover:border-rose-500/50 hover:bg-white/5'}
                `}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                {image ? (
                  <>
                    <img src={image} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    {status === AnalysisStatus.ANALYZING && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                            <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-mono text-sm animate-pulse">جاري التحليل...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-8 max-w-sm">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-300">
                      <UploadCloud size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-white font-bold text-xl mb-2">اضغطي لرفع الصورة</p>
                    <p className="text-sm text-rose-200/50">يرجى رفع صورة واضحة للوجه بدون فلاتر.</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Error Message Display */}
              {status === AnalysisStatus.ERROR && errorMessage && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-slideUpFade">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                    <p className="text-red-200 text-sm font-bold">{errorMessage}</p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                 {image && status !== AnalysisStatus.ANALYZING && (
                   <button
                     onClick={() => setImage(null)}
                     className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-white/5 text-rose-200 hover:bg-white/10 transition-colors"
                   >
                     صورة أخرى
                   </button>
                 )}
                 <button
                   onClick={startAnalysis}
                   disabled={!image || status === AnalysisStatus.ANALYZING}
                   className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg ${
                     !image || status === AnalysisStatus.ANALYZING 
                      ? 'opacity-50 cursor-not-allowed shadow-none' 
                      : 'hover:-translate-y-1'
                   }`}
                 >
                   {status === AnalysisStatus.ANALYZING ? (
                     <>
                       <RefreshCw className="animate-spin" size={18} />
                       جاري المعالجة...
                     </>
                   ) : (
                     <>
                       <Activity size={18} />
                       {status === AnalysisStatus.ERROR ? 'إعادة المحاولة' : 'بدء التحليل'}
                     </>
                   )}
                 </button>
              </div>
            </div>

            {/* Results Area */}
            <div className="bg-[#1a0508]/80 backdrop-blur-md rounded-[2rem] p-8 min-h-[400px] border border-white/5 shadow-xl relative">
              {status === AnalysisStatus.IDLE && (
                <div className="h-full flex flex-col items-center justify-center text-rose-200/20 py-20">
                  <ScanLine size={80} strokeWidth={0.5} />
                  <p className="mt-6 text-lg font-light">النتائج ستظهر هنا</p>
                </div>
              )}

              {status === AnalysisStatus.ERROR && !analysisResult && (
                 <div className="h-full flex flex-col items-center justify-center text-red-400/50 py-20">
                    <AlertCircle size={80} strokeWidth={0.5} />
                    <p className="mt-6 text-lg font-light">فشل التحليل</p>
                 </div>
              )}

              {status === AnalysisStatus.COMPLETE && (
                <div className="animate-fadeIn space-y-8">
                  {/* Diagnosis */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                     <div className="p-2 bg-rose-600 rounded-lg text-white">
                        <Activity size={20} />
                     </div>
                     <h3 className="text-2xl font-bold text-white font-serif-display">التقرير الطبي</h3>
                  </div>
                  
                  <div className="bg-black/20 rounded-2xl p-6 border-r-4 border-rose-500">
                    <p className="text-rose-50 leading-relaxed text-base whitespace-pre-wrap">
                      {analysisResult}
                    </p>
                  </div>

                  {/* Routine with Products */}
                  {routine ? (
                    <div className="space-y-6">
                      <h4 className="font-bold text-white text-lg flex items-center gap-2">
                        <Sparkles size={20} className="text-amber-400" />
                        الروتين المقترح والمنتجات
                      </h4>
                      <div className="grid gap-4">
                         {/* Morning */}
                         <div className="p-5 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-4">
                               <Sun className="text-amber-400" size={20} />
                               <span className="text-sm font-bold text-amber-200 uppercase">روتين الصباح</span>
                            </div>
                            <div className="space-y-4">
                              {routine.morning?.map((step, idx) => {
                                const matchedProduct = findMatchingProduct(step.productType);
                                return (
                                 <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="flex gap-3 items-start flex-1">
                                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-200 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                                         {idx + 1}
                                      </span>
                                      <div>
                                        <p className="font-bold text-rose-50 text-sm">{step.step}</p>
                                        <p className="text-xs text-amber-200/70 mt-0.5">{step.productType}</p>
                                      </div>
                                    </div>
                                    
                                    {matchedProduct && (
                                      <div className="flex items-center gap-3 mt-2 sm:mt-0 bg-rose-900/10 p-2 rounded-lg border border-rose-500/20 w-full sm:w-auto">
                                         <img src={matchedProduct.image} alt={matchedProduct.name} className="w-10 h-10 rounded-md object-cover" />
                                         <div className="flex flex-col flex-1">
                                            <span className="text-[10px] text-rose-300 line-clamp-1">{matchedProduct.name}</span>
                                            <span className="text-xs font-bold text-white">{matchedProduct.price} ر.س</span>
                                         </div>
                                         <button 
                                          onClick={() => addToCart(matchedProduct)}
                                          className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-lg transition-colors shadow-lg"
                                          title="إضافة للسلة"
                                         >
                                            <ShoppingBag size={14} />
                                         </button>
                                      </div>
                                    )}
                                 </div>
                              );
                              })}
                            </div>
                         </div>
                         
                         {/* Evening */}
                         <div className="p-5 bg-gradient-to-br from-indigo-900/30 to-transparent rounded-2xl border border-indigo-500/20">
                            <div className="flex items-center gap-2 mb-4">
                               <Moon className="text-indigo-400" size={20} />
                               <span className="text-sm font-bold text-indigo-200 uppercase">روتين المساء</span>
                            </div>
                            <div className="space-y-4">
                              {routine.evening?.map((step, idx) => {
                                 const matchedProduct = findMatchingProduct(step.productType);
                                 return (
                                 <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start bg-black/20 p-3 rounded-xl border border-white/5">
                                    <div className="flex gap-3 items-start flex-1">
                                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-200 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                                         {idx + 1}
                                      </span>
                                      <div>
                                        <p className="font-bold text-white text-sm">{step.step}</p>
                                        <p className="text-xs text-indigo-300/70 mt-0.5">{step.productType}</p>
                                      </div>
                                    </div>

                                    {matchedProduct && (
                                      <div className="flex items-center gap-3 mt-2 sm:mt-0 bg-rose-900/10 p-2 rounded-lg border border-rose-500/20 w-full sm:w-auto">
                                         <img src={matchedProduct.image} alt={matchedProduct.name} className="w-10 h-10 rounded-md object-cover" />
                                         <div className="flex flex-col flex-1">
                                            <span className="text-[10px] text-rose-300 line-clamp-1">{matchedProduct.name}</span>
                                            <span className="text-xs font-bold text-white">{matchedProduct.price} ر.س</span>
                                         </div>
                                         <button 
                                          onClick={() => addToCart(matchedProduct)}
                                          className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-lg transition-colors shadow-lg"
                                          title="إضافة للسلة"
                                         >
                                            <ShoppingBag size={14} />
                                         </button>
                                      </div>
                                    )}
                                 </div>
                              );
                              })}
                            </div>
                         </div>
                      </div>
                    </div>
                  ) : (
                    // Fallback if routine failed due to quota but analysis succeeded
                     <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                        <p className="text-rose-200/60 text-sm">
                           عذراً، لم نتمكن من توليد الروتين التفصيلي حالياً بسبب ضغط الخدمة. يرجى الاعتماد على التقرير الطبي أعلاه أو المحاولة لاحقاً.
                        </p>
                     </div>
                  )}

                  {/* NEXT STEPS - What do to now? */}
                  <div className="pt-8 border-t border-white/10">
                     <h3 className="text-xl font-bold text-white font-serif-display mb-4">ماذا أفعل الآن؟</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link 
                          to="/consultant" 
                          state={{ analysisResult, routine }}
                          className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                           <MessageSquare size={20} className="text-rose-400 group-hover:text-white" />
                           <div className="text-right">
                              <span className="block font-bold text-white text-sm">استشارة الصيدلي</span>
                              <span className="text-xs text-rose-200/50">لديكِ استفسار حول النتائج؟</span>
                           </div>
                           <ArrowRight size={16} className="mr-auto text-rose-500/50 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                        </Link>

                        <button 
                          onClick={() => navigate('/shop')}
                          className="flex items-center justify-center gap-3 p-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 transition-all btn-shine group"
                        >
                           <ShoppingBag size={20} />
                           <div className="text-right">
                              <span className="block font-bold text-sm">تسوقي المنتجات</span>
                              <span className="text-xs text-rose-100/80">تصفحي المتجر الكامل</span>
                           </div>
                           <ArrowRight size={16} className="mr-auto text-white/50 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                        </button>
                     </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        ) : (
          /* Voice Interface - Simple & Clean */
          <div className="animate-fadeIn w-full max-w-2xl mx-auto">
             <div className="bg-[#1e0a10]/60 backdrop-blur-xl rounded-[2.5rem] p-10 text-center border border-white/10 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
                
                {voiceError && (
                  <div className="absolute top-6 left-0 right-0 z-30 px-6">
                     <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        <span>{voiceError}</span>
                     </div>
                  </div>
                )}

                {/* Status */}
                <div className="mb-12">
                   <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                      voiceStatus === 'connected' || voiceStatus === 'speaking'
                        ? 'bg-rose-950/80 text-rose-400 border-rose-500/30' 
                        : voiceStatus === 'connecting' 
                          ? 'bg-amber-950/50 text-amber-400 border-amber-500/30'
                          : 'bg-white/5 text-stone-400 border-white/10'
                   }`}>
                      <span className={`w-2 h-2 rounded-full ${voiceStatus === 'disconnected' ? 'bg-stone-500' : 'bg-current animate-pulse'}`}></span>
                      {voiceStatus === 'disconnected' ? 'جاهز' : 
                       voiceStatus === 'connecting' ? 'جاري الاتصال...' :
                       voiceStatus === 'connected' ? 'استمع إليكِ...' : 'يتحدث'}
                   </span>
                </div>

                {/* Visualizer */}
                <div className="mb-12 relative">
                   <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                      voiceStatus === 'speaking' 
                        ? 'bg-rose-600 scale-110 shadow-[0_0_50px_rgba(225,29,72,0.6)]' 
                        : voiceStatus === 'connected'
                          ? 'bg-[#2f1018] border-2 border-rose-500/30'
                          : 'bg-white/5 border border-white/10'
                   }`}>
                      <Waves 
                        size={60} 
                        className={`transition-all duration-300 ${
                          voiceStatus === 'speaking' ? 'text-white' : 
                          voiceStatus === 'connected' ? 'text-rose-500' : 'text-stone-600'
                        }`} 
                      />
                   </div>
                </div>

                <div className="mb-10 max-w-sm mx-auto">
                   <h3 className="text-3xl font-bold text-white mb-2 font-serif-display">تحدثي مع الصيدلي</h3>
                   <p className="text-rose-200/50 text-base font-light">
                      اشرحي مشكلتك وسيقوم الذكاء الاصطناعي بالرد عليك فوراً.
                   </p>
                </div>

                <div>
                   <button 
                     onClick={toggleVoiceSession}
                     disabled={voiceStatus === 'connecting'}
                     className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95 ${
                        voiceStatus === 'disconnected'
                          ? 'bg-rose-600 text-white hover:bg-rose-500'
                          : 'bg-transparent text-rose-400 border border-rose-500/50 hover:bg-rose-950/30'
                     }`}
                   >
                      {voiceStatus === 'disconnected' ? (
                         <>
                           <Mic size={20} />
                           <span>بدء المحادثة</span>
                         </>
                      ) : (
                         <>
                           <MicOff size={20} />
                           <span>إنهاء</span>
                         </>
                      )}
                   </button>
                </div>

             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinAnalysis;