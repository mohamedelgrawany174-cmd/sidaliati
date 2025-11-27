
import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  ArrowRight,
  LogOut,
  TrendingUp,
  DollarSign,
  Edit,
  X,
  Menu,
  ChevronLeft,
  Settings,
  Upload,
  Image as ImageIcon,
  Palette,
  FileText,
  Wand2,
  Sparkles,
  Copy,
  Check,
  Eye,
  MapPin,
  Phone,
  Target,
  Share2,
  GraduationCap,
  Brain
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, BrandSettings, Order, TrainingExample } from '../types';
import Logo from '../components/Logo';
import { analyzeTextStrategy } from '../services/geminiService';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  brandSettings: BrandSettings;
  trainingData: TrainingExample[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onUpdateBrandSettings: (settings: BrandSettings) => void;
  onAddTraining: (example: TrainingExample) => void;
  onDeleteTraining: (id: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  orders,
  brandSettings,
  trainingData,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onUpdateBrandSettings,
  onAddTraining,
  onDeleteTraining
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings' | 'content' | 'training'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // View Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);

  // New/Edit Product State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    description: '',
    image: 'https://picsum.photos/400/400',
    ingredients: []
  });
  const [ingredientsInput, setIngredientsInput] = useState('');

  // Training Form State
  const [trainingForm, setTrainingForm] = useState({
    pattern: '',
    response: ''
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<BrandSettings>(brandSettings);

  // Content Analyzer State
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [analysisGoal, setAnalysisGoal] = useState('زيادة المبيعات');
  const [targetAudience, setTargetAudience] = useState('عميل جديد');
  const [platform, setPlatform] = useState('WhatsApp');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      category: '',
      price: 0,
      description: '',
      image: 'https://picsum.photos/400/400',
      ingredients: []
    });
    setIngredientsInput('');
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setProductForm(product);
    setIngredientsInput(product.ingredients.join(', '));
    setEditingId(product.id);
    setShowAddModal(true);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (productForm.name && productForm.price) {
      // Process ingredients
      const ingredientsArray = ingredientsInput.split(',').map(i => i.trim()).filter(i => i.length > 0);

      const finalProductData = {
        ...productForm,
        ingredients: ingredientsArray,
        price: Number(productForm.price)
      };

      if (editingId) {
        // Update existing
        onUpdateProduct({
          ...finalProductData,
          id: editingId
        } as Product);
      } else {
        // Add new
        onAddProduct({
          ...finalProductData,
          id: Date.now(),
          category: productForm.category || 'عام',
          description: productForm.description || '',
          image: productForm.image || 'https://picsum.photos/400/400',
        } as Product);
      }
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm({
          ...settingsForm,
          logoUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrandSettings(settingsForm);
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAnalyzeText = async () => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzingText(true);
    setAnalysisResult('');
    // Pass context parameters to the enhanced service
    const result = await analyzeTextStrategy(textToAnalyze, analysisGoal, targetAudience, platform);
    setAnalysisResult(result);
    setIsAnalyzingText(false);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Training Handlers
  const handleAddTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingForm.pattern || !trainingForm.response) return;
    onAddTraining({
      id: Date.now(),
      pattern: trainingForm.pattern,
      response: trainingForm.response,
      active: true
    });
    setTrainingForm({ pattern: '', response: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0f0205] flex items-center justify-center p-4 font-tajawal">
        <div className="bg-[#1a0508] rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border border-white/10">
          <Link to="/" className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors">
             <ArrowRight size={24} />
          </Link>
          <div className="flex flex-col items-center mb-10">
            <div className="scale-125 mb-6">
                <Logo variant="icon" settings={brandSettings} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-serif-display">{brandSettings.appName}</h1>
            <p className="text-rose-400 text-sm tracking-widest uppercase font-bold">بوابة المشرف</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-white/5 focus:border-rose-500 focus:ring-0 outline-none transition-all text-center tracking-[0.5em] text-lg bg-black/40 text-white placeholder:text-stone-600 focus:bg-black/60 placeholder:tracking-normal"
                placeholder="كلمة المرور"
                autoFocus
              />
            </div>
            <button className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-xl shadow-rose-900/20 active:scale-95 btn-shine">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-[#0a0002] flex font-tajawal relative overflow-hidden text-rose-50">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-72 bg-[#150305] text-white transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:translate-x-0 md:static md:flex md:flex-col md:flex-shrink-0 shadow-2xl border-l border-white/5
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-center md:block">
          <Logo settings={brandSettings} />
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-rose-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
            { id: 'products', icon: Package, label: 'المنتجات' },
            { id: 'orders', icon: ShoppingCart, label: 'الطلبات' },
            { id: 'training', icon: GraduationCap, label: 'تدريب الصيدلي' },
            { id: 'content', icon: FileText, label: 'ستوديو المحتوى' },
            { id: 'settings', icon: Settings, label: 'الإعدادات' }
          ].map((item) => (
             <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium ${
                  activeTab === item.id 
                    ? 'bg-rose-900/40 text-white shadow-lg shadow-black/20 translate-x-[-4px] border border-rose-500/20' 
                    : 'text-rose-200/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
                {activeTab === item.id && <ChevronLeft size={16} className="mr-auto" />}
              </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 text-rose-400 hover:text-white transition-colors w-full px-4 py-3 hover:bg-rose-900/20 rounded-xl font-medium">
            <LogOut size={18} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen w-full bg-[#0a0002]">
        <header className="bg-[#1a0508]/50 backdrop-blur-md border-b border-white/5 p-6 md:p-8 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'overview' && 'لوحة المعلومات'}
              {activeTab === 'products' && 'إدارة المنتجات'}
              {activeTab === 'orders' && 'سجل الطلبات'}
              {activeTab === 'training' && 'مركز التدريب الذكي'}
              {activeTab === 'content' && 'ستوديو المحتوى الذكي'}
              {activeTab === 'settings' && 'إعدادات الهوية'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/')} className="text-sm font-bold text-rose-400 hover:bg-rose-900/20 px-4 py-2 rounded-lg transition-colors hidden sm:block border border-rose-900/20">
                معاينة المتجر
             </button>
             <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-rose-300 border border-white/5">
                <Users size={20} />
             </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'إجمالي المبيعات', value: `${totalRevenue} ر.س`, icon: DollarSign, bg: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
                  { label: 'عدد الطلبات', value: orders.length, icon: ShoppingCart, bg: 'bg-rose-500/20 text-rose-400', border: 'border-rose-500/20' },
                  { label: 'المنتجات النشطة', value: products.length, icon: Package, bg: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/20' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#150305] p-6 rounded-2xl shadow-lg border border-white/5 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border ${stat.bg} ${stat.border}`}>
                      <stat.icon size={26} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-rose-200/40 text-sm font-medium mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full max-w-md order-2 md:order-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-200/30" size={20} />
                  <input 
                    type="text" 
                    placeholder="بحث سريع..." 
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all shadow-sm bg-[#150305] text-white placeholder-rose-200/20"
                  />
                </div>
                <button 
                  onClick={openAddModal}
                  className="w-full md:w-auto bg-rose-600 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 transition-colors shadow-xl shadow-rose-900/20 font-bold order-1 md:order-2 btn-shine"
                >
                  <Plus size={20} />
                  منتج جديد
                </button>
              </div>

              <div className="bg-[#150305] rounded-2xl shadow-lg border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[700px]">
                    <thead className="bg-black/20 border-b border-white/5 text-rose-200/40 text-sm font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-5">الصورة</th>
                        <th className="p-5">اسم المنتج</th>
                        <th className="p-5">التصنيف</th>
                        <th className="p-5">السعر</th>
                        <th className="p-5">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-5">
                            <div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-white/10 overflow-hidden">
                               <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            </div>
                          </td>
                          <td className="p-5 font-bold text-white text-base">{product.name}</td>
                          <td className="p-5">
                            <span className="bg-white/5 text-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-5 font-bold text-rose-400">{product.price} ر.س</td>
                          <td className="p-5">
                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openEditModal(product)}
                                className="p-2.5 text-rose-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => onDeleteProduct(product.id)}
                                className="p-2.5 text-rose-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
             <div className="animate-fadeIn">
               {orders.length === 0 ? (
                 <div className="bg-[#150305] rounded-2xl p-20 text-center border border-white/5 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                       <ShoppingCart size={40} className="text-rose-400 opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">لا توجد طلبات</h3>
                    <p className="text-rose-200/40 max-w-sm">لم يتم استلام أي طلبات من العملاء حتى الآن.</p>
                 </div>
               ) : (
                 <div className="bg-[#150305] rounded-2xl shadow-lg border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[700px]">
                      <thead className="bg-black/20 border-b border-white/5 text-rose-200/40 text-sm font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-5">رقم الطلب</th>
                          <th className="p-5">العميل</th>
                          <th className="p-5">المحافظة</th>
                          <th className="p-5">المبلغ</th>
                          <th className="p-5">التاريخ</th>
                          <th className="p-5">الحالة</th>
                          <th className="p-5">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-5 font-mono text-rose-300">{order.id}</td>
                            <td className="p-5 font-bold text-white">
                               <div className="flex flex-col">
                                  <span>{order.customer.name}</span>
                                  <span className="text-xs text-rose-200/40 font-normal">{order.customer.phone}</span>
                               </div>
                            </td>
                            <td className="p-5 text-rose-200/80">{order.customer.governorate}</td>
                            <td className="p-5 font-bold text-white">{order.total} ر.س</td>
                            <td className="p-5 text-rose-200/60 text-sm">{order.date.toLocaleDateString('ar-EG')}</td>
                            <td className="p-5">
                               <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                  {order.status === 'pending' ? 'جديد' : order.status}
                               </span>
                            </td>
                            <td className="p-5">
                               <button 
                                 onClick={() => setSelectedOrder(order)}
                                 className="flex items-center gap-2 text-rose-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold"
                               >
                                  <Eye size={16} />
                                  تفاصيل
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 </div>
               )}
             </div>
          )}

          {/* TRAINING TAB */}
          {activeTab === 'training' && (
             <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Form */}
                <div className="lg:col-span-1 bg-[#150305] rounded-[2rem] p-8 border border-white/5 shadow-xl h-fit">
                    <div className="mb-6 border-b border-white/5 pb-4">
                       <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2 font-serif-display">
                          <Brain size={24} className="text-rose-500" />
                          إضافة سيناريو جديد
                       </h3>
                       <p className="text-rose-200/40 text-sm">علمي د/ مريم ردوداً محددة لأسئلة معينة.</p>
                    </div>

                    <form onSubmit={handleAddTrainingSubmit} className="space-y-4">
                       <div>
                          <label className="block text-sm font-bold text-rose-200/70 mb-2">إذا قال العميل (السؤال/الحالة):</label>
                          <input 
                             type="text"
                             value={trainingForm.pattern}
                             onChange={(e) => setTrainingForm({...trainingForm, pattern: e.target.value})}
                             placeholder="مثال: بكام مصاريف الشحن؟"
                             className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all font-bold text-white"
                             required
                          />
                       </div>
                       
                       <div>
                          <label className="block text-sm font-bold text-rose-200/70 mb-2">الرد المطلوب (التصرف):</label>
                          <textarea 
                             value={trainingForm.response}
                             onChange={(e) => setTrainingForm({...trainingForm, response: e.target.value})}
                             placeholder="مثال: الشحن مجاني لأي طلب فوق 300 جنيه..."
                             className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all font-bold text-white h-32 resize-none"
                             required
                          />
                       </div>

                       <button 
                         type="submit"
                         className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-lg btn-shine flex items-center justify-center gap-2"
                       >
                          <Plus size={18} />
                          إضافة للقاعدة
                       </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 bg-[#150305] rounded-[2rem] p-8 border border-white/5 shadow-xl flex flex-col h-full">
                   <h3 className="text-xl font-bold text-white mb-6 font-serif-display flex items-center gap-2">
                      <GraduationCap size={24} className="text-amber-400" />
                      قاعدة المعرفة الحالية ({trainingData.length})
                   </h3>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                      {trainingData.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-40 text-rose-200/30 text-center">
                            <p>لم يتم إضافة أي تدريبات خاصة بعد.</p>
                         </div>
                      ) : (
                         trainingData.map(item => (
                            <div key={item.id} className="bg-black/20 rounded-xl p-5 border border-white/5 hover:border-rose-500/20 transition-colors group relative">
                               <button 
                                 onClick={() => onDeleteTraining(item.id)}
                                 className="absolute top-4 left-4 text-rose-200/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                               >
                                  <Trash2 size={18} />
                               </button>
                               <div className="mb-3">
                                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block mb-1">السؤال / الحالة</span>
                                  <p className="text-white font-bold text-lg">{item.pattern}</p>
                               </div>
                               <div>
                                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">الرد النموذجي</span>
                                  <p className="text-rose-200/70 text-sm">{item.response}</p>
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* CONTENT STUDIO TAB (Enhanced with Sales Psychology) */}
          {activeTab === 'content' && (
             <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                
                {/* Input Section - The Command Center */}
                <div className="bg-[#150305] rounded-[2rem] p-8 border border-white/5 shadow-xl flex flex-col">
                   <div className="mb-6 border-b border-white/5 pb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2 font-serif-display">
                        <Wand2 size={24} className="text-rose-500" />
                        غرفة عمليات المبيعات
                      </h3>
                      <p className="text-rose-200/40 text-sm">حدد نوع العميل والهدف ليقوم الذكاء الاصطناعي بهندسة الرد المثالي.</p>
                   </div>

                   {/* Context Selectors */}
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                         <label className="text-xs font-bold text-rose-200/50 mb-1.5 flex items-center gap-1">
                            <Users size={12} />
                            نوع العميل
                         </label>
                         <div className="relative">
                            <select 
                              value={targetAudience}
                              onChange={(e) => setTargetAudience(e.target.value)}
                              className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm font-bold appearance-none outline-none focus:border-rose-500/50 transition-colors"
                            >
                               <option className="bg-[#1a0508]" value="عميل جديد (متردد)">عميل جديد (متردد)</option>
                               <option className="bg-[#1a0508]" value="عميل متكرر (ولاء)">عميل متكرر (ولاء)</option>
                               <option className="bg-[#1a0508]" value="عميل غاضب (شكوى)">عميل غاضب (شكوى)</option>
                               <option className="bg-[#1a0508]" value="عميل يبحث عن السعر">عميل يبحث عن السعر</option>
                            </select>
                            <ChevronLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500/50 -rotate-90 pointer-events-none" size={14} />
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-rose-200/50 mb-1.5 flex items-center gap-1">
                            <Share2 size={12} />
                            المنصة
                         </label>
                         <div className="relative">
                            <select 
                              value={platform}
                              onChange={(e) => setPlatform(e.target.value)}
                              className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white text-sm font-bold appearance-none outline-none focus:border-rose-500/50 transition-colors"
                            >
                               <option className="bg-[#1a0508]" value="WhatsApp">واتساب (شخصي)</option>
                               <option className="bg-[#1a0508]" value="Instagram DM">انستجرام (سريع)</option>
                               <option className="bg-[#1a0508]" value="Facebook Post">فيسبوك (منشور)</option>
                               <option className="bg-[#1a0508]" value="Phone Script">مكالمة هاتفية</option>
                            </select>
                            <ChevronLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500/50 -rotate-90 pointer-events-none" size={14} />
                         </div>
                      </div>
                   </div>
                   
                   <textarea
                      value={textToAnalyze}
                      onChange={(e) => setTextToAnalyze(e.target.value)}
                      placeholder="اكتبي هنا الرسالة أو المشكلة... مثال: العميل بيقول السعر غالي ومش عايز يشتري، أرد عليه ازاي؟"
                      className="flex-1 w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-rose-200/20 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 outline-none resize-none mb-6 min-h-[150px]"
                   ></textarea>

                   <div className="space-y-4">
                      <label className="text-sm font-bold text-rose-200/70 block flex items-center gap-2">
                         <Target size={16} />
                         الهدف الاستراتيجي
                      </label>
                      <div className="flex flex-wrap gap-2">
                         {['زيادة المبيعات', 'كسر التردد', 'بناء الثقة', 'توضيح القيمة', 'اعتذار واحتواء', 'خلق استعجال (FOMO)'].map((goal) => (
                            <button
                               key={goal}
                               onClick={() => setAnalysisGoal(goal)}
                               className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                  analysisGoal === goal 
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                                  : 'bg-white/5 text-rose-300 border-white/5 hover:bg-white/10'
                               }`}
                            >
                               {goal}
                            </button>
                         ))}
                      </div>
                   </div>

                   <button
                      onClick={handleAnalyzeText}
                      disabled={!textToAnalyze.trim() || isAnalyzingText}
                      className="mt-8 w-full bg-gradient-to-r from-rose-600 to-rose-800 text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
                   >
                      {isAnalyzingText ? (
                         <>جاري تحليل السلوك...</>
                      ) : (
                         <>
                           <Sparkles size={20} />
                           هندسة الرد المثالي
                         </>
                      )}
                   </button>
                </div>

                {/* Output Section - The Analysis */}
                <div className="bg-[#150305] rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden flex flex-col h-full">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 opacity-50"></div>
                   
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2 font-serif-display">
                           <FileText size={24} className="text-amber-400" />
                           التحليل النفسي والردود
                        </h3>
                        <p className="text-rose-200/40 text-sm">سيناريوهات مدروسة للتأثير على العميل.</p>
                      </div>
                      {analysisResult && (
                         <button 
                           onClick={handleCopyResult}
                           className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold"
                           title="نسخ النتيجة"
                         >
                            {copied ? (
                                <>
                                    <Check size={16} className="text-green-400" />
                                    <span>تم النسخ</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    <span>نسخ الكل</span>
                                </>
                            )}
                         </button>
                      )}
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-xl p-6 border border-white/5">
                      {isAnalyzingText ? (
                         <div className="h-full flex flex-col items-center justify-center text-rose-200/30 gap-6">
                            <div className="relative">
                               <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <Sparkles size={20} className="text-rose-500 animate-pulse" />
                               </div>
                            </div>
                            <div className="text-center space-y-2">
                               <p className="font-bold text-white">جاري تحليل سيكولوجية العميل...</p>
                               <p className="text-xs text-rose-200/50">تحديد نقاط الألم • صياغة المحفزات • مراجعة النبرة</p>
                            </div>
                         </div>
                      ) : analysisResult ? (
                         <div className="prose prose-invert prose-rose max-w-none whitespace-pre-wrap text-sm leading-relaxed text-rose-50 font-medium">
                            {analysisResult}
                         </div>
                      ) : (
                         <div className="h-full flex flex-col items-center justify-center text-rose-200/20 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                               <Wand2 size={32} strokeWidth={1} />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">في انتظار البيانات</h4>
                            <p className="max-w-xs text-sm">اكتب المشكلة أو الرسالة وسيقوم الخبير باقتراح 3 سيناريوهات مختلفة للرد لضمان أفضل نتيجة.</p>
                         </div>
                      )}
                   </div>
                </div>

             </div>
          )}

          {/* SETTINGS TAB (Existing) */}
          {activeTab === 'settings' && (
            <div className="animate-fadeIn max-w-3xl mx-auto">
              <div className="bg-[#150305] rounded-[2rem] p-8 border border-white/5 shadow-xl">
                 <h2 className="text-2xl font-bold text-white mb-6 font-serif-display border-b border-white/5 pb-4">إعدادات الهوية</h2>
                 
                 <form onSubmit={handleSaveSettings} className="space-y-8">
                    {/* Live Preview */}
                    <div className="flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border border-white/5 border-dashed">
                       <span className="text-rose-200/40 text-xs mb-4 uppercase tracking-wider font-bold">معاينة الشعار والألوان</span>
                       <div className="scale-125">
                         <Logo settings={settingsForm} />
                       </div>
                       <button 
                        type="button" 
                        className="mt-6 px-6 py-2 rounded-lg text-white font-bold text-sm shadow-lg btn-shine"
                        style={{ background: `linear-gradient(135deg, ${settingsForm.primaryColor}, ${settingsForm.secondaryColor})` }}
                       >
                         زر تجريبي
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-bold text-rose-200/70 mb-2">اسم التطبيق (عربي)</label>
                          <input 
                            type="text"
                            value={settingsForm.appName}
                            onChange={(e) => setSettingsForm({...settingsForm, appName: e.target.value})}
                            className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all font-bold text-white"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-rose-200/70 mb-2">وصف قصير (إنجليزي)</label>
                          <input 
                            type="text"
                            value={settingsForm.subtitle}
                            onChange={(e) => setSettingsForm({...settingsForm, subtitle: e.target.value})}
                            className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all font-bold text-white text-left ltr"
                          />
                       </div>
                    </div>

                    {/* Color Control Section */}
                    <div className="space-y-6">
                       <h3 className="text-lg font-bold text-white font-serif-display border-b border-white/5 pb-2">ألوان التطبيق</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Primary Color */}
                           <div>
                              <label className="block text-sm font-bold text-rose-200/70 mb-3">اللون الأساسي (Primary)</label>
                              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                                    <input 
                                      type="color" 
                                      value={settingsForm.primaryColor}
                                      onChange={(e) => setSettingsForm({...settingsForm, primaryColor: e.target.value})}
                                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white font-bold font-mono text-lg ltr text-left mb-1">{settingsForm.primaryColor}</p>
                                  </div>
                              </div>
                           </div>

                           {/* Secondary Color */}
                           <div>
                              <label className="block text-sm font-bold text-rose-200/70 mb-3">اللون الثانوي (Gradients)</label>
                              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                                    <input 
                                      type="color" 
                                      value={settingsForm.secondaryColor || '#be123c'}
                                      onChange={(e) => setSettingsForm({...settingsForm, secondaryColor: e.target.value})}
                                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white font-bold font-mono text-lg ltr text-left mb-1">{settingsForm.secondaryColor}</p>
                                  </div>
                              </div>
                           </div>
                       </div>
                    </div>

                    {/* Background Animation Control */}
                    <div className="space-y-6">
                       <h3 className="text-lg font-bold text-white font-serif-display border-b border-white/5 pb-2">ألوان الخلفية المتحركة</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* BG Start */}
                           <div>
                              <label className="block text-sm font-bold text-rose-200/70 mb-3">لون الخلفية (1)</label>
                              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                                    <input 
                                      type="color" 
                                      value={settingsForm.bgGradientStart || '#881337'}
                                      onChange={(e) => setSettingsForm({...settingsForm, bgGradientStart: e.target.value})}
                                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
                                    />
                                  </div>
                              </div>
                           </div>

                           {/* BG End */}
                           <div>
                              <label className="block text-sm font-bold text-rose-200/70 mb-3">لون الخلفية (2)</label>
                              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                                    <input 
                                      type="color" 
                                      value={settingsForm.bgGradientEnd || '#4c0519'}
                                      onChange={(e) => setSettingsForm({...settingsForm, bgGradientEnd: e.target.value})}
                                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 border-0 cursor-pointer"
                                    />
                                  </div>
                              </div>
                           </div>
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-rose-200/70 mb-3">نوع الشعار</label>
                       <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setSettingsForm({...settingsForm, logoType: 'icon'})}
                            className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                               settingsForm.logoType === 'icon' 
                                ? 'bg-rose-600 text-white border-rose-600 shadow-lg' 
                                : 'bg-white/5 text-rose-200/60 border-white/10 hover:bg-white/10'
                            }`}
                          >
                             أيقونة افتراضية
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettingsForm({...settingsForm, logoType: 'image'})}
                            className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                               settingsForm.logoType === 'image' 
                                ? 'bg-rose-600 text-white border-rose-600 shadow-lg' 
                                : 'bg-white/5 text-rose-200/60 border-white/10 hover:bg-white/10'
                            }`}
                          >
                             صورة مخصصة
                          </button>
                       </div>
                    </div>

                    {settingsForm.logoType === 'image' && (
                       <div className="animate-fadeIn space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-rose-200/70 mb-2">رفع صورة الشعار</label>
                            <div 
                              onClick={() => logoInputRef.current?.click()}
                              className="w-full h-32 rounded-xl border-2 border-dashed border-white/10 bg-black/20 hover:bg-white/5 hover:border-rose-500/50 cursor-pointer flex flex-col items-center justify-center transition-all group"
                            >
                               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform mb-2">
                                  <Upload size={20} />
                               </div>
                               <p className="text-sm text-rose-200/60 font-bold group-hover:text-white">اضغط لاختيار صورة من جهازك</p>
                               <p className="text-xs text-rose-200/30 mt-1">PNG, JPG بحد أقصى 2MB</p>
                            </div>
                            <input 
                              type="file"
                              ref={logoInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                          </div>

                          <div className="relative">
                            <label className="block text-sm font-bold text-rose-200/70 mb-2">أو استخدم رابط صورة خارجي</label>
                            <input 
                              type="text"
                              value={settingsForm.logoUrl}
                              onChange={(e) => setSettingsForm({...settingsForm, logoUrl: e.target.value})}
                              className="w-full pl-10 pr-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all text-white text-left ltr text-sm font-mono"
                              placeholder="https://..."
                            />
                            <ImageIcon size={18} className="absolute left-3.5 top-[2.4rem] text-rose-200/30" />
                          </div>
                       </div>
                    )}

                    <div className="pt-6 border-t border-white/10 flex justify-end">
                       <button 
                         type="submit"
                         className="px-8 py-3.5 bg-rose-600 text-white rounded-xl hover:bg-rose-500 font-bold shadow-xl shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-95 btn-shine"
                       >
                         حفظ التغييرات
                       </button>
                    </div>
                 </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1a0508] rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] border border-white/10">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                    {editingId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                </h3>
                <p className="text-rose-200/40 text-sm mt-1">يرجى ملء كافة التفاصيل بدقة</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-rose-300 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-rose-200/70 mb-2">اسم المنتج</label>
                    <input 
                      required
                      type="text" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all font-bold text-white"
                      placeholder="مثال: كريم الليل المرمم"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-rose-200/70 mb-2">السعر (ر.س)</label>
                    <input 
                      required
                      type="number" 
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                      className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all font-bold text-rose-400"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-rose-200/70 mb-2">التصنيف</label>
                    <div className="relative">
                      <select 
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all appearance-none cursor-pointer text-white"
                      >
                        <option value="" className="bg-[#1a0508]">اختر التصنيف</option>
                        <option value="منظفات" className="bg-[#1a0508]">منظفات</option>
                        <option value="سيروم" className="bg-[#1a0508]">سيروم</option>
                        <option value="مرطبات" className="bg-[#1a0508]">مرطبات</option>
                        <option value="حماية" className="bg-[#1a0508]">حماية</option>
                        <option value="تونر" className="bg-[#1a0508]">تونر</option>
                        <option value="زيوت" className="bg-[#1a0508]">زيوت</option>
                        <option value="أخرى" className="bg-[#1a0508]">أخرى</option>
                      </select>
                      <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50 pointer-events-none -rotate-90" size={16} />
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-rose-200/70 mb-2">رابط الصورة</label>
                 <input 
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all text-left ltr text-sm text-rose-300 font-mono"
                    placeholder="https://..."
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-rose-200/70 mb-2">المكونات الفعالة <span className="text-rose-500/40 text-xs font-normal">(افصل بينها بفاصلة)</span></label>
                 <input 
                    type="text"
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all text-left ltr text-white"
                    placeholder="Vitamin C, Retinol, Niacinamide"
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-rose-200/70 mb-2">وصف المنتج</label>
                 <textarea 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 bg-black/40 focus:bg-black/60 transition-all h-28 resize-none leading-relaxed text-white"
                    placeholder="اكتب وصفاً جذاباً يشرح فوائد المنتج..."
                 ></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3.5 text-rose-300 hover:bg-white/5 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3.5 bg-rose-600 text-white rounded-xl hover:bg-rose-500 font-bold shadow-xl shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-95 btn-shine"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1a0508] rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/10">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-1">تفاصيل الطلب</h3>
                   <span className="text-rose-400 font-mono text-sm">{selectedOrder.id}</span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/5 rounded-full text-rose-200">
                   <X size={20} />
                </button>
             </div>

             <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5">
                <h4 className="text-sm font-bold text-rose-200/50 uppercase mb-3">بيانات العميل</h4>
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <Users size={16} className="text-rose-500" />
                      <span className="text-white font-bold">{selectedOrder.customer.name}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Phone size={16} className="text-rose-500" />
                      <span className="text-rose-100">{selectedOrder.customer.phone}</span>
                      {selectedOrder.customer.phone2 && <span className="text-rose-100/60">({selectedOrder.customer.phone2})</span>}
                   </div>
                   <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-rose-500" />
                      <span className="text-rose-100 text-sm">
                         {selectedOrder.customer.governorate} - {selectedOrder.customer.address}
                      </span>
                   </div>
                </div>
             </div>

             <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                <h4 className="text-sm font-bold text-rose-200/50 uppercase mb-3">المنتجات</h4>
                <div className="space-y-3">
                   {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                            <span className="text-white">{item.name}</span>
                         </div>
                         <span className="text-rose-300 font-mono">{item.price * item.quantity}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-rose-200/70 font-bold">الإجمالي النهائي</span>
                <span className="text-2xl font-bold text-white font-mono">{selectedOrder.total} ر.س</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
