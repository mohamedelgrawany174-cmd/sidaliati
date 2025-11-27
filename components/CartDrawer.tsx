
import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, CheckCircle, MapPin, Phone, User, MessageCircle, ChevronLeft, Truck, FileText } from 'lucide-react';
import { CartItem, CustomerDetails } from '../types';
import { EGYPT_GOVERNORATES } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveFromCart: (id: number) => void;
  onPlaceOrder: (customer: CustomerDetails) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemoveFromCart,
  onPlaceOrder 
}) => {
  const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    phone2: '',
    governorate: 'القاهرة',
    address: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderNum = `#ORD-${Math.floor(Math.random() * 100000)}`;
    setOrderNumber(newOrderNum);
    onPlaceOrder(customer);
    setView('success');
  };

  const handleClose = () => {
    if (view === 'success') {
      setView('cart'); // Reset for next time
    }
    onClose();
  };

  const sendToWhatsApp = () => {
    const message = `مرحباً صيدلياتي 👋\nلقد قمت بطلب جديد رقم ${orderNumber}\n\n*البيانات:*\nالاسم: ${customer.name}\nالهاتف: ${customer.phone}\nالعنوان: ${customer.governorate} - ${customer.address}\n\n*الطلب:*\n${cart.map(i => `- ${i.name} (${i.quantity})`).join('\n')}\n\n*الإجمالي:* ${total} ر.س`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  // Progress Stepper Helper
  const getStepStatus = (step: 'cart' | 'checkout' | 'success') => {
    if (view === step) return 'active';
    if (view === 'success' || (view === 'checkout' && step === 'cart')) return 'completed';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-tajawal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0f0205] h-full shadow-2xl flex flex-col border-l border-white/10 animate-slideLeft overflow-hidden">
        
        {/* Header with Progress Steps */}
        <div className="p-6 bg-[#1a0508] border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-serif-display">إتمام الطلب</h2>
            <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full text-rose-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stepper Visual */}
          <div className="flex items-center justify-between px-2 relative">
             {/* Connection Lines */}
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10"></div>
             
             {/* Steps */}
             {[
               { id: 'cart', icon: ShoppingBag, label: 'السلة' },
               { id: 'checkout', icon: FileText, label: 'البيانات' },
               { id: 'success', icon: Truck, label: 'التأكيد' },
             ].map((step, idx) => {
                const status = getStepStatus(step.id as any);
                const isActive = status === 'active';
                const isCompleted = status === 'completed';
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-[#1a0508] px-2">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] scale-110' :
                        isCompleted ? 'bg-emerald-500 text-white' :
                        'bg-white/5 text-rose-200/30'
                     }`}>
                        {isCompleted ? <CheckCircle size={18} /> : <step.icon size={18} />}
                     </div>
                     <span className={`text-[10px] font-bold ${isActive ? 'text-rose-400' : 'text-rose-200/30'}`}>
                        {step.label}
                     </span>
                  </div>
                )
             })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 relative custom-scrollbar">
          
          {/* VIEW: CART */}
          {view === 'cart' && (
            <div className="animate-fadeIn">
              {cart.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-rose-500/50 mb-4 animate-pulse">
                    <ShoppingBag size={48} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-bold text-white">سلة المشتريات فارغة</h3>
                  <p className="text-rose-200/50 text-sm max-w-xs">أضيفي منتجات من المتجر أو من خلال تحليل البشرة لتبدئي العناية.</p>
                  <button onClick={onClose} className="mt-6 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-rose-300 font-bold transition-colors">
                    تصفح المنتجات
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-[#150305] p-3 rounded-2xl border border-white/5 group hover:border-rose-500/30 transition-colors">
                      <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-rose-200/60 mt-1 bg-white/5 inline-block px-2 py-0.5 rounded text-[10px]">{item.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-rose-400 font-bold text-base">{item.price} ر.س <span className="text-xs text-rose-200/40">x{item.quantity}</span></span>
                          <button 
                            onClick={() => onRemoveFromCart(item.id)}
                            className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CHECKOUT FORM */}
          {view === 'checkout' && (
            <div className="animate-fadeIn">
               <div className="bg-rose-600/10 border border-rose-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <div className="bg-rose-600 text-white p-1.5 rounded-full mt-0.5">
                     <Truck size={14} />
                  </div>
                  <div>
                     <h4 className="font-bold text-white text-sm">توصيل سريع وآمن</h4>
                     <p className="text-xs text-rose-200/70 leading-relaxed">نقوم بتوصيل المنتجات معقمة ومغلفة جيداً لباب منزلك.</p>
                  </div>
               </div>

               <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
               
                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-rose-200/50 uppercase tracking-wider mb-2">معلومات الاتصال</h3>
                    
                    <div className="relative group">
                       <User className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400/50 group-focus-within:text-rose-500 transition-colors" size={18} />
                       <input 
                         required
                         type="text" 
                         value={customer.name}
                         onChange={e => setCustomer({...customer, name: e.target.value})}
                         className="w-full pr-12 pl-4 py-4 bg-[#150305] border border-white/10 rounded-xl text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-rose-200/20"
                         placeholder="الاسم الثلاثي"
                       />
                    </div>

                    <div className="relative group">
                       <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400/50 group-focus-within:text-rose-500 transition-colors" size={18} />
                       <input 
                         required
                         type="tel" 
                         value={customer.phone}
                         onChange={e => setCustomer({...customer, phone: e.target.value})}
                         className="w-full pr-12 pl-4 py-4 bg-[#150305] border border-white/10 rounded-xl text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-rose-200/20 ltr text-right placeholder:text-right"
                         placeholder="رقم الموبايل"
                       />
                    </div>
                 </div>

                 <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-rose-200/50 uppercase tracking-wider mb-2">عنوان التوصيل</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                       <div className="relative">
                          <select 
                            value={customer.governorate}
                            onChange={e => setCustomer({...customer, governorate: e.target.value})}
                            className="w-full px-4 py-4 bg-[#150305] border border-white/10 rounded-xl text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                            {EGYPT_GOVERNORATES.map(gov => (
                              <option key={gov} value={gov} className="bg-[#1a0508]">{gov}</option>
                            ))}
                          </select>
                          <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50 pointer-events-none -rotate-90" size={16} />
                       </div>

                       <div className="relative group">
                          <MapPin className="absolute right-4 top-4 text-rose-400/50 group-focus-within:text-rose-500 transition-colors" size={18} />
                          <textarea 
                             required
                             value={customer.address}
                             onChange={e => setCustomer({...customer, address: e.target.value})}
                             className="w-full pr-12 pl-4 py-4 bg-[#150305] border border-white/10 rounded-xl text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-rose-200/20 h-28 resize-none"
                             placeholder="اسم الشارع، رقم العقار، الدور، علامة مميزة..."
                          ></textarea>
                       </div>
                    </div>
                 </div>
               </form>
            </div>
          )}

          {/* VIEW: SUCCESS */}
          {view === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn pb-10">
               <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-bounce-slow">
                  <CheckCircle size={48} strokeWidth={2} />
               </div>
               
               <h3 className="text-3xl font-bold text-white mb-2 font-serif-display">تم استلام طلبك!</h3>
               <p className="text-rose-200/60 mb-8 max-w-xs text-sm leading-relaxed">
                  شكراً لثقتك في صيدلياتي. سنقوم بتجهيز طلبك وتوصيله إليك في أسرع وقت.
               </p>
               
               <div className="bg-white/5 p-6 rounded-2xl w-full border border-white/5 mb-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex justify-between mb-3">
                     <span className="text-rose-200/50 text-xs uppercase tracking-wider">رقم الطلب</span>
                     <span className="text-white font-mono font-bold tracking-widest">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3">
                     <span className="text-rose-200/50 text-xs uppercase tracking-wider">إجمالي الفاتورة</span>
                     <span className="text-rose-400 font-bold text-xl">{total} ر.س</span>
                  </div>
               </div>

               {/* WhatsApp Confirmation Button */}
               <button 
                onClick={sendToWhatsApp}
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mb-3"
               >
                 <MessageCircle size={20} />
                 <span>إرسال الفاتورة عبر واتساب</span>
               </button>

               <button 
                onClick={handleClose}
                className="w-full bg-white/5 text-rose-300 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
               >
                 العودة للصفحة الرئيسية
               </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {view !== 'success' && cart.length > 0 && (
          <div className="p-6 bg-[#1a0508] border-t border-white/5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-rose-200/60 text-sm">الإجمالي (شامل الضريبة)</span>
              <span className="text-2xl font-bold text-white font-mono">{total} <span className="text-sm text-rose-500 font-sans font-bold">ر.س</span></span>
            </div>
            
            {view === 'cart' ? (
              <button 
                onClick={() => setView('checkout')}
                className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 btn-shine flex items-center justify-center gap-2 group"
              >
                <span>متابعة الشراء</span>
                <ArrowRight size={20} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="flex gap-3">
                 <button 
                   onClick={() => setView('cart')}
                   className="px-6 py-4 bg-white/5 text-rose-300 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/5"
                 >
                   <ChevronLeft size={24} className="rtl:rotate-180" />
                 </button>
                 <button 
                   type="submit"
                   form="checkout-form"
                   className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl font-bold hover:shadow-rose-900/30 transition-all shadow-lg flex items-center justify-center gap-2 btn-shine"
                 >
                   <span>تأكيد الحجز</span>
                   <CheckCircle size={20} />
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
