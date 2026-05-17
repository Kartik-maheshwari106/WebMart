import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  Plus, 
  X, 
  ImageIcon, 
  Loader2, 
  Package,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import OverviewTable from './OverviewTable';
import InventoryGrid from './InventoryGrid';

interface ProductForm {
  name: string; 
  price: string; 
  category: string; 
  stock: string; 
  description: string; 
}

const emptyForm: ProductForm = { 
  name: '', 
  price: '', 
  category: '', 
  stock: '', 
  description: ''
};

const SellerProductsPage = () => {
  const { user } = useAuth();
  const location = useLocation(); 
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const isOverview = location.pathname === '/seller';

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      openModal();
      setSearchParams({}); 
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await api.get(`/products/all`); 
      const myProducts = res.data.filter((p: any) => 
        p.sellerEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      setProducts(myProducts);
    } catch (err) {
      toast.error("Inventory load nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [user]);

  const openModal = (p: any = null) => {
    if (p) {
      setEditId(p.id);
      setForm({
        name: p.name,
        price: String(p.price),
        stock: String(p.stock),
        category: p.category,
        description: p.description
      });
      const urls = p.imageUrls ? p.imageUrls.split(',').filter((u: string) => u.trim() !== "") : [];
      setExistingImages(urls);
      setPreviews(urls);
      setSelectedFiles([]);
    } else {
      setEditId(null);
      setForm(emptyForm);
      setPreviews([]);
      setSelectedFiles([]);
      setExistingImages([]);
    }
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (previews.length + filesArray.length > 5) {
        toast.error("Bhai, max 5 images hi allow hain!");
        return;
      }
      setSelectedFiles(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = previews[index];
    if (existingImages.includes(imageToRemove)) {
      setExistingImages(prev => prev.filter(img => img !== imageToRemove));
    } else {
      const localFileIndex = index - existingImages.length;
      setSelectedFiles(prev => prev.filter((_, i) => i !== localFileIndex));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editId ? 'Updating...' : 'Publishing...');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    

    if (existingImages.length > 0) {
      existingImages.forEach(url => formData.append('images', url));
    } else {
      formData.append('images', ''); // Explicit empty if all deleted
    }


    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => {
        formData.append('files', file); 
      });
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editId) {
        await api.put(`/products/update/${editId}`, formData, config);
        toast.success('Listing updated!', { id: loadingToast });
      } else {
        await api.post('/products/add', formData, config);
        toast.success('Product published live!', { id: loadingToast });
      }
      
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Action Error:", err.response?.data);
      const errorMsg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : (err.response?.data?.message || "Kuch toh gadbad hai.");
      
      toast.error(errorMsg, { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bhai, pakka delete karna hai?")) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/products/delete/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Removed from shop');
    } catch (err) {
      toast.error("Delete fail ho gaya.");
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-primary">
      <Loader2 className="animate-spin h-10 w-10 mb-2" />
      <p className="font-black uppercase tracking-widest text-[10px]">Updating Dashboard...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
            {isOverview ? 'Business Overview' : 'Inventory'}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1 bg-slate-100 inline-block px-3 py-1 rounded-lg">
            {products.length} Products Live
          </p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-primary text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New Item
        </button>
      </div>

      {/* Grid or Table Section */}
      {products.length === 0 ? (
        <div className="text-center py-20 border-4 border-dashed border-slate-100 rounded-[50px] bg-white/50">
          <Package className="mx-auto h-16 w-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-400 uppercase italic">No products yet</h3>
        </div>
      ) : (
        isOverview ? (
          <OverviewTable products={products} onEdit={openModal} onDelete={handleDelete} />
        ) : (
          <InventoryGrid products={products} onEdit={openModal} onDelete={handleDelete} />
        )
      )}

      {/* Modal Section */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-white rounded-[50px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
                {editId ? 'Modify Listing' : 'Publish Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-4 bg-slate-100 rounded-full hover:bg-red-50 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1 block ml-2">Product Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none focus:border-primary/30" placeholder="e.g. Vintage Leather Jacket" required />
              </div>
              
              <div className="md:col-span-1">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1 block ml-2">Price (₹)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none focus:border-primary/30" required />
              </div>
              
              <div className="md:col-span-1">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1 block ml-2">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none focus:border-primary/30" required />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1 block ml-2">Category</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 font-bold outline-none focus:border-primary/30" placeholder="Electronics, Fashion, etc." required />
              </div>

              {/* Multi-Image Upload Logic */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1 block ml-2 flex items-center gap-2">
                  <ImageIcon size={14} /> Product Images (Max 5)
                </label>
                
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {previews.length < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/30 transition-all group">
                      <UploadCloud className="text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Upload</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-1 block ml-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 font-bold min-h-[140px] outline-none focus:border-primary/30" placeholder="Explain the features..." required />
              </div>

              <button type="submit" className="md:col-span-2 py-6 rounded-[30px] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:translate-y-[-4px] active:translate-y-0 transition-all">
                {editId ? 'Update Listing' : 'Publish to Shop'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;