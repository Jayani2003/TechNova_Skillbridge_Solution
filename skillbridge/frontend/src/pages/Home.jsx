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
  Zap
} from 'lucide-react';

const Home = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Fetch global impact stats
    const fetchImpact = async () => {
      try {
        const data = await api.get('/impact');
        setImpact(data);
      } catch (err) {
        console.error('Error fetching global impact', err);
      }
    };
    fetchImpact();
  }, [isAuthenticated, navigate]);

  const handleQuickLogin = async (email) => {
    setLoading(true);
    setError('');
    try {
      await login(email, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <nav className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 w-10 h-10 rounded-xl text-white font-bold font-outfit text-xl flex items-center justify-center shadow-lg shadow-emerald-950/40">
            S
          </div>
          <div>
            <span className="font-bold text-xl font-outfit tracking-wide text-white block">SkillBridge</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Local Opportunity</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition">
            Sign In
          </Link>
          <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-900/20">
            Sign Up platform
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 w-full">
        {/* Left Column - Pitch */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-semibold tracking-wide">
            <Sparkles size={14} />
            <span>Hyperlocal Economy Platform for Students & Surroundings</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold font-outfit leading-tight tracking-tight text-white">
            Turn Skills Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Opportunities.</span>
          </h1>
          
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl">
            SkillBridge connects university students with local residents and small businesses. Find flexible micro-jobs, rent affordable student housing, trade academic resources, and build your professional reputation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30">
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-8 py-4 rounded-2xl font-semibold transition flex items-center justify-center">
              Browse Platform
            </Link>
          </div>

          {/* Quick Stats Grid */}
          {impact && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-900">
              <div>
                <span className="text-2xl md:text-3xl font-bold text-white font-outfit block">{impact.studentsConnected}</span>
                <span className="text-xs text-slate-500 font-medium">Students Connected</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-white font-outfit block">{impact.jobsCompleted}</span>
                <span className="text-xs text-slate-500 font-medium">Gigs Completed</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-emerald-400 font-outfit block">Rs. {impact.totalIncomeGenerated.toLocaleString()}</span>
                <span className="text-xs text-slate-500 font-medium">Student Income</span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-bold text-green-400 font-outfit block">Rs. {impact.estimatedCommunitySavings.toLocaleString()}</span>
                <span className="text-xs text-slate-500 font-medium">Community Savings</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Demo logins */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
            
            <h2 className="text-xl font-bold text-white font-outfit mb-2 flex items-center gap-2">
              <Zap className="text-emerald-500 fill-emerald-500" size={20} />
              <span>Hackathon Demonstration panel</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Skip registration and instantly access predefined role accounts to demonstrate the end-to-end economic workflow.
            </p>

            {error && (
              <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-medium mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Student quick login card */}
              <button 
                disabled={loading}
                onClick={() => handleQuickLogin('student@skillbridge.demo')}
                className="w-full text-left bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl group transition flex items-start justify-between gap-4"
              >
                <div>
                  <span className="text-xs text-emerald-400 font-semibold tracking-wider block mb-1">🎓 DEMO ACCOUNT</span>
                  <span className="font-semibold text-sm text-slate-200 block group-hover:text-white transition">Alex Fernando (Student)</span>
                  <span className="text-xs text-slate-500 block mt-1">Offers: Graphic Design, React. Expected Rate: Rs. 1500/hr</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition shadow-sm">
                  <ArrowRight size={16} />
                </div>
              </button>

              {/* Community member quick login card */}
              <button 
                disabled={loading}
                onClick={() => handleQuickLogin('community@skillbridge.demo')}
                className="w-full text-left bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl group transition flex items-start justify-between gap-4"
              >
                <div>
                  <span className="text-xs text-orange-400 font-semibold tracking-wider block mb-1">👤 DEMO ACCOUNT</span>
                  <span className="font-semibold text-sm text-slate-200 block group-hover:text-white transition">Kasun Perera (Community Owner)</span>
                  <span className="text-xs text-slate-500 block mt-1">Offers: ABC Printing Shop. Needs flyer design and site updates.</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition shadow-sm">
                  <ArrowRight size={16} />
                </div>
              </button>
            </div>

            <div className="text-center mt-6 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
              <span>Demo Password: <code className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">password123</code></span>
            </div>
          </div>
        </div>
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
