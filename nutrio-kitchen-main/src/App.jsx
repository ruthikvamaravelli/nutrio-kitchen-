import React, { useState, useEffect, useRef } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider, saveUserToFirestore, getUserFromFirestore, updateUserInFirestore } from './firebase';
import { 
  Home, 
  UtensilsCrossed, 
  ShoppingBag, 
  Wallet, 
  UserCircle, 
  Settings, 
  TrendingUp, 
  History, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChefHat, 
  Power, 
  Wand2, 
  Loader2,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Check,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  MapPin,
  Clock,
  Star,
  Award,
  Activity,
  Navigation,
  ChevronRight,
  Bell,
  X,
  IndianRupee,
  Flame,
  PlusCircle,
  Plus,
  Minus,
  Leaf,
  ArrowRightLeft,
  Download,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  CreditCard,
  Lock
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const THEME = {
  bg: 'bg-[#F8FBF8]', 
  sidebar: 'bg-white',
  primary: 'bg-[#4B7C4B]', 
  primaryHover: 'hover:bg-[#3D663D]',
  textMain: 'text-[#1E293B]',
  textMuted: 'text-[#64748B]',
  border: 'border-[#E2E8F0]',
  card: 'bg-white',
  accent: 'bg-[#FF9571]' 
};

const saveUserData = (userData) => {
  localStorage.setItem('nutrioUser', JSON.stringify(userData));
};

const getUserData = () => {
  const data = localStorage.getItem('nutrioUser');
  return data ? JSON.parse(data) : null;
};

const clearUserData = () => {
  localStorage.removeItem('nutrioUser');
};

const updateLocalUserData = (updatedFields) => {
  const currentData = getUserData();
  if (currentData) {
    const newData = { ...currentData, ...updatedFields };
    saveUserData(newData);
    return newData;
  }
  return null;
};

const callGemini = async (prompt, isJson = false) => {
  try {
    if (!apiKey) {
      console.error("Missing VITE_GEMINI_API_KEY. Add it to your .env file.");
      return null;
    }
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: isJson ? { responseMimeType: "application/json" } : undefined
    };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};


const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'menu', label: 'Daily Menu', icon: UtensilsCrossed },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag },
    { id: 'finances', label: 'Finances', icon: Wallet },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen fixed left-0 top-0 transition-all duration-300 z-50 ${THEME.sidebar} border-r border-slate-100 flex flex-col`}>
      <div className="h-24 flex items-center justify-between px-8">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tight text-[#4B7C4B]">Nutrio</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] -mt-1 uppercase">Kitchen</span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-[1.2rem] transition-all duration-200 group ${
                isActive ? `${THEME.primary} text-white shadow-lg shadow-green-100` : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {!isCollapsed && <span className="text-sm font-bold">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-6 space-y-3">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center gap-3 p-4 rounded-[1.5rem] bg-[#E8F3E8] transition-all overflow-hidden hover:bg-[#dceddc] ${activeTab === 'profile' ? 'ring-2 ring-[#4B7C4B]' : ''} ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
             <UserCircle className="text-[#4B7C4B]" size={24} />
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-[11px] font-bold text-[#4B7C4B] truncate">{user?.name || 'Seller'}</p>
              <p className="text-[10px] text-slate-400 font-medium">Verified Seller</p>
            </div>
          )}
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-xs font-bold">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

const DailyMenu = ({ user }) => {
  const [dish, setDish] = useState({ 
    name: '', 
    ingredients: '',
    description: '', 
    price: '149',
    protein: '--',
    carbs: '--',
    fat: '--'
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState({ desc: false, nutrition: false });
  const [quantity, setQuantity] = useState(1);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const generateAIDescription = async () => {
    if (!dish.name) return;
    setLoading(prev => ({ ...prev, desc: true }));
    const prompt = `Write a mouth-watering, professional 1-sentence menu description for a dish called "${dish.name}"${dish.ingredients ? ` made with ${dish.ingredients}` : ''}. Keep it under 20 words.`;
    const result = await callGemini(prompt);
    if (result) setDish(prev => ({ ...prev, description: result.trim() }));
    setLoading(prev => ({ ...prev, desc: false }));
  };

  const checkNutrition = async () => {
    if (!dish.name) return;
    setLoading(prev => ({ ...prev, nutrition: true }));
    const prompt = `Analyze nutrition for "${dish.name}"${dish.ingredients ? ` using these ingredients: ${dish.ingredients}` : ''}. Return ONLY a JSON object with keys "protein", "carbs", and "fat" as numbers. Example: {"protein": 12, "carbs": 45, "fat": 8}`;
    const result = await callGemini(prompt, true);
    if (result) {
      try {
        const data = JSON.parse(result);
        setDish(prev => ({ 
          ...prev, 
          protein: `${data.protein}g`, 
          carbs: `${data.carbs}g`, 
          fat: `${data.fat}g` 
        }));
      } catch (e) { console.error("Parse Error", e); }
    }
    setLoading(prev => ({ ...prev, nutrition: false }));
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Editor Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">What's Cooking Today?</label>
          <input 
            type="text"
            placeholder="e.g. Quinoa Pulao with Raita"
            value={dish.name}
            onChange={e => setDish({...dish, name: e.target.value})}
            className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-700 text-lg shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={generateAIDescription}
            disabled={loading.desc || !dish.name}
            className="bg-[#EEF2FF] text-[#6366F1] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#E0E7FF] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading.desc ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            AI Description
          </button>
          <button 
            onClick={checkNutrition}
            disabled={loading.nutrition || !dish.name}
            className="bg-[#ECFDF5] text-[#10B981] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#D1FAE5] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading.nutrition ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
            Nutrition Check
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ingredients Used</label>
          <textarea 
            rows={2}
            placeholder="e.g. Quinoa, Peas, Carrots, Curd, Spices..."
            value={dish.ingredients}
            onChange={e => setDish({...dish, ingredients: e.target.value})}
            className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-600 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Public Description</label>
          <textarea 
            rows={3}
            placeholder="A delicious, healthy meal description will appear here..."
            value={dish.description}
            onChange={e => setDish({...dish, description: e.target.value})}
            className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-600 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Number of Plates</label>
              <div className="relative flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="absolute left-5 p-2 hover:bg-slate-100 transition-colors text-slate-700 font-bold rounded"
                >
                  <Minus size={16} />
                </button>
                <input 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-12 py-5 font-black text-slate-700 text-center shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="absolute right-5 p-2 hover:bg-emerald-100 transition-colors text-emerald-700 font-bold rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Price (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="number"
                  value={dish.price}
                  onChange={e => setDish({...dish, price: e.target.value})}
                  className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-5 font-black text-slate-700 shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div 
            onClick={() => document.getElementById('photo-upload').click()}
            className="group relative h-[300px] bg-[#F0FDF4] rounded-[2.5rem] border-2 border-dashed border-[#BBF7D0] flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100/50 transition-all overflow-hidden shadow-sm"
          >
            {preview ? (
              <>
                <img src={preview} className="w-full h-full object-cover" alt="Dish Preview" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#10B981] mb-3 group-hover:scale-110 transition-transform shadow-sm">
                  <Camera size={24} />
                </div>
                <p className="text-[11px] font-black text-[#065F46] uppercase tracking-widest">Upload Presentation Photo</p>
              </>
            )}
            <input id="photo-upload" type="file" hidden accept="image/*" onChange={handleFileUpload} />
          </div>
        </div>

        <button className="w-full bg-[#10B981] text-white py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-[#059669] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          Publish to Shop <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>

      {/* App Preview Section */}
      <div className="lg:col-span-5 flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Customer Web Preview</p>
        
        {/* Desktop Browser Mockup */}
        <div className="w-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 flex-1">
          {/* Browser Chrome */}
          <div className="bg-slate-800 px-5 py-3 flex items-center gap-3 border-b border-slate-700">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex-1 mx-4 bg-slate-700 rounded-lg px-4 py-1.5 flex items-center gap-2.5">
              <span className="text-slate-400 text-xs">🔒</span>
              <span className="text-xs text-slate-300 font-semibold">nutrio.shop/{user?.name?.toLowerCase().replace(/\s+/g, '-') || 'kitchen'}</span>
            </div>
          </div>

          {/* Browser Content - Scrollable */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 h-[calc(100%-52px)] overflow-auto">
            {/* Hero Section with Image */}
            <div className="relative h-[200px] bg-gradient-to-br from-emerald-50 to-slate-100">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon size={48} strokeWidth={1.5} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">Preview your dish photo here</p>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5">
                  <Flame size={12} />
                  Today's Special
                </span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="px-6 py-5 bg-white">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1.5">
                      {dish.name || 'Awaiting Dish Title...'}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {dish.description || 'A delicious, healthy meal description will appear here for your customers.'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Price</p>
                    <p className="text-3xl font-black bg-gradient-to-br from-emerald-600 to-emerald-700 bg-clip-text text-transparent">₹{dish.price || '0'}</p>
                  </div>
                </div>

                {/* Ingredients */}
                {dish.ingredients && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Leaf size={14} className="text-amber-700" />
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Ingredients</p>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">{dish.ingredients}</p>
                  </div>
                )}

                {/* Nutrition Info */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Activity size={14} className="text-emerald-600" />
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Nutrition</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'PROTEIN', val: dish.protein, icon: '💪', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
                      { label: 'CARBS', val: dish.carbs, icon: '🌾', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
                      { label: 'FAT', val: dish.fat, icon: '🥑', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' }
                    ].map((n, i) => (
                      <div key={i} className={`${n.bg} border ${n.border} rounded-lg p-3 text-center`}>
                        <div className="text-base mb-1">{n.icon}</div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{n.label}</p>
                        <p className={`text-lg font-black ${n.color}`}>{n.val || '0g'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef Info & Order Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center border border-emerald-100">
                      <ChefHat size={18} className="text-[#4B7C4B]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{user?.name || 'Kitchen'}'s Kitchen</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-600">Verified</span>
                        <span className="text-slate-300 text-xs">•</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold text-slate-600">4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5">
                    <ShoppingBag size={14} />
                    Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Finances = () => {
  const [balance, setBalance] = useState(4520);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawPopup, setShowWithdrawPopup] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);

  // Auto-close withdrawal popup after 3 seconds
  useEffect(() => {
    if (showWithdrawPopup) {
      const timer = setTimeout(() => setShowWithdrawPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWithdrawPopup]);

  const transactions = [
    { id: 1, type: 'credit', title: 'Order #4210', amount: '+ ₹180', date: 'Oct 24, 2023' },
    { id: 2, type: 'credit', title: 'Order #4209', amount: '+ ₹270', date: 'Oct 24, 2023' },
    { id: 3, type: 'debit', title: 'Withdrawal to Bank', amount: '- ₹1,200', date: 'Oct 22, 2023' },
  ];

  const dailyCommissions = [
    { date: 'Today', totalEarnings: '₹1,200', commission: '₹180 (15%)', orders: 8, avgOrderValue: '₹150', platformFee: '₹60 (5%)' },
    { date: 'Yesterday', totalEarnings: '₹1,050', commission: '₹157.50 (15%)', orders: 7, avgOrderValue: '₹150', platformFee: '₹52.50 (5%)' },
    { date: '2 Days Ago', totalEarnings: '₹980', commission: '₹147 (15%)', orders: 6, avgOrderValue: '₹163', platformFee: '₹49 (5%)' },
    { date: '3 Days Ago', totalEarnings: '₹1,150', commission: '₹172.50 (15%)', orders: 8, avgOrderValue: '₹144', platformFee: '₹57.50 (5%)' },
    { date: '4 Days Ago', totalEarnings: '₹890', commission: '₹133.50 (15%)', orders: 5, avgOrderValue: '₹178', platformFee: '₹44.50 (5%)' }
  ];

  const commissionBreakdown = [
    { type: 'Normal Orders', percentage: '15%', description: 'Standard commission rate' },
    { type: 'Personalized Orders', percentage: '12%', description: 'Health-customized meals' },
    { type: 'Peak Hours (8-11 AM, 7-9 PM)', percentage: '+5 bonus', description: 'Extra incentive during rush' },
    { type: 'Platform Fee', percentage: '5%', description: 'Payment processing & support' }
  ];

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Finances</h2>
          <p className="text-slate-400 font-bold mt-1">Manage your payouts, earnings and daily commissions</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600">
            <Wallet size={36} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
            <h3 className="text-5xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
              <span className="text-3xl text-slate-300">₹</span>{balance.toLocaleString()}
            </h3>
          </div>
        </div>

        <button 
          onClick={() => {
            setIsWithdrawing(true);
            // Store the amount before clearing balance
            setWithdrawnAmount(balance);
            // Show popup after processing completes (1500ms)
            setTimeout(() => {
              setBalance(0);
              setIsWithdrawing(false);
              setShowWithdrawPopup(true);
            }, 1500);
          }}
          disabled={balance === 0 || isWithdrawing}
          className="bg-[#FF9571] text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-[#ff8357] transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-3 group"
        >
          {isWithdrawing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <ArrowDownLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform" />
          )}
          {isWithdrawing ? 'PROCESSING...' : 'WITHDRAW TO BANK'}
        </button>
      </div>

      {/* Commission Breakdown */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Zap size={24} className="text-[#4B7C4B]" /> Commission Structure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commissionBreakdown.map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-transparent border border-blue-100">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-slate-800 flex-1">{item.type}</p>
                <span className="text-lg font-black text-blue-600 ml-2">{item.percentage}</span>
              </div>
              <p className="text-xs text-slate-500 font-bold">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Commissions */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Activity size={24} className="text-[#4B7C4B]" /> Daily Commission Breakdown
        </h3>
        <div className="space-y-3">
          {dailyCommissions.map((day, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-black text-slate-800 text-lg">{day.date}</p>
                  <p className="text-xs text-slate-400 font-bold">Total Earnings: {day.totalEarnings}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600 text-lg">Commission: {day.commission}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-50">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Orders</p>
                  <p className="font-black text-blue-600">{day.orders}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Avg Order</p>
                  <p className="font-black text-emerald-600">{day.avgOrderValue}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Earnings</p>
                  <p className="font-black text-amber-600">{day.totalEarnings}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Platform Fee</p>
                  <p className="font-black text-red-600">{day.platformFee}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-4">Recent Activity</h4>
        <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden">
          {transactions.map((tx, i) => (
            <div key={tx.id} className={`p-8 flex items-center justify-between hover:bg-slate-50 transition-colors ${i !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                  {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <p className="font-black text-slate-800">{tx.title}</p>
                  <p className="text-[11px] font-bold text-slate-400">{tx.date}</p>
                </div>
              </div>
              <span className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Popup */}
      {showWithdrawPopup && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-emerald-400/30">
            <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={16} strokeWidth={3} className="text-emerald-900" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">Withdrawal Initiated!</p>
              <p className="text-xs font-semibold text-emerald-100">₹{withdrawnAmount.toLocaleString()} transferred to your bank account</p>
            </div>
            <button
              onClick={() => setShowWithdrawPopup(false)}
              className="text-emerald-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const LiveOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [acceptedOrders, setAcceptedOrders] = useState(new Set());
  const [rejectedOrders, setRejectedOrders] = useState(new Set());
  const [showAcceptPopup, setShowAcceptPopup] = useState(false);
  const [acceptedOrderName, setAcceptedOrderName] = useState('');
  
  // Normal orders - no personalization
  const normalOrders = [
    {
      id: 1,
      customer: "Anjali Sharma",
      item: "Poha with Sprouts & Pomegranate",
      qty: 1,
      type: "PICKUP",
      time: "09:00 AM",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      cookingInstructions: "Cook poha with butter, add sprouts and fresh pomegranate. Serve hot with green chutney."
    },
    {
      id: 2,
      customer: "Rahul Varma",
      item: "Home-style Aloo Paratha with Curd",
      qty: 2,
      type: "DELIVERY",
      time: "10:30 AM",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      cookingInstructions: "Make crispy aloo paratha with ghee. Serve with fresh yogurt and pickle."
    },
    {
      id: 3,
      customer: "Priya Patel",
      item: "Paneer Tikka Masala with Naan",
      qty: 1,
      type: "DELIVERY",
      time: "11:15 AM",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      cookingInstructions: "Cook paneer in tandoor. Make creamy tomato-based curry with full-fat cream and butter."
    }
  ];

  // Personalized orders - with health data from customer
  const personalizedOrders = [
    {
      id: 101,
      customer: "Vikram Singh",
      email: "vikram@example.com",
      item: "Aloo Paratha with Curd",
      qty: 1,
      type: "DELIVERY",
      time: "12:00 PM",
      color: "text-blue-600",
      bg: "bg-blue-50",
      // Health data from external website
      healthData: {
        diseases: ["Type 2 Diabetes", "High Blood Pressure"],
        allergies: [],
        restrictions: ["Low Sugar", "Low Sodium", "Low Fat"],
        dietPreference: "Vegetarian"
      },
      baseInstructions: "Make aloo paratha with curd.",
      cookingInstructions: "Use whole wheat for paratha. Minimize oil (2 tsp per paratha). Use sea salt sparingly. Serve with low-fat yogurt. Avoid added butter or ghee."
    },
    {
      id: 102,
      customer: "Meera Gupta",
      email: "meera@example.com",
      item: "Paneer Tikka Masala with Brown Rice",
      qty: 2,
      type: "PICKUP",
      time: "01:00 PM",
      color: "text-blue-600",
      bg: "bg-blue-50",
      // Health data from external website
      healthData: {
        diseases: ["High Cholesterol", "Obesity"],
        allergies: [],
        restrictions: ["Low Fat", "Low Calorie", "High Protein"],
        dietPreference: "Vegetarian"
      },
      baseInstructions: "Make paneer tikka masala with brown rice.",
      cookingInstructions: "Use low-fat paneer. Grill instead of frying. Use tomato-based curry with minimal oil (1 tsp). Skip cream and butter. Add more herbs. Serve with brown rice instead of white."
    },
    {
      id: 103,
      customer: "Arjun Reddy",
      email: "arjun@example.com",
      item: "Chana Masala with Roti",
      qty: 1,
      type: "DELIVERY",
      time: "02:30 PM",
      color: "text-blue-600",
      bg: "bg-blue-50",
      // Health data from external website
      healthData: {
        diseases: ["Celiac Disease", "Gluten Sensitivity"],
        allergies: ["Gluten", "Wheat"],
        restrictions: ["Gluten-Free"],
        dietPreference: "Vegan"
      },
      baseInstructions: "Make chana masala with roti.",
      cookingInstructions: "Use CERTIFIED GLUTEN-FREE millet or rice flour for roti. Use separate utensils to avoid cross-contamination. Make chana masala with cumin, coriander, and tomato. Use minimal oil. Do NOT use any wheat products."
    },
    {
      id: 104,
      customer: "Deepak Kumar",
      email: "deepak@example.com",
      item: "Vegetable Biryani with Raita",
      qty: 1,
      type: "PICKUP",
      time: "03:45 PM",
      color: "text-blue-600",
      bg: "bg-blue-50",
      // Health data from external website
      healthData: {
        diseases: ["Kidney Disease", "High Potassium Level"],
        allergies: [],
        restrictions: ["Low Potassium", "Low Sodium", "Low Protein"],
        dietPreference: "Vegetarian"
      },
      baseInstructions: "Make vegetable biryani with raita.",
      cookingInstructions: "Use low-potassium vegetables (carrots, cabbage, eggplant). Avoid potatoes, tomatoes, and spinach. Use minimal salt. Cook rice separately without salt. Season lightly with spices only. Serve with plain yogurt (not seasoned raita)."
    }
  ];

  const getDiseaseTag = (disease) => {
    const colors = {
      "Type 2 Diabetes": "bg-red-100 text-red-700",
      "High Blood Pressure": "bg-orange-100 text-orange-700",
      "High Cholesterol": "bg-yellow-100 text-yellow-700",
      "Obesity": "bg-pink-100 text-pink-700",
      "Celiac Disease": "bg-purple-100 text-purple-700",
      "Gluten Sensitivity": "bg-purple-100 text-purple-700",
      "Kidney Disease": "bg-indigo-100 text-indigo-700"
    };
    return colors[disease] || "bg-gray-100 text-gray-700";
  };

  const handleAcceptOrder = (orderId, customerName) => {
    setAcceptedOrders(new Set([...acceptedOrders, orderId]));
    setRejectedOrders(rejectedOrders => {
      const updated = new Set(rejectedOrders);
      updated.delete(orderId);
      return updated;
    });
    setAcceptedOrderName(customerName);
    setShowAcceptPopup(true);
    // Auto-close popup after 3 seconds
    setTimeout(() => setShowAcceptPopup(false), 3000);
  };

  const handleRejectOrder = (orderId) => {
    setRejectedOrders(new Set([...rejectedOrders, orderId]));
    setAcceptedOrders(acceptedOrders => {
      const updated = new Set(acceptedOrders);
      updated.delete(orderId);
      return updated;
    });
  };

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Orders</h2>
          <p className="text-slate-400 font-bold mt-1">Manage normal and personalized customer orders</p>
        </div>
      </div>

      {/* NORMAL ORDERS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800">Normal Orders</h3>
          <span className="ml-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{normalOrders.length}</span>
        </div>

        {normalOrders.map((order) => (
          <div key={order.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{order.customer}</h3>
                <p className="text-sm text-slate-500 mt-1">Standard Order</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">{order.type}</span>
                <p className="text-xs font-bold text-slate-400 mt-2">{order.time}</p>
              </div>
            </div>
            
            <p className="text-lg font-bold text-emerald-600 mb-6">
              {order.item} <span className="text-slate-300 mx-2">×</span> {order.qty}
            </p>

            <div className="bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-100">
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-2">Cooking Instructions</p>
              <p className="text-sm text-emerald-900">{order.cookingInstructions}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <button 
                onClick={() => handleAcceptOrder(order.id, order.customer)}
                disabled={acceptedOrders.has(order.id) || rejectedOrders.has(order.id)}
                className={`md:col-span-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  acceptedOrders.has(order.id) 
                    ? 'bg-emerald-600 text-white cursor-not-allowed opacity-75' 
                    : rejectedOrders.has(order.id)
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Check size={18} strokeWidth={3} /> {acceptedOrders.has(order.id) ? 'ACCEPTED' : 'ACCEPT ORDER'}
              </button>
              <button 
                onClick={() => handleRejectOrder(order.id)}
                disabled={acceptedOrders.has(order.id) || rejectedOrders.has(order.id)}
                className={`md:col-span-4 py-4 rounded-2xl font-bold text-sm transition-colors ${
                  rejectedOrders.has(order.id)
                    ? 'bg-red-600 text-white cursor-not-allowed opacity-75'
                    : acceptedOrders.has(order.id)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rejectedOrders.has(order.id) ? 'REJECTED' : 'REJECT'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PERSONALIZED ORDERS SECTION */}
      <div className="space-y-6 mt-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800">Personalized Orders</h3>
          <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{personalizedOrders.length}</span>
        </div>

        {personalizedOrders.map((order) => (
          <div key={order.id} className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{order.customer}</h3>
                <p className="text-sm text-blue-600 font-bold mt-1">Health-Personalized Order</p>
              </div>
              <div className="text-right">
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">{order.type}</span>
                <p className="text-xs font-bold text-slate-400 mt-2">{order.time}</p>
              </div>
            </div>
            
            <p className="text-lg font-bold text-blue-600 mb-6">
              {order.item} <span className="text-slate-300 mx-2">×</span> {order.qty}
            </p>

            {/* Health Information */}
            <div className="bg-blue-50 p-6 rounded-2xl mb-6 border border-blue-100">
              <p className="text-xs font-black text-blue-700 uppercase tracking-wider mb-3">Customer Health Profile</p>
              
              <div className="space-y-4">
                {/* Diseases */}
                {order.healthData.diseases.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {order.healthData.diseases.map((disease, idx) => (
                        <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold ${getDiseaseTag(disease)}`}>
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary Restrictions */}
                {order.healthData.restrictions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Restrictions</p>
                    <div className="flex flex-wrap gap-2">
                      {order.healthData.restrictions.map((restriction, idx) => (
                        <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {order.healthData.allergies.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {order.healthData.allergies.map((allergy, idx) => (
                        <span key={idx} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cooking Instructions based on Health */}
            <div className="bg-yellow-50 p-6 rounded-2xl mb-6 border border-yellow-200">
              <p className="text-xs font-black text-yellow-800 uppercase tracking-wider mb-3">⚕️ Health-Adapted Cooking Instructions</p>
              <p className="text-sm font-bold text-yellow-900 leading-relaxed">{order.cookingInstructions}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <button 
                onClick={() => handleAcceptOrder(order.id, order.customer)}
                disabled={acceptedOrders.has(order.id) || rejectedOrders.has(order.id)}
                className={`md:col-span-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  acceptedOrders.has(order.id) 
                    ? 'bg-blue-600 text-white cursor-not-allowed opacity-75' 
                    : rejectedOrders.has(order.id)
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Check size={18} strokeWidth={3} /> {acceptedOrders.has(order.id) ? 'ACCEPTED' : 'ACCEPT ORDER'}
              </button>
              <button 
                onClick={() => handleRejectOrder(order.id)}
                disabled={acceptedOrders.has(order.id) || rejectedOrders.has(order.id)}
                className={`md:col-span-4 py-4 rounded-2xl font-bold text-sm transition-colors ${
                  rejectedOrders.has(order.id)
                    ? 'bg-red-600 text-white cursor-not-allowed opacity-75'
                    : acceptedOrders.has(order.id)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rejectedOrders.has(order.id) ? 'REJECTED' : 'REJECT'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Accept Order Popup */}
      {showAcceptPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Check size={32} className="text-emerald-600" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Order Accepted!</h2>
              <p className="text-lg font-bold text-emerald-600 mb-4">{acceptedOrderName}</p>
              <p className="text-sm text-slate-500 font-semibold">Order has been confirmed and is being prepared</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ user, onLogout, onUpdateUser }) => {
  const [location, setLocation] = useState("Fetching your location...");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedMobile, setEditedMobile] = useState(user?.mobile || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedHours, setEditedHours] = useState(user?.operatingHours || '08:00 AM - 08:00 PM');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedName(user?.name || '');
    setEditedMobile(user?.mobile || '');
    setEditedEmail(user?.email || '');
    setEditedHours(user?.operatingHours || '08:00 AM - 08:00 PM');
  }, [user]);

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      alert('Name cannot be empty');
      return;
    }
    
    if (editedMobile && editedMobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSaving(true);
    const updatedData = {
      name: editedName,
      mobile: editedMobile,
      email: editedEmail,
      operatingHours: editedHours
    };

    console.log('Saving profile with data:', updatedData);
    console.log('Current user:', user);

    try {
      // Update Firestore if user has uid (with timeout)
      if (user?.uid) {
        console.log('Attempting Firestore update...');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 5000)
        );
        
        try {
          const success = await Promise.race([
            updateUserInFirestore(user.uid, updatedData),
            timeoutPromise
          ]);
          
          if (!success) {
            console.warn('Firestore update returned false, continuing with local save');
          } else {
            console.log('Firestore update successful');
          }
        } catch (firestoreError) {
          console.warn('Firestore update failed or timed out, continuing with local save:', firestoreError);
        }
      }

      // Update local storage and create complete updated user object
      const currentUserData = getUserData() || user;
      const completeUpdatedData = { ...currentUserData, ...updatedData };
      console.log('Complete updated data:', completeUpdatedData);
      
      saveUserData(completeUpdatedData);
      console.log('Saved to localStorage');
      
      // Update parent component with complete data
      if (onUpdateUser) {
        onUpdateUser(completeUpdatedData);
        console.log('Parent component updated');
      }

      setIsSaving(false);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error updating profile: ' + error.message);
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setEditedMobile(user?.mobile || '');
    setEditedEmail(user?.email || '');
    setEditedHours(user?.operatingHours || '08:00 AM - 08:00 PM');
    setIsEditing(false);
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding using OpenStreetMap Nominatim API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
              { headers: { 'User-Agent': 'NutrioShop/1.0' } }
            );
            const data = await response.json();
            
            // Format a readable address
            const address = data.address;
            const parts = [
              address.road || address.neighbourhood,
              address.suburb || address.city_district,
              address.city || address.town || address.village,
              address.state_district || address.state
            ].filter(Boolean);
            
            setLocation(parts.join(", ") || data.display_name);
          } catch (error) {
            console.error("Geocoding error:", error);
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Location error:", error);
          setLocation("Location access denied");
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocation("Geolocation not supported");
      setIsLoadingLocation(false);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={80} className="text-[#4B7C4B]" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-lg border border-slate-50 hover:bg-slate-50 transition-all">
              <Camera size={20} className="text-slate-600" />
            </button>
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name || 'Seller Name'}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 bg-emerald-50 text-[#4B7C4B] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Verified Seller
              </span>
              <span className="text-[12px] font-bold text-slate-400">Joined {user?.joinedDate || 'Recently'}</span>
            </div>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[#4B7C4B] text-white rounded-2xl font-bold text-sm hover:bg-[#3D663D] transition-all flex items-center gap-2"
          >
            <Settings size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 size={18} /> Save Changes</>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8">
        <div className="flex items-center justify-between pb-8 border-b border-slate-100">
          <h4 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ChefHat size={16} className="text-[#4B7C4B]" />
            </div>
            Kitchen Information
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Name Field */}
            <div className="bg-gradient-to-br from-emerald-50 to-transparent p-6 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <UserCircle size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Kitchen Name</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="font-black text-slate-800 text-lg border border-emerald-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  placeholder="Your kitchen name"
                />
              ) : (
                <p className="font-black text-slate-800 text-lg">{user?.name || 'Not provided'}</p>
              )}
            </div>

            {/* Location Field - Not editable */}
            <div className="bg-gradient-to-br from-blue-50 to-transparent p-6 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <MapPin size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Location</p>
              </div>
              <p className="font-black text-slate-800 text-lg flex items-center gap-2">
                {location}
                {isLoadingLocation && (
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                )}
              </p>
            </div>

            {/* Mobile Field */}
            <div className="bg-gradient-to-br from-amber-50 to-transparent p-6 rounded-2xl border border-amber-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Phone size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Mobile</p>
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedMobile}
                  onChange={(e) => setEditedMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="font-black text-slate-800 text-lg border border-amber-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                  placeholder="10-digit mobile number"
                />
              ) : (
                <p className="font-black text-slate-800 text-lg">{user?.mobile || 'Not provided'}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="bg-gradient-to-br from-purple-50 to-transparent p-6 rounded-2xl border border-purple-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Mail size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email</p>
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="font-black text-slate-800 text-lg border border-purple-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                  placeholder="your.email@example.com"
                />
              ) : (
                <p className="font-black text-slate-800 text-lg break-all">{user?.email || 'Not provided'}</p>
              )}
            </div>

            {/* Aadhaar Field - Never editable */}
            <div className="bg-gradient-to-br from-rose-50 to-transparent p-6 rounded-2xl border border-rose-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <CreditCard size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Aadhaar</p>
              </div>
              <p className="font-black text-slate-800 text-lg">{user?.aadhaar ? `**** **** ${user.aadhaar.slice(-4)}` : 'Not provided'}</p>
            </div>

            {/* Hours Field */}
            <div className="bg-gradient-to-br from-cyan-50 to-transparent p-6 rounded-2xl border border-cyan-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <Clock size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Operating Hours</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedHours}
                  onChange={(e) => setEditedHours(e.target.value)}
                  className="font-black text-slate-800 text-lg border border-cyan-200 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
                  placeholder="e.g. 08:00 AM - 08:00 PM"
                />
              ) : (
                <p className="font-black text-slate-800 text-lg">{user?.operatingHours || '08:00 AM - 08:00 PM'}</p>
              )}
            </div>
          </div>
        </div>

      <button 
        onClick={onLogout}
        className="w-full bg-rose-50 text-rose-500 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-100 transition-all border border-rose-100"
      >
        <LogOut size={18} /> Logout from Seller Portal
      </button>
    </div>
  );
};

const Dashboard = ({ isLive, setIsLive }) => {
  const stats = [
    { label: 'Active Orders', value: '04', trend: '+2 today', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Earnings', value: '₹4,520', trend: '↑ 12%', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Customer Rating', value: '4.8', trend: 'Excellent', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  const topDishes = [
    { name: 'Poha with Sprouts', orders: 42, rating: 4.9, revenue: '₹7,560' },
    { name: 'Aloo Paratha', orders: 38, rating: 4.8, revenue: '₹6,840' },
    { name: 'Paneer Tikka Masala', orders: 35, rating: 4.7, revenue: '₹10,500' },
    { name: 'Chana Masala', orders: 28, rating: 4.6, revenue: '₹4,760' }
  ];

  const recentOrders = [
    { id: 1, customer: 'Anjali Sharma', dish: 'Poha with Sprouts', time: '09:00 AM', status: 'Completed', amount: '₹180' },
    { id: 2, customer: 'Rahul Varma', dish: 'Aloo Paratha', time: '10:30 AM', status: 'Completed', amount: '₹320' },
    { id: 3, customer: 'Priya Patel', dish: 'Paneer Tikka Masala', time: '11:15 AM', status: 'In Progress', amount: '₹450' },
    { id: 4, customer: 'Vikram Singh', dish: 'Chana Masala', time: '12:00 PM', status: 'Pending', amount: '₹280' }
  ];

  const customerFeedback = [
    { name: 'Meera Gupta', rating: 5, comment: 'Best quality food! Quick delivery too.', date: 'Today' },
    { name: 'Arjun Reddy', rating: 5, comment: 'Excellent taste and freshness', date: 'Yesterday' },
    { name: 'Deepak Kumar', rating: 4, comment: 'Good food, slightly late delivery', date: '2 days ago' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`p-8 rounded-[2.5rem] border ${isLive ? 'bg-white border-green-50 shadow-sm' : 'bg-rose-50 border-rose-100'} transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLive ? 'bg-green-50 text-[#4B7C4B]' : 'bg-rose-100 text-rose-600'}`}>
              <Power size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{isLive ? 'Your Kitchen is Open' : 'Kitchen Currently Offline'}</h3>
              <p className="text-sm text-slate-500 font-medium">Your profile is {isLive ? 'visible to customers within 5km' : 'hidden from customers'}.</p>
            </div>
          </div>
          <button onClick={() => setIsLive(!isLive)} className={`w-14 h-8 rounded-full transition-all relative ${isLive ? 'bg-[#4B7C4B]' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isLive ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}>
              <s.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{s.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{s.value}</span>
              <span className="text-xs font-bold text-emerald-600">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Dishes */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ChefHat size={24} className="text-[#4B7C4B]" /> Top Performing Dishes
        </h3>
        <div className="space-y-3">
          {topDishes.map((dish, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <p className="font-bold text-slate-800">{dish.name}</p>
                <p className="text-xs text-slate-400 font-bold">⭐ {dish.rating}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{dish.revenue}</p>
                <p className="text-xs text-slate-400 font-bold">{dish.orders} orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingBag size={24} className="text-[#4B7C4B]" /> Recent Orders
        </h3>
        <div className="space-y-3">
          {recentOrders.map((order, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-50">
              <div className="flex-1">
                <p className="font-bold text-slate-800">{order.customer}</p>
                <p className="text-xs text-slate-400 font-bold">{order.dish} at {order.time}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.status}
                </span>
                <p className="font-bold text-slate-800 mt-1">{order.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Feedback */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Award size={24} className="text-[#4B7C4B]" /> Customer Feedback
        </h3>
        <div className="space-y-4">
          {customerFeedback.map((feedback, i) => (
            <div key={i} className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-transparent border border-amber-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-800">{feedback.name}</p>
                  <p className="text-xs text-slate-400">{feedback.date}</p>
                </div>
                <span className="text-lg">{'⭐'.repeat(feedback.rating)}</span>
              </div>
              <p className="text-sm text-slate-600 italic">{`\\\"\\${feedback.comment}\\\"}`}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LOGIN PAGE ---
const LoginPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    aadhaar: ''
  });
  const [aadhaarInput, setAadhaarInput] = useState('');

  // Check for existing user on component mount
  useEffect(() => {
    console.log('LoginPage mounted, checking for existing user...');
    const localUser = getUserData();
    if (localUser && localUser.aadhaar) {
      console.log('Found existing user in localStorage, logging in...');
      onLogin(localUser);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTraditionalAuth = async (e) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Sign up flow with Firebase
        if (!formData.name || !formData.email || !formData.password || !formData.mobile || !formData.aadhaar) {
          alert('Please fill all fields including Aadhaar number');
          return;
        }
        
        if (formData.password.length < 6) {
          alert('Password must be at least 6 characters long');
          return;
        }
        
        if (formData.mobile.length !== 10) {
          alert('Please enter a valid 10-digit mobile number');
          return;
        }
        
        if (formData.aadhaar.length !== 12) {
          alert('Please enter a valid 12-digit Aadhaar number');
          return;
        }
        
        try {
          // Create Firebase user
          console.log('Creating user with email:', formData.email);
          const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          const firebaseUser = userCredential.user;
          console.log('User created:', firebaseUser.uid);
          
          // Update display name
          await updateProfile(firebaseUser, {
            displayName: formData.name
          });
          
          // Prepare user data
          const userData = {
            uid: firebaseUser.uid,
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            aadhaar: formData.aadhaar,
            loginMethod: 'email',
            joinedDate: new Date().toLocaleDateString()
          };
          
          // Save to localStorage immediately
          saveUserData(userData);
          
          // Log in the user immediately
          onLogin(userData);
          
          // Save to Firestore in background (non-blocking)
          saveUserToFirestore(firebaseUser.uid, userData).catch(err => {
            console.warn('Firestore save failed, but user is logged in:', err);
          });
          
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            alert('This email is already registered. Please login instead.');
            // Automatically switch to login mode
            setIsSignUp(false);
          } else if (authError.code === 'auth/weak-password') {
            alert('Password is too weak. Please use at least 6 characters.');
          } else if (authError.code === 'auth/invalid-email') {
            alert('Invalid email address.');
          } else {
            alert('Sign up failed: ' + authError.message);
          }
          return;
        }
        
      } else {
        // Login flow with Firebase
        if (!formData.email || !formData.password) {
          alert('Please enter email and password');
          return;
        }
        
        try {
          // Sign in with Firebase
          console.log('Logging in with email:', formData.email);
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const firebaseUser = userCredential.user;
          console.log('Firebase auth successful');
          
          // Check if account exists in localStorage (might have been created via Google Sign-in)
          const existingLocal = getUserData();
          
          // Create user data object
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || existingLocal?.name || formData.name || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            mobile: existingLocal?.mobile || formData.mobile || '',
            aadhaar: existingLocal?.aadhaar || formData.aadhaar || '',
            loginMethod: 'email',
            joinedDate: existingLocal?.joinedDate || new Date().toLocaleDateString()
          };
          
          // If email matches existing account, merge them
          if (existingLocal && existingLocal.email === firebaseUser.email) {
            console.log('✓ Merging with existing account (same email)');
            const mergedData = {
              ...existingLocal,  // Keep all existing data (from Google login if any)
              uid: firebaseUser.uid,  // Update to email/password Firebase uid
              loginMethod: 'email',  // Update login method
              email: firebaseUser.email
            };
            saveUserData(mergedData);
            onLogin(mergedData);
            
            // Sync to Firestore in background
            saveUserToFirestore(firebaseUser.uid, mergedData).catch(err => {
              console.warn('Firestore sync failed:', err);
            });
          } else {
            // No existing local account - save normally
            saveUserData(userData);
            onLogin(userData);
            
            // Update from Firestore in background if it exists
            getUserFromFirestore(firebaseUser.uid).then(firestoreData => {
              if (firestoreData) {
                console.log('Updated user with Firestore data');
                const updated = { ...firestoreData, uid: firebaseUser.uid };
                saveUserData(updated);
              }
            }).catch(err => {
              console.log('Firestore data not found, using basic profile');
            });
          }
          
        } catch (authError) {
          if (authError.code === 'auth/user-not-found') {
            alert('No account found with this email. Please sign up first.');
            // Automatically switch to signup mode
            setIsSignUp(true);
          } else if (authError.code === 'auth/wrong-password') {
            alert('Incorrect password. Please try again.');
          } else if (authError.code === 'auth/invalid-credential') {
            alert('Invalid email or password. Please try again.');
          } else {
            alert('Login failed: ' + authError.message);
          }
          return;
        }
      }
    } catch (error) {
      console.error('Unexpected Authentication Error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in with popup...');
      console.log('Firebase auth instance:', auth);
      console.log('Google provider:', googleProvider);
      
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      // Use popup instead of redirect for better compatibility
      console.log('Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result && result.user) {
        const user = result.user;
        console.log('✓ Google sign-in successful:', user.email);
        
        // Check localStorage FIRST by EMAIL to handle account merging
        console.log('Checking for existing account by email...');
        const localUser = getUserData();
        console.log('localStorage user found:', localUser?.email);
        
        // If account exists with SAME EMAIL - merge and log in (regardless of login method)
        if (localUser && localUser.email === user.email) {
          console.log('✓ Account exists with same email - merging login methods');
          const mergedData = {
            ...localUser,  // Keep all existing data (aadhaar, etc)
            uid: user.uid,  // Update to Google's Firebase uid
            photoURL: user.photoURL || localUser.photoURL || '',
            loginMethod: 'google'  // Update login method to Google
          };
          saveUserData(mergedData);
          
          // Sync merged account to Firestore in background
          saveUserToFirestore(user.uid, mergedData).catch(err => 
            console.warn('Background Firestore sync failed:', err)
          );
          
          onLogin(mergedData);
        } else {
          // Account doesn't exist with this email - check Firestore
          console.log('No local account with this email, checking Firestore...');
          
          // Create basic user data for new/existing user
          const userData = {
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            photoURL: user.photoURL || '',
            mobile: '',
            loginMethod: 'google',
            joinedDate: new Date().toLocaleDateString()
          };
          
          try {
            const existingUser = await Promise.race([
              getUserFromFirestore(user.uid),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firestore timeout')), 2000)
              )
            ]);
            
            if (existingUser && existingUser.aadhaar) {
              console.log('✓ Existing Google user found in Firestore');
              const completeData = { ...existingUser, uid: user.uid, photoURL: user.photoURL };
              saveUserData(completeData);
              onLogin(completeData);
            } else {
              // New user - show Aadhaar modal
              console.log('→ New Google user - showing Aadhaar modal');
              setGoogleUserData(userData);
              setShowAadhaarModal(true);
            }
          } catch (err) {
            // Firestore timeout or error - show Aadhaar modal for new user
            console.log('→ Firestore check failed/timeout, treating as new user:', err.message);
            setGoogleUserData(userData);
            setShowAadhaarModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error Details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      
      if (error.code === 'auth/configuration-not-found') {
        alert('Firebase is not configured. Please check your .env file:\n- VITE_FIREBASE_AUTH_DOMAIN\n- VITE_FIREBASE_API_KEY\n- VITE_FIREBASE_APP_ID');
      } else if (error.code === 'auth/popup-blocked') {
        alert('Google sign-in popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/invalid-api-key') {
        alert('Firebase API Key is invalid. Check your .env file.');
      } else if (error.code === 'auth/network-request-failed') {
        console.error('Network Error:', error);
        alert('Network error: Cannot connect to Firebase/Google servers.\n\nTroubleshooting:\n1. Check your internet connection\n2. Verify Firebase credentials in .env file\n3. Try refreshing the page or clearing browser cache\n4. Check if Google API is enabled in Firebase Console');
      } else {
        alert('Google sign-in failed: ' + error.message + '\n\nError Code: ' + error.code);
      }
    }
  };

  const handleAadhaarSubmit = async () => {
    if (!aadhaarInput || aadhaarInput.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    try {
      // Ensure email is included
      const userData = {
        ...googleUserData,
        aadhaar: aadhaarInput,
        mobile: googleUserData?.mobile || '',
        joinedDate: new Date().toLocaleDateString(),
        email: googleUserData?.email || ''  // Explicitly ensure email is saved
      };
      
      console.log('Aadhaar Submit - Full userData being saved:', userData);
      console.log('Email field:', userData.email);
      console.log('Aadhaar field:', userData.aadhaar);
      
      // Save to localStorage instantly
      saveUserData(userData);
      console.log('✓ User saved to localStorage');
      
      // Verify it was saved
      const savedData = JSON.parse(localStorage.getItem('nutrioUser'));
      console.log('Verified localStorage content:', savedData);
      console.log('Verified email in localStorage:', savedData?.email);
      console.log('Verified aadhaar in localStorage:', savedData?.aadhaar);
      
      // Close modal and log in immediately - don't wait for Firestore
      setShowAadhaarModal(false);
      setAadhaarInput('');
      onLogin(userData);
      console.log('✓ User logged in instantly after Aadhaar verification');
      
      // Save to Firestore in background (non-blocking)
      if (googleUserData?.uid) {
        console.log('Background: Saving to Firestore...');
        saveUserToFirestore(googleUserData.uid, userData)
          .then(() => console.log('✓ Background: User saved to Firestore'))
          .catch(err => console.warn('⚠ Background: Firestore save failed:', err));
      }
    } catch (error) {
      console.error('Error during Aadhaar submission:', error);
      alert('Failed to save user data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-cyan-50 to-emerald-50 relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full mix-blend-screen blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-screen blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200/30 rounded-full mix-blend-screen blur-3xl animate-pulse animation-delay-4000"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#4B7C4B] mb-2">Nutrio Kitchen</h1>
          <p className="text-sm text-slate-500 font-medium">Seller Dashboard Login</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-sm text-slate-500">Enter your details to {isSignUp ? 'sign up' : 'sign in'}</p>
          </div>

          <form onSubmit={handleTraditionalAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">Full Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                    placeholder="Radha Kumar"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                  placeholder="radha@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                      placeholder="+91 98765 43210"
                      required={isSignUp}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <CreditCard size={14} />
                    Aadhaar Number (Required)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                      placeholder="1234 5678 9012"
                      maxLength="12"
                      required={isSignUp}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-1">Your Aadhaar is required for verification</p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-200"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white border-2 border-slate-200 py-4 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* Aadhaar Modal for Google Sign-In */}
      {showAadhaarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Aadhaar Verification Required</h3>
              <p className="text-sm text-slate-500">Please provide your Aadhaar number to complete registration</p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">Aadhaar Number</label>
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium text-center tracking-wider text-lg"
                placeholder="1234 5678 9012"
                maxLength="12"
              />
              <p className="text-xs text-slate-500 mt-2 text-center">Your Aadhaar is securely stored and used for verification only</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAadhaarModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAadhaarSubmit}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all"
              >
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const manuallyLoggedIn = useRef(false);

  useEffect(() => {
    // Check localStorage immediately for faster restoration (no async needed)
    const localData = getUserData();
    if (localData && localData.uid) {
      console.log('Session restored from localStorage:', localData.email);
      setUser(localData);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Still set up the auth listener to sync any external changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) {
          console.log('User logged out externally');
          clearUserData();
          setUser(null);
          setIsAuthenticated(false);
        }
      });
      
      return () => unsubscribe();
    }

    // If no localStorage data, wait for Firebase to check session
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth state check timeout - proceeding with unauthenticated state');
      setIsLoading(false);
      setIsAuthenticated(false);
    }, 5000);

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(loadingTimeout);
      console.log('onAuthStateChanged fired, firebaseUser:', firebaseUser?.email || 'null', 'manuallyLoggedIn:', manuallyLoggedIn.current);
      
      // If user was manually logged in, skip this auth state change
      if (manuallyLoggedIn.current && firebaseUser) {
        console.log('Skipping onAuthStateChanged - user already manually logged in');
        setIsLoading(false);
        return;
      }
      
      if (firebaseUser) {
        // User is signed in with Firebase
        try {
          // Try to get from Firestore for updated data
          const firestoreData = await getUserFromFirestore(firebaseUser.uid);
          if (firestoreData) {
            console.log('Using Firestore data for user:', firestoreData.email);
            const completeUserData = {
              ...firestoreData,
              uid: firebaseUser.uid,
              photoURL: firebaseUser.photoURL
            };
            saveUserData(completeUserData);
            setUser(completeUserData);
            setIsAuthenticated(true);
          } else {
            // No Firestore data - create basic profile
            console.warn('No Firestore data found, creating basic user profile');
            const basicUserData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              mobile: '',
              loginMethod: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
              joinedDate: new Date().toLocaleDateString()
            };
            saveUserData(basicUserData);
            setUser(basicUserData);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error in onAuthStateChanged:', error);
          // Create minimal user object when Firestore fails
          const basicUserData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            mobile: '',
            loginMethod: 'email',
            joinedDate: new Date().toLocaleDateString()
          };
          saveUserData(basicUserData);
          setUser(basicUserData);
          setIsAuthenticated(true);
        }
      } else {
        // No Firebase user
        console.log('No Firebase user found - user is logged out');
        clearUserData();
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const handleLogin = (userData) => {
    console.log('handleLogin called with:', userData.email);
    manuallyLoggedIn.current = true;
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
    // Reset manual flag after a short delay
    setTimeout(() => {
      manuallyLoggedIn.current = false;
    }, 1000);
  };

  const handleLogout = async () => {
    manuallyLoggedIn.current = false;
    try {
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    // Clear local data
    clearUserData();
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUserData) => {
    console.log('handleUpdateUser called with:', updatedUserData);
    setUser(updatedUserData);
    saveUserData(updatedUserData);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${THEME.bg} flex font-sans`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className={`flex-1 transition-all duration-300 p-12 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard isLive={isLive} setIsLive={setIsLive} />}
          {activeTab === 'menu' && <DailyMenu user={user} />}
          {activeTab === 'orders' && <LiveOrders />}
          {activeTab === 'finances' && <Finances />}
          {activeTab === 'profile' && <ProfilePage user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />}
        </div>
      </main>
    </div>
  );
};

export default App;
