import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="h-full group cursor-pointer">
      <div className="card-hover relative h-full bg-[#1e0a10]/40 backdrop-blur-md rounded-[2rem] p-4 flex flex-col border border-white/5 shadow-lg overflow-hidden">
        
        {/* Image Area - Smooth Zoom & Light */}
        <div className="relative w-full aspect-square rounded-[1.5rem] bg-white/5 overflow-hidden mb-5">
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
           <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            loading="lazy"
          />
          
          {/* Tag */}
          <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
             <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">{product.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col px-1">
          <h3 className="font-bold text-rose-50 text-lg leading-tight font-serif-display mb-2 group-hover:text-rose-400 transition-colors duration-300">{product.name}</h3>
          <p className="text-sm text-rose-200/50 line-clamp-2 mb-4 leading-relaxed font-light">{product.description}</p>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex flex-col">
               <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">السعر</span>
               <span className="text-xl font-bold text-white">{product.price} <span className="text-xs font-normal text-rose-400">ر.س</span></span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="btn-shine w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 hover:scale-105 active:scale-95"
              aria-label="إضافة للسلة"
            >
              <Plus size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;