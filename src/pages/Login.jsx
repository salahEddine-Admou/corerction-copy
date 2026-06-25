import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Loader2, Check } from 'lucide-react';
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
      localStorage.setItem('userEmail', formData.email.trim().toLowerCase());
      localStorage.setItem('userName', isLogin ? formData.email.split('@')[0] : formData.name);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Erreur d\'authentification. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setFormData({
      name: '',
      email: 'adam@gmail.com',
      password: 'Ad@m2026'
    });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#030014] text-slate-100 p-4 overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="relative w-full max-w-md z-10">
        
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-2.5 rounded-2xl shadow-lg shadow-sky-500/10">
            <Check className="h-6 w-6 text-white stroke-[3.5]" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white font-display">
            Korrect
          </span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.08)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Content de vous revoir' : 'Créer un compte'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Accédez à votre gestionnaire de copies par IA' : 'Commencez à corriger intelligemment vos copies'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Adam Smith"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="email" 
                  required 
                  placeholder="nom@exemple.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all text-sm"
                  value={formData.email}
                  autoComplete="username"
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 transition-all text-sm"
                  value={formData.password}
                  autoComplete="current-password"
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-sky-500 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-semibold shadow-lg shadow-sky-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all text-sm cursor-pointer mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <>
                  {isLogin ? 'Se connecter' : "S'inscrire"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Toggle form type */}
          <p className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)} 
              className="font-semibold text-sky-400 hover:text-sky-300 ml-1.5 focus:outline-none underline decoration-sky-500/30 hover:decoration-sky-400 transition-all cursor-pointer"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>

          {/* Test credentials banner */}
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
              <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 text-left shadow-inner">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">Version Démo</span>
                  <button 
                    type="button" 
                    onClick={fillTestCredentials}
                    className="text-[11px] text-sky-300 hover:text-white font-semibold underline decoration-sky-400/20 hover:decoration-white transition-all cursor-pointer"
                  >
                    Remplir automatiquement
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Email : <code className="text-sky-200 bg-slate-950/60 border border-slate-800/50 px-2 py-0.5 rounded font-mono ml-1">adam@gmail.com</code>
                  </p>
                  <p className="text-xs text-slate-400">
                    Mot de passe : <code className="text-sky-200 bg-slate-950/60 border border-slate-800/50 px-2 py-0.5 rounded font-mono ml-1">Ad@m2026</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
