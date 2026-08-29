import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  PiggyBank,
  GraduationCap,
  Users,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  Briefcase,
  Home as HomeIcon,
  MapPin,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [impact, setImpact] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Fetch real global impact stats and live active listings
    const loadHomeData = async () => {
      try {
        const impactData = await api.get('/impact');
        setImpact(impactData);
      } catch (err) {
        console.error('Error fetching home data', err);
      }
    };

    loadHomeData();
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <nav className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SkillBridge Logo" className="h-10 w-10 object-contain bg-white rounded-xl p-0.5 shadow-lg shadow-emerald-950/40" />
          <div>
            <span className="font-bold text-xl font-outfit tracking-wide text-white block">SkillBridge</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Local Opportunity</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-900 transition flex items-center justify-center cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-400" />}
          </button>
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition">
            Sign In
          </Link>
          <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-900/20">
            Sign Up platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center text-center flex-1 w-full space-y-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-semibold tracking-wide">
          <Sparkles size={14} />
          <span>Hyperlocal Economy Platform for Students & Surroundings</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-outfit leading-tight tracking-tight text-white">
          Turn Skills Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Opportunities.</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          SkillBridge connects university students with local residents and small businesses. Find flexible micro-jobs, rent affordable student housing, trade academic resources, and build your professional reputation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30">
            <span>Get Started Now</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-8 py-4 rounded-2xl font-semibold transition flex items-center justify-center">
            Sign In to Dashboard
          </Link>
        </div>

        {/* Quick Real Stats Grid */}
        {impact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 mt-6 w-full max-w-4xl border-t border-slate-900 text-center">
            <div>
              <span className="text-2xl md:text-3xl font-bold text-white font-outfit block">{impact.studentsConnected}</span>
              <span className="text-xs text-slate-500 font-medium">Registered Students</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-white font-outfit block">{impact.opportunitiesPosted}</span>
              <span className="text-xs text-slate-500 font-medium">Gigs & Opportunities</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-emerald-400 font-outfit block">Rs. {impact.totalIncomeGenerated.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">Total Student Income</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-green-400 font-outfit block">Rs. {impact.estimatedCommunitySavings.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">Community Savings</span>
            </div>
          </div>
        )}
      </div>

      {/* Feature Pillar Badges */}
      <section className="bg-slate-900/40 border-t border-slate-900 py-16 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-outfit text-white">Five Core Impact Outcomes</h2>
            <p className="text-xs text-slate-500 mt-2">How SkillBridge empowers the local student-community ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="bg-slate-900/60 border border-slate-800/40 p-6 rounded-2xl text-center space-y-4">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto"><TrendingUp size={22} /></div>
              <h3 className="font-bold text-sm text-white">Earn More</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Students pick up flexible micro-jobs matching their schedule and rate specs.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/40 p-6 rounded-2xl text-center space-y-4">
              <div className="bg-blue-500/10 text-blue-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto"><PiggyBank size={22} /></div>
              <h3 className="font-bold text-sm text-white">Spend Less</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Find local shared boarding options and donate/request academic supplies.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/40 p-6 rounded-2xl text-center space-y-4">
              <div className="bg-purple-500/10 text-purple-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto"><GraduationCap size={22} /></div>
              <h3 className="font-bold text-sm text-white">Build Experience</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Track reviews, job history, and build a verified Reputation Score.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/40 p-6 rounded-2xl text-center space-y-4">
              <div className="bg-orange-500/10 text-orange-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto"><Users size={22} /></div>
              <h3 className="font-bold text-sm text-white">Connect Locally</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Bridge university clusters with surrounding shops and neighborhoods.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/40 p-6 rounded-2xl text-center space-y-4">
              <div className="bg-red-500/10 text-red-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto"><HeartHandshake size={22} /></div>
              <h3 className="font-bold text-sm text-white">Create Impact</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Increase resource reuse, reduce waste, and build localized wealth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SkillBridge Platform. Built for hyperlocal economic development.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> Relational SQL Data</span>
            <span>•</span>
            <span>Node + React Stack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
