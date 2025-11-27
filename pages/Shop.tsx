import React from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Sparkles } from 'lucide-react';

interface ShopProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

const Shop: React.FC<ShopProps> = ({ products, addToCart }) => {
  const [filter, setFilter] = React.useState('الكل');
  
  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = filter === 'الكل' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="min-h-screen py-10 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Smooth Enter */}
        <div className="text-center mb-16 animate-enter">
          <span className="inline-block mb-4 p-3 bg-white/5 rounded-full text-rose-400 border border-white/10 backdrop-blur-md">
             <Sparkles size={20} />
          </span>
          <h2 className="text-4xl md:text-6xl font-serif-display font-bold text-white mb-6 tracking-tight">
            المجموعة المختارة
          </h2>
          <p className="text-lg text-rose-200/60 font-light max-w-2xl mx-auto">
            مستحضرات صيدلانية تم اختيارها بعناية لنتائج حقيقية وملموسة.
          </p>
        </div>

        {/* Minimalist Filters - Smooth Enter Delay */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 animate-enter delay-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                filter === cat
                  ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-900/30 transform scale-105'
                  : 'bg-white/5 text-rose-200/60 border-white/10 hover:border-rose-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid - Staggered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, idx) => (
            <div 
              key={product.id} 
              className="animate-enter"
              style={{ animationDelay: `${(idx % 5) * 0.1}s` }} // Stagger delay based on index
            >
               <ProductCard product={product} onAddToCart={addToCart} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="animate-enter flex flex-col items-center justify-center py-24 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 text-center">
            <p className="text-xl text-white font-bold mb-2">عذراً، لا توجد نتائج</p>
            <p className="text-rose-400">حاولي تغيير التصنيف أو عودي لاحقاً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;