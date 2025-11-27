
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import SkinAnalysis from './pages/SkinAnalysis';
import SmartConsultant from './pages/SmartConsultant';
import AdminDashboard from './pages/AdminDashboard';
import { Product, CartItem, BrandSettings, Order, CustomerDetails, TrainingExample } from './types';
import * as db from './services/dbService'; // Import the new DB layer

const App: React.FC = () => {
  // Application Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingExample[]>([]);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    appName: 'صيدلياتي',
    subtitle: 'Saydaliyati',
    logoType: 'icon',
    logoUrl: '',
    primaryColor: '#e11d48',
    secondaryColor: '#be123c',
    bgGradientStart: '#881337',
    bgGradientEnd: '#4c0519'
  });

  // UI State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const [loadedProducts, loadedOrders, loadedSettings, loadedTraining] = await Promise.all([
          db.dbGetProducts(),
          db.dbGetOrders(),
          db.dbGetSettings(),
          db.dbGetTraining()
        ]);
        
        setProducts(loadedProducts);
        // Fix Date parsing from JSON
        const parsedOrders = loadedOrders.map(o => ({...o, date: new Date(o.date)}));
        setOrders(parsedOrders);
        setBrandSettings(loadedSettings);
        setTrainingData(loadedTraining);
      } catch (error) {
        console.error("Failed to load app data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // --- CART OPERATIONS ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handlePlaceOrder = async (customer: CustomerDetails) => {
    try {
      const newOrder = await db.dbCreateOrder(customer, cart, 'web');
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
    } catch (e) {
      console.error("Order failed", e);
      alert("حدث خطأ أثناء حفظ الطلب");
    }
  };

  const handleChatOrder = (customer: CustomerDetails, items: CartItem[]) => {
     // This needs to be synchronous for the UI update flow, 
     // but we trigger the async save in background
     const tempOrder: Order = {
      id: `CHAT-${Date.now()}`,
      date: new Date(),
      customer: customer,
      items: items,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending'
    };
    
    // Optimistic Update
    setOrders(prev => [tempOrder, ...prev]);

    // Persist to DB
    db.dbCreateOrder(customer, items, 'chat').then(savedOrder => {
        // Sync ID if needed, or just reload orders later
        console.log("Chat order saved to DB");
    });

    return tempOrder;
  };

  // --- ADMIN OPERATIONS (Connected to DB) ---

  const handleAddProduct = async (newProduct: Product) => {
    const saved = await db.dbAddProduct(newProduct);
    setProducts(prev => [saved, ...prev]);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await db.dbUpdateProduct(updatedProduct);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await db.dbDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleUpdateBrandSettings = async (newSettings: BrandSettings) => {
    await db.dbSaveSettings(newSettings);
    setBrandSettings(newSettings);
  };

  const handleAddTraining = async (example: TrainingExample) => {
    const saved = await db.dbAddTraining(example);
    setTrainingData(prev => [saved, ...prev]);
  };

  const handleDeleteTraining = async (id: number) => {
    await db.dbDeleteTraining(id);
    setTrainingData(prev => prev.filter(t => t.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-[#0a0002] flex items-center justify-center text-rose-500">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-lg animate-pulse">جاري تحميل صيدلياتي...</p>
              </div>
          </div>
      );
  }

  return (
    <Router>
      {/* Dynamic Style Injection for Color Control */}
      <style>{`
        :root {
          --brand-primary: ${brandSettings.primaryColor};
          --brand-secondary: ${brandSettings.secondaryColor};
          --bg-start: ${brandSettings.bgGradientStart};
          --bg-end: ${brandSettings.bgGradientEnd};
        }
        
        /* --- Buttons Override (Gradients) --- */
        .bg-rose-600 { 
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary)) !important; 
        }
        .hover\\:bg-rose-500:hover { 
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary)) !important; 
          filter: brightness(1.1);
        }
        
        /* --- Text Colors --- */
        .text-rose-600 { color: var(--brand-primary) !important; }
        .text-rose-500 { color: color-mix(in srgb, var(--brand-primary), white 20%) !important; }
        .text-rose-400 { color: color-mix(in srgb, var(--brand-primary), white 40%) !important; }
        .text-rose-300 { color: color-mix(in srgb, var(--brand-secondary), white 60%) !important; }
        .text-rose-200 { color: color-mix(in srgb, var(--brand-secondary), white 80%) !important; }
        
        /* --- Borders & Rings --- */
        .border-rose-600 { border-color: var(--brand-primary) !important; }
        .border-rose-500 { border-color: var(--brand-secondary) !important; }
        .focus\\:ring-rose-500:focus { --tw-ring-color: var(--brand-primary) !important; }
        
        /* --- Background Animation Control --- */
        .bg-global-mesh::before {
           background: radial-gradient(circle, color-mix(in srgb, var(--bg-start), transparent 60%) 0%, transparent 70%) !important;
        }
        .bg-global-mesh::after {
           background: radial-gradient(circle, color-mix(in srgb, var(--bg-end), transparent 60%) 0%, transparent 70%) !important;
        }
      `}</style>

      <div className="font-tajawal text-rose-50 min-h-screen flex flex-col relative">
        <Navbar 
          cartCount={totalItems} 
          brandSettings={brandSettings} 
          onOpenCart={() => setIsCartOpen(true)}
        />
        
        <CartDrawer 
           isOpen={isCartOpen}
           onClose={() => setIsCartOpen(false)}
           cart={cart}
           onRemoveFromCart={removeFromCart}
           onPlaceOrder={handlePlaceOrder}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop products={products} addToCart={addToCart} />} />
          <Route 
            path="/analysis" 
            element={<SkinAnalysis products={products} addToCart={addToCart} />} 
          />
          <Route 
            path="/consultant" 
            element={
              <SmartConsultant 
                products={products} 
                addToCart={addToCart} 
                onPlaceChatOrder={handleChatOrder}
                trainingData={trainingData}
              />
            } 
          />
          
          {/* Secret Admin Route */}
          <Route 
            path="/admin" 
            element={
              <AdminDashboard 
                products={products} 
                orders={orders}
                brandSettings={brandSettings}
                trainingData={trainingData}
                onAddProduct={handleAddProduct} 
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateBrandSettings={handleUpdateBrandSettings}
                onAddTraining={handleAddTraining}
                onDeleteTraining={handleDeleteTraining}
              />
            } 
          />
        </Routes>

        {/* Footer */}
        <footer className="bg-[#0a0002]/80 backdrop-blur-md border-t border-white/5 py-20 mt-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="md:col-span-1">
                 <h4 className="font-serif-display text-2xl text-white mb-6">{brandSettings.appName}</h4>
                 <p className="text-rose-200/50 text-sm leading-loose font-light">
                   نجمع بين الطبيعة والعلم لتقديم تجربة عناية فائقة.
                 </p>
               </div>
               
               <div>
                 <h4 className="text-xs font-bold tracking-[0.2em] text-rose-500 uppercase mb-6">Explore</h4>
                 <ul className="space-y-4 text-rose-200/60 text-sm font-light">
                   <li><a href="#" className="hover:text-white transition-colors">Shop All</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Skin Analysis</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Pharmacist</a></li>
                 </ul>
               </div>

               <div>
                 <h4 className="text-xs font-bold tracking-[0.2em] text-rose-500 uppercase mb-6">Company</h4>
                 <ul className="space-y-4 text-rose-200/60 text-sm font-light">
                   <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                 </ul>
               </div>

               <div>
                  <h4 className="text-xs font-bold tracking-[0.2em] text-rose-500 uppercase mb-6">Newsletter</h4>
                  <div className="flex border-b border-rose-500/30 pb-2">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full bg-transparent border-none text-white placeholder-rose-500/50 focus:ring-0 px-0 text-sm" 
                    />
                    <button className="text-rose-500 text-xs font-bold uppercase tracking-widest hover:text-rose-300">Join</button>
                  </div>
               </div>
             </div>
             
             <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-rose-200/30 text-xs tracking-wide">
               <p>© 2024 {brandSettings.subtitle}. All rights reserved.</p>
               <div className="flex gap-4 mt-4 md:mt-0 items-center">
                 <Link to="/admin" className="text-rose-900 hover:text-rose-700 transition-colors font-medium">Admin Login</Link>
               </div>
             </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
