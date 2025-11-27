
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Microscope } from 'lucide-react';
import Logo from './Logo';
import { BrandSettings } from '../types';

interface NavbarProps {
  cartCount: number;
  brandSettings: BrandSettings;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, brandSettings, onOpenCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll effect - Simple background change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Secret Admin Access Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (logoClicks > 0) {
      timer = setTimeout(() => setLogoClicks(0), 1000);
    }
    if (logoClicks >= 5) {
      navigate('/admin');
      setLogoClicks(0);
    }
    return () => clearTimeout(timer);
  }, [logoClicks, navigate]);

  const handleLogoClick = (e: React.MouseEvent) => {
    setLogoClicks(prev => prev + 1);
  };

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المتجر', path: '/shop' },
    { name: 'تحليل البشرة', path: '/analysis' },
    { name: 'الصيدلي', path: '/consultant' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (location.pathname === '/admin') return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-6'}`}>
        <div 
          className={`
            w-full max-w-6xl flex items-center justify-between 
            px-6 py-3 rounded-2xl 
            transition-all duration-300 ease-out
            ${scrolled 
              ? 'bg-[#1a0508]/90 backdrop-blur-xl shadow-lg border border-white/5' 
              : 'bg-transparent border border-transparent'}
          `}
        >
            
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="text-rose-100 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 active:scale-95"
              >
                {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
              </button>
            </div>

            {/* Logo */}
            <Link to="/" onClick={handleLogoClick} className="group hover:opacity-90 transition-opacity">
              <Logo settings={brandSettings} />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-white bg-white/10 shadow-inner'
                      : 'text-rose-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
               <Link to="/analysis" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-rose-700 px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-900/20 btn-shine">
                  <Microscope size={18} strokeWidth={1.5} />
                  <span>فحص ذكي</span>
               </Link>

              <button 
                onClick={onOpenCart}
                className="relative w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-rose-100 transition-colors"
              >
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-[#0a0002]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`
            md:hidden absolute top-full left-4 right-4 mt-2
            bg-[#1a0508]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden 
            shadow-2xl transition-all duration-300 origin-top
            ${isOpen ? 'max-h-[400px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}
          `}
        >
          <div className="p-4 flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`
                  text-base font-bold w-full text-center py-3 rounded-xl transition-all
                  ${isActive(link.path) 
                    ? 'bg-rose-600/20 text-rose-200' 
                    : 'text-rose-200/60 hover:bg-white/5'}
                `}
              >
                {link.name}
              </Link>
            ))}
             <Link 
               to="/analysis"
               onClick={() => setIsOpen(false)}
               className="bg-rose-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold mt-2 shadow-lg"
             >
                <Microscope size={20} strokeWidth={1.5} />
                <span>فحص ذكي</span>
             </Link>
          </div>
        </div>
      </nav>
      
      {/* Spacer */}
      <div className="h-24"></div>
    </>
  );
};

export default Navbar;
