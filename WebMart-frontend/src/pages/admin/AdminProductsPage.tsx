import React, { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, X, Search, Filter, 
  Tag, IndianRupee, Image as ImageIcon,
  AlertTriangle, Box, CheckCircle2, Loader2, Database,
  Sparkles, PackageSearch, Building2
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', price: '', category: '', stock: '', description: '', image: '' };

const AdminProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/all');
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Master Catalog Offline");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { 
    setForm(emptyForm); 
    setEditId(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (p: any) => { 
    setForm({ 
      name: p.name, 
      price: String(p.price), 
      category: p.category, 
      stock: String(p.stock), 
      description: p.description || '', 
      image: p.imageUrls || p.image || '' 
    }); 
    setEditId(p.id); 
    setModalOpen(true); 
  };

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);

  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('price', form.price);
  formData.append('category', form.category);
  formData.append('stock', form.stock);
  formData.append('description', form.description);
  

  if (form.image) {
      formData.append('imageUrls', form.image); 
  }

  try {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    if (editId) {
      await api.put(`/products/update/${editId}`, formData, config);
      toast.success('Inventory Updated');
    } else {
      await api.post('/products/add', formData, config);
      toast.success('Product Published');
    }
    setModalOpen(false);
    fetchProducts();
  } catch (err: any) {
    console.error("Sync Error:", err.response?.data);
    toast.error(err.response?.data || 'Database Sync Failed');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/delete/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Resource Purged');
      setDeleteId(null);
    } catch (err) {
      toast.error('Deletion Refused by Server');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900 text-white">
            <Box size={14} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Inventory Management</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tightest">
            Master <span className="text-primary italic">Catalog.</span>
          </h1>
        </div>

        <button 
          onClick={openAdd} 
          className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl hover:bg-primary transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Deployed New Item
        </button>
      </div>

      {/* --- SEARCH --- */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="Filter by name, category, or vendor..."
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-2 border-slate-100 bg-white text-sm font-bold focus:border-primary/20 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- DATA TABLE --- */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 bg-slate-50/50 rounded-[3rem]">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-100 rounded-[3rem]">
          <PackageSearch size={48} className="text-slate-200" />
          <p className="text-slate-400 font-bold">No products found in the database.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Blueprint</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source Vendor</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Price</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Vitality</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                          {p.imageUrls || p.image ? (
                            <img src={p.imageUrls || p.image} className="h-full w-full object-cover" alt="" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">REF: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* 🚩 NEW VENDOR COLUMN */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                          <Building2 size={14} />
                        </div>
                        <span className="text-xs font-black text-slate-700 tracking-tight italic">
                          {p.sellerName || 'Direct WebMart'}
                        </span>
                      </div>
                    </td>

                    <td className="px-10 py-6">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center font-black text-slate-900 text-sm italic">
                      ₹{p.price?.toLocaleString()}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${p.stock < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min((p.stock / 20) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-black uppercase ${p.stock < 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {p.stock} Units
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => openEdit(p)} className="p-3 bg-white border border-slate-100 rounded-xl hover:text-primary hover:shadow-lg transition-all">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-3 bg-white border border-slate-100 rounded-xl hover:text-rose-500 hover:shadow-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL DRAWER --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative h-full w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 p-10 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic tracking-tighter">
                {editId ? 'Refine Entry.' : 'New Deployment.'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Product Identity</label>
                <input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-primary/20 transition-all" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Net Value (₹)</label>
                  <input 
                    type="number" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-primary/20" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Stock Unit</label>
                  <input 
                    type="number" 
                    value={form.stock} 
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                    className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-primary/20" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sector / Category</label>
                <input 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-primary/20" 
                  placeholder="Electronics, Footwear..."
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Visual Resource URL</label>
                <input 
                  value={form.image} 
                  onChange={(e) => setForm({ ...form, image: e.target.value })} 
                  className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-primary/20" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Technical Brief</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-primary/20 min-h-[120px] resize-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : editId ? 'Commit Changes' : 'Deploy Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-12 text-center max-w-md border border-slate-100 shadow-2xl scale-in-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tighter">Purge Resource?</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">This action will permanently remove the item from the global database.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Abort</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 shadow-lg transition-all active:scale-95">Purge Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;