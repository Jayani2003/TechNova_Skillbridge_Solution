import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Key, Mail, Zap, ArrowRight, ChevronLeft } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-6">
      <div className="w-full max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ChevronLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Platform Title */}
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-600 w-10 h-10 rounded-xl text-white font-bold font-outfit text-xl flex items-center justify-center shadow-lg shadow-emerald-950/40">
          S
        </div>
        <div>
          <span className="font-bold text-xl font-outfit tracking-wide text-white block">SkillBridge</span>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Local Economy</span>
        </div>
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
        
        <h2 className="text-2xl font-bold font-outfit text-white text-center mb-1">Welcome Back</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Sign in to access your local opportunities dashboard.</p>

        {error && (
          <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
            <Shield size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Key size={16} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2 mt-6 shadow-lg shadow-emerald-900/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
            Register Here
          </Link>
        </p>

        {/* Hackathon Quick Access */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center mb-3 flex items-center justify-center gap-1">
            <Zap size={12} className="text-emerald-500" /> Demo Quick Sign-in
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleQuickLogin('student@skillbridge.demo')}
              className="bg-slate-950 hover:bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-xl text-left text-xs transition hover:border-emerald-500/30"
            >
              <span className="text-[9px] font-bold text-emerald-400 tracking-wider block">🎓 STUDENT</span>
              <span className="text-slate-300 truncate block font-medium">Alex Fernando</span>
            </button>
            <button 
              onClick={() => handleQuickLogin('community@skillbridge.demo')}
              className="bg-slate-950 hover:bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-xl text-left text-xs transition hover:border-emerald-500/30"
            >
              <span className="text-[9px] font-bold text-orange-400 tracking-wider block">👤 COMMUNITY</span>
              <span className="text-slate-300 truncate block font-medium">Kasun Perera</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
