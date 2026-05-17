import React from 'react';
import { ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const OverviewTable = ({ products, onEdit, onDelete }: { products: any[], onEdit: (p: any) => void, onDelete: (id: number) => void }) => {
  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] uppercase font-black text-slate-400 tracking-widest">
              <th className="p-6 border-b">Product Info</th>
              <th className="p-6 border-b">Category</th>
              <th className="p-6 border-b">Price</th>
              <th className="p-6 border-b">Stock Status</th>
              <th className="p-6 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      <img 
                        src={p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls.split(',')[0] : 'https://via.placeholder.com/100'} 
                        className="h-full w-full object-cover" 
                        alt={p.name} 
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 uppercase text-sm tracking-tighter">{p.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">ID: #{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">{p.category}</td>
                <td className="p-6 font-black text-slate-900">₹{p.price.toLocaleString()}</td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${p.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className={`text-[11px] font-black uppercase ${p.stock < 10 ? 'text-red-500' : 'text-slate-600'}`}>
                      {p.stock} Units
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/products/details/${p.id}`} className="p-3 bg-slate-100 rounded-xl hover:text-primary transition-colors">
                      <ExternalLink size={16} />
                    </Link>
                    <button onClick={() => onEdit(p)} className="p-3 bg-slate-100 rounded-xl hover:text-orange-500 transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => onDelete(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
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
  );
};

export default OverviewTable;