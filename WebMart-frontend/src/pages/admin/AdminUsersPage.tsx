import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, 
  Mail, Ban, CheckCircle2, 
  ShieldAlert, Fingerprint,
  RotateCcw, ExternalLink, Activity, Loader2,
  Trash2, X, Package, ShoppingBag 
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [inspectingUser, setInspectingUser] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users/all');
      setUsers(res.data || []);
    } catch (err) {
      toast.error("Identity database sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (user: any) => {
    setInspectingUser(user);
    setIsInspecting(true);
    setActivityData([]); 
    
    try {

      const endpoint = (user.role === 'BUYER')
        ? `/admin/inspect/orders/${user.id}`
        : `/admin/inspect/products/${user.id}`;
      
      const res = await api.get(endpoint);
      setActivityData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch user activity");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: newStatus } : u));
      toast.success(`Access Protocol: ${newStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data || "Security Protocol Violation");
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`PERMANENTLY DELETE ${userName}?`)) return;
    try {
      await api.delete(`/admin/users/remove/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(`${userName} purged`);
    } catch (err: any) {
      toast.error(err.response?.data || "Deletion failed");
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Identity elevated to ${newRole}`);
    } catch (err: any) {
      toast.error(err.response?.data || "Authorization failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-10 animate-in fade-in duration-700 relative">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-900 text-white">
            <Fingerprint size={14} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Identity Management</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tightest">
            User <span className="text-primary italic">Directory.</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search Identity..."
              className="pl-14 pr-6 py-4 rounded-[2rem] border-2 border-slate-100 outline-none w-full md:w-80 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchUsers} className="h-14 w-14 flex items-center justify-center rounded-[1.5rem] bg-white border-2 border-slate-100 text-slate-400 hover:text-primary transition-all">
            <RotateCcw size={22} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Decrypting Registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">User Entity</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">System Role</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol Status</th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Terminal Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-10 py-6 text-center">
                      <select 
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase outline-none cursor-pointer"
                      >
                        {/* ✅ CHANGED CUSTOMER TO BUYER */}
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                        <option value="ADMIN">Admin</option>
                        <option value="DEVELOPER">Developer</option>
                      </select>
                    </td>

                    <td className="px-10 py-6 text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase ${
                        u.accountStatus === 'BLOCKED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {u.accountStatus === 'BLOCKED' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                        {u.accountStatus || 'ACTIVE'}
                      </div>
                    </td>

                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => toggleUserStatus(u.id, u.accountStatus || 'ACTIVE')}
                          className={`h-11 w-11 flex items-center justify-center rounded-xl border-2 transition-all ${
                            u.accountStatus === 'BLOCKED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}
                        >
                          {u.accountStatus === 'BLOCKED' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                        </button>

                        <button onClick={() => handleInspect(u)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border-2 border-slate-100 text-slate-400 hover:text-primary">
                          <ExternalLink size={18} />
                        </button>

                        <button onClick={() => deleteUser(u.id, u.name)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border-2 border-slate-100 text-slate-400 hover:text-rose-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isInspecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                  {/* ✅ INSPECTION ROLE UPDATED */}
                  {inspectingUser.role === 'BUYER' ? <ShoppingBag size={24} /> : <Package size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900">{inspectingUser.name}'s Registry</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inspectingUser.role} Activity Log</p>
                </div>
              </div>
              <button onClick={() => setIsInspecting(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {activityData.length > 0 ? (
                <div className="space-y-4">
                  {activityData.map((item: any, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-3xl border-2 border-slate-50 hover:border-primary/10 transition-all bg-white shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {/* ✅ TEXT LOGIC UPDATED TO BUYER */}
                            {inspectingUser.role === 'BUYER' ? `Order ID: ${item.id}` : item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {inspectingUser.role === 'BUYER' ? `Total: ₹${item.totalAmount}` : `Price: ₹${item.price}`}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                        inspectingUser.role === 'BUYER' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {inspectingUser.role === 'BUYER' ? item.status : 'In Stock'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200 mb-4">
                    <Activity size={32} />
                  </div>
                  <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No data footprints found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;