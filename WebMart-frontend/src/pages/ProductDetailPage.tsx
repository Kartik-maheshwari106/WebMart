import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Loader2, Trash2, Image as ImageIcon, Edit3 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, loading: authLoading, user } = useAuth(); 
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [avgRating, setAvgRating] = useState<string>("0.0");
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });


  const getProductImages = (prod: any) => {
    if (!prod) return [];
    let urls: string[] = [];


    if (Array.isArray(prod.images) && prod.images.length > 0) {
      urls = prod.images;
    } 

    else if (prod.imageUrls && typeof prod.imageUrls === 'string') {
      urls = prod.imageUrls.split(',').map(s => s.trim()).filter(s => s !== "");
    }

    return urls;
  };

  const productImages = getProductImages(product);

  useEffect(() => {
    const fetchAllData = async () => {
      if (authLoading) return;
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/details/${id}`),
          api.get(`/reviews/product/${id}`).catch(() => ({ data: [] }))
        ]);

        if (prodRes.data && prodRes.data.product) {
          setProduct(prodRes.data.product);
          setAvgRating(prodRes.data.averageRating || "0.0");
        }
        if (revRes.data) {
          setReviews(revRes.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Product load nahi ho paya");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, authLoading]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { 
      toast.error('Please login to post a review'); 
      return; 
    }
    try {
      const res = await api.post('/reviews/add', { productId: id, ...newReview });
      toast.success('Review posted!');
      setNewReview({ rating: 5, comment: '' });
      setReviews([res.data, ...reviews]);
    } catch (err: any) {
      toast.error(err.response?.data || 'Failed to post review');
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!window.confirm("Want to delete this review?")) return;
    try {
      await api.delete(`/reviews/delete/${reviewId}`);
      toast.success("Review deleted");
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err: any) {
      toast.error(err.response?.data || 'Failed to delete review');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!product) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Product Not Found</h2></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* --- Image Gallery Section --- */}
        <div className="space-y-4">
          <div className="group relative aspect-square overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl flex items-center justify-center">
            {productImages.length > 0 ? (
              <img 
                src={productImages[selectedImage]} 
                alt={product.name} 
                className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 opacity-10" />
                <p className="text-sm italic mt-2 uppercase font-black tracking-tighter opacity-30">No visuals found</p>
              </div>
            )}
          </div>

          {/* Thumbnails Container */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar px-1">
              {productImages.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(i)} 
                  className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 transition-all duration-300 ${
                    selectedImage === i 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-white bg-muted/50 grayscale-[50%] hover:grayscale-0'
                  }`}
                >
                  <img src={img} alt={`preview-${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Product Details Section --- */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary italic">
              {product.category}
            </span>
            <h1 className="font-heading text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
               <div className="flex items-center bg-yellow-400 px-2 py-0.5 rounded-lg">
                  <Star className="h-4 w-4 fill-white text-white mr-1" />
                  <span className="text-xs font-black text-white">{avgRating}</span>
               </div>
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                 {reviews.length} Reviews
               </span>
               <span className="text-muted-foreground">|</span>
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                 Seller: {product.sellerName || 'WebMart'}
               </span>
            </div>
          </div>

          <div className="space-y-4">
             <p className="text-5xl font-black italic tracking-tighter text-primary">
               ₹{product.price?.toLocaleString()}
             </p>
             <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-100 italic text-slate-600 font-medium leading-relaxed">
               "{product.description}"
             </div>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {product.stock > 0 ? `Ready to Ship (${product.stock} units)` : 'Sold Out'}
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            {user?.role === 'SELLER' ? (
              user.email === product.sellerEmail ? (
                <Link
                  to={`/seller/inventory`}
                  className="flex w-full items-center justify-center gap-3 rounded-[30px] bg-orange-500 py-6 font-black uppercase tracking-widest text-white hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:translate-y-1"
                >
                  <Edit3 className="h-6 w-6" /> Manage Your Listing
                </Link>
              ) : (
                <div className="text-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Buying is disabled for Sellers. Access restricted.
                </div>
              )
            ) : (
              <button
                onClick={() => addToCart({ ...product, id: product.id })}
                disabled={product.stock <= 0}
                className="flex w-full items-center justify-center gap-3 rounded-[30px] bg-primary py-6 font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 active:translate-y-1"
              >
                <ShoppingCart className="h-6 w-6" /> Add to Shopping Cart
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex flex-col gap-1 rounded-2xl border-2 border-slate-50 p-4 bg-white hover:border-primary/20 transition-all">
              <Truck className="h-5 w-5 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-wider">Fast Delivery</p>
              <p className="text-[10px] text-muted-foreground">Free on orders above ₹999</p>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border-2 border-slate-50 p-4 bg-white hover:border-primary/20 transition-all">
              <Shield className="h-5 w-5 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-wider">Secure Deal</p>
              <p className="text-[10px] text-muted-foreground">1 Year WebMart Protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Reviews Section --- */}
      <section className="mt-20">
        <div className="flex items-center gap-4 mb-10">
           <h2 className="font-heading text-3xl font-black uppercase italic tracking-tighter text-slate-900">The Feedback Loop</h2>
           <div className="h-1 flex-grow bg-slate-100 rounded-full" />
        </div>
        
        <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <form onSubmit={submitReview} className="rounded-[40px] border-4 border-slate-50 bg-white p-8 space-y-5 shadow-sm sticky top-24">
                  <h3 className="font-black uppercase italic text-xl tracking-tighter">Voice your opinion</h3>
                  {isAuthenticated ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rating Score</label>
                        <select 
                          value={newReview.rating} 
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} 
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-primary/30"
                        >
                          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star Experience</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Your Experience</label>
                         <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Drop your thoughts here..."
                            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-primary/30 min-h-[140px] resize-none"
                            required
                          />
                      </div>
                      <button type="submit" className="w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-primary transition-all">
                        Post Review
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Unauthorized. <Link to="/login" className="text-primary underline">Sign in</Link> to review.
                      </p>
                    </div>
                  )}
                </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-slate-50 rounded-[40px] text-slate-300">
                        <p className="font-black uppercase italic tracking-widest text-sm">Silence is loud here. Be the first!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="rounded-[30px] border-2 border-slate-50 p-8 bg-white shadow-sm relative group hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-0.5 bg-slate-50 p-1.5 rounded-lg">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{review.userName}</span>
                                </div>
                                {user?.email === review.userEmail && (
                                    <button 
                                        onClick={() => deleteReview(review.id)}
                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-500 leading-relaxed italic">"{review.comment}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;