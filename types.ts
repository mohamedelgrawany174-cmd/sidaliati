
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  ingredients: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  phone2?: string;
  governorate: string;
  address: string;
}

export interface Order {
  id: string;
  date: Date;
  customer: CustomerDetails;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface RoutineStep {
  step: string;
  productType: string;
  advice: string;
}

export interface RoutineResponse {
  morning: RoutineStep[];
  evening: RoutineStep[];
  notes: string;
}

export interface BrandSettings {
  appName: string;
  subtitle: string;
  logoType: 'icon' | 'image';
  logoUrl: string; // Used if type is 'image'
  primaryColor: string;
  secondaryColor: string; // New: For button gradients
  bgGradientStart: string; // New: Background animation color 1
  bgGradientEnd: string; // New: Background animation color 2
}

export interface TrainingExample {
  id: number;
  pattern: string; // The user question or scenario
  response: string; // The ideal response or instruction
  active: boolean;
}
