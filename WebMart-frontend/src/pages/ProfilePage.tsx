import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Camera, 
  ShieldCheck, Save, Loader2, UserCircle, X, Edit3, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {

  const { user, syncUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    address: '',
    profilePic: '' 
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isUsernameAlreadySet = !!(user as any)?.username;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: (user as any).fullName || '',
        username: (user as any).username || '',
        phoneNumber: (user as any).phoneNumber || '',
        address: (user as any).address || '',
        profilePic: (user as any).profilePic || (user as any).profileImageUrl || ''
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [user]);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
      const resData = await response.json();
      return resData.secure_url || null;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      return null;
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Updating your WebMart Identity...");
    
    try {
      let finalImageUrl = formData.profilePic;

      if (selectedFile) {
        const uploadedUrl = await uploadToCloudinary(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const updatedData = { 
        ...formData, 
        profilePic: finalImageUrl,
        profileImageUrl: finalImageUrl 
      };

      const userRole = (user as any)?.role?.toUpperCase();
      const apiEndpoint = (userRole === 'SELLER' || userRole === 'ROLE_SELLER') 
        ? '/seller/profile/update' 
        : '/buyer/profile/update';

      const res = await api.put(apiEndpoint, updatedData);
      


      syncUser(res.data);
      
      toast.success("Profile Protocol Synchronized!", { id: loadingToast });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Update failed", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        fullName: (user as any).fullName || '',
        username: (user as any).username || '',
        phoneNumber: (user as any).phoneNumber || '',
        address: (user as any).address || '',
        profilePic: (user as any).profilePic || (user as any).profileImageUrl || ''
      });
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [name, domain] = email.split('@');
    return `${name.substring(0, 3)}***@${domain}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="container mx-auto px-4 max-w-5xl animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Side: Avatar Card */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
              
              <div className="relative inline-block mt-4">
                <div className="h-36 w-36 rounded-[2.8rem] bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : formData.profilePic ? (
                    <img src={formData.profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-24 w-24 text-slate-200" />
                  )}
                  
                  {loading && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center rounded-[2.8rem]">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-2.5 bg-slate-900 text-primary rounded-xl shadow-xl hover:scale-110 transition-all border-2 border-white"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2">
                   <h2 className="text-xl font-black text-slate-800 tracking-tight">{(user as any)?.fullName || 'User'}</h2>
                   {(user as any)?.verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">@{(user as any)?.username || 'username'}</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-800 uppercase italic">Security Protocol</h3>
              </div>
              
              {isEditing ? (
                <button type="button" onClick={handleCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                  <X className="h-4 w-4" /> Abort
                </button>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  <Edit3 className="h-4 w-4 text-primary" /> Modify Data
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none disabled:opacity-60 transition-all text-slate-700"
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Username</label>
                <input 
                  disabled={!isEditing || isUsernameAlreadySet}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Masked Email</label>
                <div className="flex items-center gap-3 bg-slate-100/50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400">
                  <Mail className="h-4 w-4" />
                  {maskEmail(user?.email || '')}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Phone Line</label>
                <input 
                  disabled={!isEditing}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-primary/20 outline-none disabled:opacity-60 transition-all text-slate-700"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2 space-y-2.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Shipping Address</label>
                <textarea 
                  disabled={!isEditing}
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-5 text-sm font-bold focus:ring-2 ring-primary/20 outline-none disabled:opacity-60 transition-all resize-none text-slate-700"
                  placeholder="Enter your shipping address"
                />
              </div>

              {isEditing && (
                <div className="md:col-span-2 pt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70 group"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" /> Save Profile</>}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;