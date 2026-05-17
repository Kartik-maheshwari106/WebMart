import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, IndianRupee, PackageSearch, ShoppingCart, ImageOff, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';


const ProductCard = ({ product }: { product: any }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);


  const getThumbnail = () => {
    if (!product) return null;
    

    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    

    if (product.imageUrls && typeof product.imageUrls === 'string') {
      const urls = product.imageUrls.split(',').map((u: string) => u.trim()).filter((u: string) => u !== "");
      return urls.length > 0 ? urls[0] : null;
    }
    
    return null;
  };
  
  const thumbnail = getThumbnail();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (isAdding) return;
    setIsAdding(true);
    try {

      await addToCart({ ...product, imageUrl: thumbnail });
    } catch (err) {
      console.error("Card Add Error:", err);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[30px] border bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-slate-100">
      <Link to={`/product/${product.id}`} className="aspect-square overflow-hidden bg-slate-50 relative flex items-center justify-center">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={product.name} 
            className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="flex flex-col items-center opacity-20">
            <ImageOff className="h-10 w-10 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">No Visual</span>
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-xl bg-white/80 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-100 text-primary italic">
          {product.category}
        </div>
      </Link>
      
      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-1 text-sm font-black text-slate-800 uppercase italic tracking-tight">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-black text-primary italic tracking-tighter">₹{product.price?.toLocaleString()}</p>
        </div>
        
        <button
          disabled={isAdding || product.stock <= 0}
          onClick={handleAddToCart}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-[0.1em] transition-all shadow-xl active:scale-95 ${
            product.stock <= 0 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            : isAdding 
              ? 'bg-slate-400 text-white opacity-70' 
              : 'bg-primary text-white shadow-primary/20 hover:opacity-90'
          }`}
        >
          {product.stock <= 0 ? 'Out of Stock' : (
            <>
              <ShoppingCart className="h-4 w-4" /> 
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty'];

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { loading: authLoading } = useAuth(); 
  const [products, setProducts] = useState<any[]>([]); 
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000); 

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      if (authLoading) return;
      setLoading(true);
      try {
        let endpoint = '/products/all'; 
        if (searchQuery) endpoint = `/products/search?q=${encodeURIComponent(searchQuery)}`;
        else if (activeCategory !== 'All') endpoint = `/products/filter/category?category=${encodeURIComponent(activeCategory)}`;

        const res = await api.get(endpoint);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Fetch Error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, activeCategory, authLoading]);

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchPrice = p.price >= minPrice && p.price <= maxPrice;
    return matchCategory && matchPrice;
  });

  const resetFilters = () => {
    setActiveCategory('All');
    setMinPrice(0);
    setMaxPrice(100000);
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative bg-slate-900 px-4 py-32 text-center text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 border border-white/10 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-primary animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cyber Season Collection</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter italic md:text-9xl uppercase">
                WebMart <span className="text-primary not-italic font-thin">X</span>
            </h1>
            <p className="mx-auto max-w-lg text-slate-400 font-bold text-lg uppercase tracking-widest leading-relaxed">
                Premium Grade Inventory Curated for You.
            </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl py-6 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-white text-primary shadow-md scale-105' 
                    : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border-2 border-slate-50 shadow-sm w-full lg:w-auto">
            <div className="flex items-center gap-2 pl-3 border-r-2 border-slate-50 pr-4">
              <IndianRupee className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Range</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-24 rounded-xl border-none bg-slate-50 px-3 py-2 text-xs font-black outline-none text-center focus:ring-2 ring-primary/20"
              />
              <span className="text-slate-200 font-black uppercase text-[10px]">to</span>
              <input 
                type="number" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 rounded-xl border-none bg-slate-50 px-3 py-2 text-xs font-black outline-none text-center focus:ring-2 ring-primary/20"
              />
            </div>
            <button onClick={resetFilters} className="p-2.5 bg-slate-50 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-slate-50 pb-10">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-primary" />
              {searchQuery ? `Searching: "${searchQuery}"` : 'Marketplace'}
            </h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-12 h-1 bg-primary rounded-full"></span>
                Fresh Drops Every Hour
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-[30px] border-2 border-white shadow-inner">
             <div className="text-right px-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Stock</p>
                <p className="text-xl font-black italic">{filtered.length} Units</p>
             </div>
             <div className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/30">
                <PackageSearch className="h-6 w-6" />
             </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
            {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-square animate-pulse rounded-[40px] bg-slate-50 border-2 border-slate-100" />
                  <div className="h-6 w-3/4 bg-slate-50 animate-pulse rounded-lg" />
                  <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
                </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center rounded-[60px] bg-slate-50 border-4 border-dashed border-white flex flex-col items-center">
            <PackageSearch className="h-20 w-20 text-slate-200 mb-6" />
            <h3 className="text-3xl font-black text-slate-400 italic uppercase tracking-tighter">Zero results found</h3>
            <button onClick={resetFilters} className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl">Reset Inventory</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;