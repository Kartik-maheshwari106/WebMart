import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';



interface User {

  id?: string | number;
  email: string;
  fullName: string;
  name?: string;
  role: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string; 
  profilePic?: string;
  image?: string;
  avatar?: string;
  companyName?: string;
  verified?: boolean;
}



interface AuthContextType {

  user: User | null;

  token: string | null;

  login: (token: string, user: User) => void;

  logout: () => void;

  syncUser: (updatedUser: User) => void; 

  isAuthenticated: boolean;

  loading: boolean;

}



const AuthContext = createContext<AuthContextType | undefined>(undefined);





const TOKEN_KEY = 'webmart_token';

const USER_KEY = 'webmart_user';



export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const savedToken = localStorage.getItem(TOKEN_KEY);

    const savedUser = localStorage.getItem(USER_KEY);

    

    if (savedToken && savedUser) {

      try {

        setToken(savedToken);

        setUser(JSON.parse(savedUser));

      } catch (e) {

        localStorage.clear();

      }

    }

    setLoading(false);

  }, []);





  const login = (newToken: string, newUser: User) => {

    localStorage.setItem(TOKEN_KEY, newToken);

    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    setToken(newToken);

    setUser(newUser);

  };





  const syncUser = (updatedUser: User) => {

    console.log("Syncing to Storage...", updatedUser); // Debugging ke liye

    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    setUser(updatedUser);

  };



  const logout = () => {

    localStorage.clear();

    setToken(null);

    setUser(null);

    window.location.href = '/login';

  };



  return (

    <AuthContext.Provider value={{ 

      user, token, login, logout, syncUser,

      isAuthenticated: !!token, loading 

    }}>

      {!loading && children}

    </AuthContext.Provider>

  );

};



export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used within AuthProvider');

  return context;

};