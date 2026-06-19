import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Loader2, GraduationCap } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Erreur d\'authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 mb-3 shadow-inner">
            <GraduationCap className="h-10 w-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
            EduGrade
          </h1>
          <p className="text-gray-400 text-sm mt-1 text-center font-light">
            {isLogin ? 'Connectez-vous pour gérer vos copies d\'examens' : 'Créez votre compte enseignant'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block ml-1">Nom Complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-gray-950/50 border border-gray-800 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600 shadow-inner"
                  placeholder="Ex: Professeur Adam"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block ml-1">Adresse Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="h-4 w-4" />
              </div>
              <input 
                type="email" 
                required 
                className="w-full bg-gray-950/50 border border-gray-800 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600 shadow-inner"
                placeholder="Ex: adam@gmail.com"
                autoComplete="username"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block ml-1">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="h-4 w-4" />
              </div>
              <input 
                type="password" 
                required 
                className="w-full bg-gray-950/50 border border-gray-800 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-600 shadow-inner"
                placeholder="••••••••"
                autoComplete="current-password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800/60 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)} 
              className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1.5 focus:outline-none transition-colors"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
