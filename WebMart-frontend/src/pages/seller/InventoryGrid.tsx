import React from 'react';
import { Trash2, Edit3 } from 'lucide-react';


interface Product {
  id: number;
  name: string;
  category: string;
  price: number | string;
  stock: number;
  imageUrls?: string;
}

interface InventoryGridProps {
  products: Product[]; // 🚩 Array of Product
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
      {products.map((p) => (
        <div 
          key={p.id} 
          className="group border bg-white p-6 rounded-[45px] shadow-sm hover:shadow-2xl transition-all duration-300 border-slate-100"
        >
          {/* Product Image Section */}
          <div className="h-60 bg-slate-50 rounded-[35px] overflow-hidden mb-5 border relative">
            <img 
              src={p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls.split(',')[0] : 'https://via.placeholder.com/300'} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              alt={p.name} 
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-sm shadow-lg border border-white/50 text-primary">
              ₹{p.price}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-2 px-2">
            <h3 className="font-black text-xl uppercase truncate text-slate-800 tracking-tighter">
              {p.name}
            </h3>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-full text-slate-500">
                {p.category}
              </span>
              <span className={`text-[10px] font-black uppercase ${Number(p.stock) < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                Stock: {p.stock}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => onEdit(p)} 
              className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Edit3 size={14} /> Edit Item
            </button>
            <button 
              onClick={() => onDelete(p.id)} 
              className="px-5 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryGrid;