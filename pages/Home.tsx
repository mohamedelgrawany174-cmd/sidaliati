import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6">
        
        {/* Soft Background Glows - Adjusted for dark theme */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-rose-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-black/80 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">
          
          {/* Text Content - Staggered Entry */}
          <div className="text-center lg:text-right order-2 lg:order-1 flex flex-col items-center lg:items-start">
             
             <div className="animate-enter inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-900/20 border border-rose-500/20 mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[11px] font-bold tracking-widest text-rose-300 uppercase">صيدلياتي الذكية</span>
             </div>
             
             <h1 className="animate-enter delay-100 text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-6 font-serif-display tracking-tight">
               إشراقة بشرتك، <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">بلمسة ذكية.</span>
             </h1>
             
             <p className="animate-enter delay-200 text-lg text-rose-200/70 mb-10 leading-relaxed font-light max-w-lg">
               تجربة تسوق عصرية في صيدلياتي تجمع بين دقة الذكاء الاصطناعي وفخامة المنتجات الصيدلانية. اكتشفي العناية التي تستحقها بشرتك.
             </p>
             
             <div className="animate-enter delay-300 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <Link 
                 to="/analysis" 
                 className="btn-shine px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 active:scale-95 group"
               >
                 <span>فحص ذكي</span>
                 <ArrowLeft size={20} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
               </Link>
               
               <Link 
                 to="/shop" 
                 className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-lg flex items-center justify-center transition-all border border-white/5 hover:border-white/20"
               >
                 <span>المتجر</span>
               </Link>
             </div>

             {/* Stats - Staggered */}
             <div className="animate-enter delay-400 mt-16 flex gap-12 border-t border-white/5 pt-8">
               {[
                 { label: 'دقة AI', value: '99%' },
                 { label: 'منتج طبي', value: '50+' },
                 { label: 'تحليل', value: '10k' },
               ].map((stat, idx) => (
                 <div key={idx} className="flex flex-col">
                    <span className="text-3xl font-serif-display font-bold text-white mb-1">{stat.value}</span>
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest opacity-80">{stat.label}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Image Area - Smooth Float */}
          <div className="relative h-[450px] lg:h-[600px] flex items-center justify-center order-1 lg:order-2 animate-enter delay-200">
             <div className="relative w-full h-full flex justify-center items-center">
                <div className="animate-float relative z-10 w-[300px] md:w-[420px]">
                    {/* Main Image with Soft Border */}
                    <div className="rounded-[3rem] p-2 bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
                        <img 
                          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop" 
                          alt="Luxury Skincare" 
                          className="w-full h-auto object-cover rounded-[2.5rem] shadow-2xl"
                        />
                    </div>

                    {/* Floating Badges with gentle delay */}
                    <div className="absolute top-12 -right-6 bg-[#1a0508]/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                       <div className="bg-rose-500/20 p-2 rounded-lg text-rose-500">
                         <Activity size={20} />
                       </div>
                       <div>
                          <span className="text-xs text-rose-300 block">تحليل</span>
                          <span className="text-sm font-bold text-white">فوري ودقيق</span>
                       </div>
                    </div>

                    <div className="absolute bottom-16 -left-6 bg-[#1a0508]/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: '2s' }}>
                       <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
                         <Sparkles size={20} />
                       </div>
                       <div>
                          <span className="text-xs text-rose-300 block">نتائج</span>
                          <span className="text-sm font-bold text-white">روتين متكامل</span>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Staggered Cards */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[#0a0002]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-enter">
            <h2 className="text-3xl md:text-5xl font-serif-display font-bold text-white mb-4">تقنية المستقبل</h2>
            <p className="text-rose-200/60 max-w-xl mx-auto text-lg font-light">أدوات ذكية مصممة لراحتك وجمالك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: 'ماسح ذكي', desc: 'تحليل دقيق للبشرة عبر الكاميرا لتحديد احتياجاتك بدقة.', icon: Activity, delay: 'delay-100' },
              { title: 'روتين متكيف', desc: 'نظام عناية يتغير حسب حالة بشرتك لضمان أفضل النتائج.', icon: Sparkles, delay: 'delay-200' },
              { title: 'استشارة صوتية', desc: 'تحدثي مع الصيدلي الآلي بصوتك واحصل على نصائح فورية.', icon: Zap, delay: 'delay-300' },
            ].map((item, i) => (
              <div key={i} className={`animate-enter ${item.delay} card-hover p-8 rounded-[2rem] bg-[#1a0508]/40 border border-white/5 backdrop-blur-sm group`}>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-rose-300 mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-inner">
                  <item.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-serif-display">{item.title}</h3>
                <p className="text-rose-200/50 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;