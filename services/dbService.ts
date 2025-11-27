
import { Product, Order, BrandSettings, TrainingExample, CartItem, CustomerDetails } from '../types';
import { MOCK_PRODUCTS } from '../constants';

// Keys for LocalStorage (Simulating Database Tables)
const STORAGE_KEYS = {
  PRODUCTS: 'saydaliyati_products',
  ORDERS: 'saydaliyati_orders',
  SETTINGS: 'saydaliyati_settings',
  TRAINING: 'saydaliyati_training'
};

// Default Settings
const DEFAULT_SETTINGS: BrandSettings = {
  appName: 'صيدلياتي',
  subtitle: 'Saydaliyati',
  logoType: 'icon',
  logoUrl: '',
  primaryColor: '#e11d48',
  secondaryColor: '#be123c',
  bgGradientStart: '#881337',
  bgGradientEnd: '#4c0519'
};

const DEFAULT_TRAINING: TrainingExample[] = [
    { id: 1, pattern: 'بكام الشحن؟', response: 'الشحن مجاني لأي طلب فوق 300 جنيه، وغير كده 50 جنيه بس.', active: true },
    { id: 2, pattern: 'عندكم فرع؟', response: 'احنا متجر أونلاين بس بنوصلك لحد باب البيت في كل محافظات مصر.', active: true }
];

// --- PRODUCTS API ---

export const dbGetProducts = async (): Promise<Product[]> => {
  // Simulate Network Delay
  // await new Promise(r => setTimeout(r, 500)); 
  
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    // Seed initial data
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const dbAddProduct = async (product: Product): Promise<Product> => {
  const products = await dbGetProducts();
  const newProduct = { ...product, id: Date.now() }; // Auto-increment simulation
  const updated = [newProduct, ...products];
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  return newProduct;
};

export const dbUpdateProduct = async (product: Product): Promise<Product> => {
  const products = await dbGetProducts();
  const updated = products.map(p => p.id === product.id ? product : p);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  return product;
};

export const dbDeleteProduct = async (id: number): Promise<void> => {
  const products = await dbGetProducts();
  const updated = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
};

// --- ORDERS API ---

export const dbGetOrders = async (): Promise<Order[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return stored ? JSON.parse(stored) : [];
};

export const dbCreateOrder = async (customer: CustomerDetails, items: CartItem[], source: 'web' | 'chat' = 'web'): Promise<Order> => {
  const orders = await dbGetOrders();
  const newOrder: Order = {
    id: `${source === 'chat' ? 'CHAT' : 'ORD'}-${Date.now()}`,
    date: new Date(), // Notes: JSON.stringify turns dates to strings, in real app handle parsing
    customer,
    items,
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'pending'
  };
  
  // Save most recent first
  const updated = [newOrder, ...orders];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  return newOrder;
};

// --- SETTINGS API ---

export const dbGetSettings = async (): Promise<BrandSettings> => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const dbSaveSettings = async (settings: BrandSettings): Promise<BrandSettings> => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  return settings;
};

// --- TRAINING API ---

export const dbGetTraining = async (): Promise<TrainingExample[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRAINING);
  if (!stored) {
      localStorage.setItem(STORAGE_KEYS.TRAINING, JSON.stringify(DEFAULT_TRAINING));
      return DEFAULT_TRAINING;
  }
  return JSON.parse(stored);
};

export const dbAddTraining = async (example: TrainingExample): Promise<TrainingExample> => {
  const data = await dbGetTraining();
  const newItem = { ...example, id: Date.now() };
  const updated = [newItem, ...data];
  localStorage.setItem(STORAGE_KEYS.TRAINING, JSON.stringify(updated));
  return newItem;
};

export const dbDeleteTraining = async (id: number): Promise<void> => {
  const data = await dbGetTraining();
  const updated = data.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRAINING, JSON.stringify(updated));
};
