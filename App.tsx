
import React, { useState, useEffect } from 'react';
import { Product, Order, View } from './types';
import { storageService } from './services/storageService';
import ProductGallery from './components/ProductGallery';
import SmartScanner from './components/SmartScanner';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import VoucherPreview from './components/VoucherPreview';
import Settings from './components/Settings';
import { Language, translations } from './i18n';

const App: React.FC = () => {
  const [view, setView] = useState<View>('gallery');
  const [lang, setLang] = useState<Language>('bn');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const t = translations[lang];

  useEffect(() => {
    setProducts(storageService.getProducts());
    setOrders(storageService.getOrders());
  }, []);

  const handleAddProduct = (p: Product) => {
    storageService.saveProduct(p);
    setProducts([...products, p]);
  };

  const handleUpdateProduct = (p: Product) => {
    storageService.updateProduct(p);
    setProducts(products.map(prod => prod.id === p.id ? p : prod));
  };

  const handleDeleteProduct = (id: string) => {
    storageService.deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleCreateOrder = (order: Order) => {
    storageService.saveOrder(order);
    setOrders(storageService.getOrders());
    setProducts(storageService.getProducts());
    setActiveOrder(order);
    setView('voucher');
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'pending' | 'cleared') => {
    storageService.updateOrderStatus(orderId, status);
    const updatedOrders = storageService.getOrders();
    setOrders(updatedOrders);
    
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, status });
    }
  };

  const handleDeleteOrder = (id: string) => {
    storageService.deleteOrder(id);
    setOrders(storageService.getOrders());
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'bn' : 'en');
  };

  const renderView = () => {
    const goHome = () => setView('gallery');

    switch (view) {
      case 'gallery':
        return <ProductGallery 
          products={products} 
          onAddProduct={handleAddProduct} 
          onUpdateProduct={handleUpdateProduct} 
          onDeleteProduct={handleDeleteProduct}
          lang={lang}
        />;
      case 'scanner':
        return <SmartScanner 
          products={products} 
          onSelectProduct={(p) => setView('gallery')} 
          onBack={goHome}
          lang={lang}
        />;
      case 'order':
        return <OrderForm 
          products={products} 
          onSubmit={handleCreateOrder} 
          onBack={goHome}
          lang={lang}
        />;
      case 'history':
        return <OrderHistory 
          orders={orders} 
          onViewVoucher={(o) => {
            setActiveOrder(o);
            setView('voucher');
          }} 
          onUpdateStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onBack={goHome}
          lang={lang}
        />;
      case 'voucher':
        return activeOrder ? <VoucherPreview 
          order={activeOrder} 
          onBack={() => setView('history')} 
          lang={lang}
        /> : null;
      case 'settings':
        return <Settings 
          lang={lang} 
          onLanguageToggle={toggleLang} 
          onBack={goHome}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#FDFCF0]">
      {/* Header - Fixed at Top */}
      <header className="w-full pt-[env(safe-area-inset-top)] pb-4 px-6 bg-white/30 backdrop-blur-xl z-30 border-b border-white/20 flex-shrink-0">
        <div className="w-full max-w-md mx-auto mt-4">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-500 to-blue-400 bg-clip-text text-transparent">
            মুক্ত বিলাস
          </h1>
        </div>
      </header>

      {/* Main Content - Independent Scroll Area */}
      <main className="flex-1 overflow-y-auto w-full no-scrollbar pb-32">
        <div className="w-full max-w-md mx-auto px-5 py-6">
          {renderView()}
        </div>
      </main>

      {/* Navigation - Locked at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-[env(safe-area-inset-bottom)] pt-2 z-50 pointer-events-none flex justify-center">
        <nav className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] premium-shadow px-2 py-3 flex justify-around items-center mb-6 pointer-events-auto">
          <NavButton active={view === 'gallery'} onClick={() => setView('gallery')} icon="gallery" label={t.gallery} />
          <NavButton active={view === 'scanner'} onClick={() => setView('scanner')} icon="search" label={t.search} />
          <NavButton active={view === 'order'} onClick={() => setView('order')} icon="order" label={t.order} />
          <NavButton active={view === 'history'} onClick={() => setView('history')} icon="history" label={t.records} />
          <NavButton active={view === 'settings'} onClick={() => setView('settings')} icon="settings" label={t.settings} />
        </nav>
      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  const getIcon = () => {
    switch (icon) {
      case 'gallery': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />;
      case 'search': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
      case 'order': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />;
      case 'history': return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />;
      case 'settings': return (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      );
      default: return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-500 ${active ? 'scale-110' : 'text-gray-400 hover:text-teal-400'}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1 transition-all duration-300 ${active ? 'bg-teal-500/10 shadow-inner' : 'bg-transparent'}`}>
        <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-teal-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {getIcon()}
        </svg>
      </div>
      <span className={`text-[8px] font-black tracking-widest uppercase transition-colors duration-300 ${active ? 'text-teal-600' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
};

export default App;
