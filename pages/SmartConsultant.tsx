
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, Bot, Info, ShoppingBag, Plus, CheckCircle, Package, ArrowLeft, Receipt, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createChatSession } from '../services/geminiService';
import { ChatMessage, Product, Order, CartItem, CustomerDetails, TrainingExample } from '../types';
import { Chat } from "@google/genai";

// --- Order Confirmation Card Component ---
const OrderConfirmationCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="mt-6 bg-gradient-to-br from-emerald-900/80 to-black border border-emerald-500/50 rounded-2xl p-0 shadow-2xl animate-enter relative overflow-hidden w-full max-w-sm mx-auto">
      {/* Decorative BG Icon */}
      <div className="absolute -top-10 -right-10 opacity-10 text-emerald-500 rotate-12">
         <Package size={180} />
      </div>
      
      {/* Header */}
      <div className="bg-emerald-600/20 p-5 border-b border-emerald-500/20 flex items-center gap-4">
         <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-900/50">
            <CheckCircle size={28} strokeWidth={2} />
         </div>
         <div>
            <h3 className="text-xl font-bold text-white font-serif-display">تم تأكيد الطلب</h3>
            <span className="text-emerald-300 text-xs font-mono tracking-widest">{order.id}</span>
         </div>
      </div>
      
      <div className="p-5 space-y-4 relative z-10">
         
         {/* Customer Info */}
         <div className="text-sm space-y-1 bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="flex justify-between">
               <span className="text-emerald-200/60">العميل:</span>
               <span className="text-white font-bold">{order.customer.name}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-emerald-200/60">العنوان:</span>
               <span className="text-white text-right truncate max-w-[150px]">{order.customer.address}</span>
            </div>
         </div>
         
         {/* Items List */}
         <div className="space-y-2">
            <p className="text-xs text-emerald-200/50 uppercase tracking-wider font-bold mb-1">المنتجات المطلوبة</p>
            {order.items.map((item, i) => (
               <div key={i} className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                     <span className="bg-emerald-500/20 text-emerald-300 w-5 h-5 flex items-center justify-center rounded text-xs font-bold">{item.quantity}</span>
                     <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <span className="text-rose-200 font-mono font-bold">{item.price * item.quantity}</span>
               </div>
            ))}
         </div>
         
         {/* TOTAL - HIGHLIGHTED */}
         <div className="mt-4 bg-[#050102] p-4 rounded-xl border border-emerald-500/30 flex justify-between items-center shadow-inner">
            <div className="flex items-center gap-2 text-emerald-500">
               <Receipt size={20} />
               <span className="text-sm font-bold uppercase tracking-wider">الإجمالي النهائي</span>
            </div>
            <div className="text-right">
               <span className="block text-3xl font-bold text-white font-mono leading-none tracking-tight">{order.total}</span>
               <span className="text-left text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]">ريال سعودي</span>
            </div>
         </div>
         
         <p className="text-center text-[10px] text-emerald-200/40 pt-2">سيتم التواصل معك قريباً لتوصيل الطلب</p>
      </div>
    </div>
  );
};

// --- Improved Formatter Component ---
const MessageFormatter: React.FC<{ 
  text: string; 
  isUser: boolean; 
  products: Product[];
  onAddToCart: (p: Product) => void;
  isError?: boolean;
  onRetry?: () => void;
}> = ({ text, isUser, products, onAddToCart, isError, onRetry }) => {
  const lines = text.split('\n');

  // Helper to parse bold text (**text**)
  const parseContent = (content: string) => {
    return content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={`font-bold mx-1 ${isUser ? 'text-white' : 'text-rose-400'}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Find products mentioned in this specific message
  const mentionedProducts = !isUser ? products.filter(p => text.includes(p.name)) : [];

  return (
    <div className={`text-right leading-relaxed ${isUser ? 'text-white' : 'text-rose-50'}`}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />; // Spacer

        // 1. Headers (### Title)
        if (trimmed.startsWith('###')) {
            return (
                <h3 key={index} className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-rose-500/20 w-full">
                    {trimmed.replace(/^###\s*/, '')}
                </h3>
            );
        }

        // 2. Blockquotes / Tips (> Tip)
        if (trimmed.startsWith('>') || trimmed.startsWith('&gt;')) {
            return (
                <div key={index} className="my-3 p-3 bg-rose-500/10 border-r-4 border-rose-500 rounded-l-xl flex gap-3 text-rose-200 text-sm">
                   <Info size={18} className="flex-shrink-0 mt-0.5 text-rose-500" />
                   <p className="italic">{parseContent(trimmed.replace(/^>|&gt;\s*/, ''))}</p>
                </div>
            );
        }

        // 3. Lists (* or - or •)
        const isList = trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•');
        if (isList) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={index} className="flex gap-3 items-start mb-2 group">
               <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
               <span className="flex-1 text-[0.95rem]">{parseContent(content)}</span>
            </div>
          );
        }

        // 4. Headers with colon (Legacy)
        if (trimmed.endsWith(':') && trimmed.length < 60) {
             return <h4 key={index} className="font-bold text-rose-300 text-base mt-4 mb-1">{parseContent(trimmed)}</h4>;
        }

        // 5. Regular Paragraphs
        return <p key={index} className="mb-1 text-[0.95rem]">{parseContent(trimmed)}</p>;
      })}

      {/* RENDER MENTIONED PRODUCTS */}
      {mentionedProducts.length > 0 && (
         <div className="mt-6 pt-4 border-t border-rose-500/10 grid gap-3">
             <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">منتجات مقترحة لكِ</span>
             </div>
             
             {mentionedProducts.map(product => (
                 <div key={product.id} className="flex items-center gap-3 bg-[#0a0002]/40 p-3 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-colors shadow-sm">
                     <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover bg-white/5" />
                     <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <h5 className="text-xs font-bold text-white truncate mb-1">{product.name}</h5>
                         <div className="inline-flex items-center bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 self-start">
                            <span className="text-xs font-bold text-rose-300 font-mono">{product.price} ر.س</span>
                         </div>
                     </div>
                     <button 
                       onClick={() => onAddToCart(product)}
                       className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors shadow-lg btn-shine"
                       title="إضافة للسلة"
                     >
                         <Plus size={16} strokeWidth={3} />
                     </button>
                 </div>
             ))}
         </div>
      )}

      {/* RETRY BUTTON FOR ERROR MESSAGES */}
      {isError && onRetry && (
         <div className="mt-4 border-t border-white/5 pt-3">
            <button 
               onClick={onRetry}
               className="flex items-center gap-2 text-rose-300 text-xs font-bold hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg w-full justify-center"
            >
               <RefreshCw size={14} />
               إعادة المحاولة
            </button>
         </div>
      )}
    </div>
  );
};

interface ExtendedChatMessage extends ChatMessage {
    orderConfirmation?: Order; // Optional: If this message is an order confirmation
    isError?: boolean; // New: track if message is an error state
}

interface SmartConsultantProps {
  products?: Product[];
  addToCart?: (product: Product) => void;
  onPlaceChatOrder?: (customer: CustomerDetails, items: CartItem[]) => Order;
  trainingData?: TrainingExample[];
}

const SmartConsultant: React.FC<SmartConsultantProps> = ({ 
    products = [], 
    addToCart = () => {},
    onPlaceChatOrder = (_customer: CustomerDetails, _items: CartItem[]) => ({} as Order),
    trainingData = []
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisResult, routine } = location.state || {};
  
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      let context = '';
      // Egyptian Persona Initialization - STRICT FORMAT
      let initialMsg = '✨ أهلاً يا جميلة 🌸\n• أنا دكتورة مريم، معاكي يا قمر 💖\n• قوليلي بتشتكي من إيه في بشرتك؟ 🌿';

      if (analysisResult) {
        context = `نتيجة التحليل: ${analysisResult}`;
        if (routine) {
          context += `\nالروتين المقترح: صباحاً: ${JSON.stringify(routine.morning)} - مساءً: ${JSON.stringify(routine.evening)}`;
        }
        initialMsg = '✨ أهلاً يا قمر 🌸\n• شوفت التحليل بتاعك وعرفت مشكلتك بالظبط 🧬\n• أنا معاكي لو حابة تسألي عن أي خطوة 💅';
      }

      setMessages([{
        role: 'model',
        text: initialMsg,
        timestamp: new Date()
      }]);

      // Pass trainingData to the service
      chatSessionRef.current = createChatSession(context, trainingData);
      initialized.current = true;
    }
  }, [analysisResult, routine, trainingData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, retryText?: string) => {
    e?.preventDefault();
    const textToSend = retryText || input;
    
    if (!textToSend.trim() || isLoading || !chatSessionRef.current) return;

    if (!retryText) {
        const userMessage: ExtendedChatMessage = { role: 'user', text: textToSend, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
    }
    
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: textToSend });
      
      // Check for Function Calls (Purchase Intent)
      const toolCalls = result.functionCalls;
      
      if (toolCalls && toolCalls.length > 0) {
         // Handle Order Creation Tool
         const orderCall = toolCalls.find(fc => fc.name === 'create_order');
         
         if (orderCall) {
            const args = orderCall.args as any;
            
            // Map detected items to real products in store
            const cartItems: CartItem[] = [];
            if (args.items && Array.isArray(args.items)) {
                args.items.forEach((item: any) => {
                    // Try to find matching product
                    const matched = products.find(p => p.name.includes(item.productName) || item.productName.includes(p.name));
                    if (matched) {
                        cartItems.push({ ...matched, quantity: item.quantity || 1 });
                    }
                });
            }

            // Create Order
            const newOrder = onPlaceChatOrder(
                {
                    name: args.customerName,
                    phone: args.customerPhone,
                    address: args.customerAddress,
                    governorate: 'Chat Order' // Default for chat
                },
                cartItems
            );

            // Display Confirmation in Chat
            setMessages(prev => [...prev, {
                role: 'model',
                text: '• تم استلام طلبك يا قمر! 📦\n• دي الفاتورة فيها كل التفاصيل، وهيوصلك قريب جداً 🌸',
                timestamp: new Date(),
                orderConfirmation: newOrder
            }]);

            // Inform AI that order is placed so it remembers context
            await chatSessionRef.current.sendMessage({
                message: `[System]: Order placed successfully. Order ID: ${newOrder.id}. Total: ${newOrder.total}. Inform the user nicely.`
            }); 
            
         }
      } else {
        // Normal Text Response
        const text = result.text;
        if (text) {
            // Remove previous error messages if we are retrying
            if (retryText) {
                setMessages(prev => prev.filter(m => !m.isError));
            }
            setMessages(prev => [...prev, { role: 'model', text: text, timestamp: new Date() }]);
        }
      }

    } catch (error: any) {
      // Suppress console error if it's just quota
      if (!error.message?.includes('429')) {
         console.error("Chat Error:", error);
      }
      
      let fallbackMsg = '• معلش يا جميلة، الشبكة علقت شوية 🔌';
      
      // Handle Quota Limits specifically
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        fallbackMsg = '• الضغط عالي عليا دلوقتي يا قمر 🤯\n• استني دقيقة واحدة وجربي تاني بالضغط على الزرار تحت 👇';
      }
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: fallbackMsg,
        timestamp: new Date(),
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
      // Find the last user message to retry
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
          // Remove the error message
          setMessages(prev => prev.filter(m => !m.isError));
          handleSend(undefined, lastUserMessage.text);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0002] flex flex-col font-tajawal">
        {/* Header - Fixed Top */}
        <header className="flex-shrink-0 bg-[#1a0508]/90 backdrop-blur-xl border-b border-white/10 p-4 safe-top">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                  <ArrowLeft size={24} />
               </button>
               <div className="relative">
                 <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-800 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-[#1a0508]">
                    <Bot size={24} strokeWidth={1.5} />
                 </div>
                 <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1a0508] rounded-full animate-pulse"></span>
               </div>
               <div>
                  <h2 className="text-lg font-bold text-white font-serif-display leading-tight">د/ مريم</h2>
                  <p className="text-xs text-rose-300/80 font-medium">صيدلانية (متصلة الآن)</p>
               </div>
            </div>
          </div>
        </header>

        {/* Chat Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gradient-to-b from-[#0a0002] to-[#1a0508]">
           <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-enter`}
                >
                  <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end mb-1 shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-white text-rose-900' 
                        : 'bg-[#2a0a10] text-rose-400 border border-rose-500/20'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    
                    {/* Bubble */}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
                        <div className={`px-5 py-4 rounded-2xl shadow-lg transition-all w-full ${
                          msg.role === 'user' 
                            ? 'bg-rose-600 text-white rounded-br-sm' 
                            : msg.isError 
                                ? 'bg-red-900/20 text-red-200 border border-red-500/30 rounded-bl-sm'
                                : 'bg-[#1e0a10] text-rose-50 border border-white/5 rounded-bl-sm'
                        }`}>
                          <MessageFormatter 
                            text={msg.text} 
                            isUser={msg.role === 'user'} 
                            products={products}
                            onAddToCart={addToCart}
                            isError={msg.isError}
                            onRetry={handleRetry}
                          />
                          
                          {/* Render Order Confirmation Card if exists */}
                          {msg.orderConfirmation && (
                             <OrderConfirmationCard order={msg.orderConfirmation} />
                          )}

                        </div>
                        <span className="text-[10px] text-rose-500/50 mt-1 px-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
           </div>
        </div>

        {/* Input Area - Fixed Bottom */}
        <div className="flex-shrink-0 bg-[#1a0508] border-t border-white/10 p-4 safe-bottom">
          <div className="max-w-4xl mx-auto">
             <form onSubmit={(e) => handleSend(e)} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتبي سؤالك هنا..."
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white placeholder-rose-200/30 rounded-2xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none transition-all text-right shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-4 rounded-2xl transition-all duration-300 flex items-center justify-center aspect-square ${
                    !input.trim() || isLoading 
                      ? 'bg-white/5 text-rose-500/30' 
                      : 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} className="rtl:rotate-180" />}
                </button>
             </form>
          </div>
        </div>
    </div>
  );
};

export default SmartConsultant;
