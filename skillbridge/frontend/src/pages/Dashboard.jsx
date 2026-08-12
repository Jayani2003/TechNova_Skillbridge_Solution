import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  Star, 
  Zap, 
  Award,
  Sparkles,
  ShieldAlert,
  Bell,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Coins,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [gigs, setGigs] = useState([]);
  const [talents, setTalents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Refresh profile stats
        await refreshUser();

        // Load notifications
        const notifData = await api.get('/notifications');
        setNotifications(notifData.slice(0, 4));

        // Load global metrics
        const impactStats = await api.get('/impact');
        setStats(impactStats);

        if (user.user_type === 'STUDENT') {
          // Fetch open gigs for recommendation
          const gigData = await api.get('/gigs?status=OPEN');
          setGigs(gigData.slice(0, 3));
        } else {
          // Fetch talents for hiring recommendation
          const talentData = await api.get('/talents');
          setTalents(talentData.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, navigate]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isStudent = user.user_type === 'STUDENT';

  return (
    <div className="space-y-6 pb-12">
      {/* Back to Home Button */}
      <div className="flex items-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-md"
        >
          <ChevronLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* 1. Welcome banner */}
      <div className="relative bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase bg-emerald-950/60 border border-emerald-900/50 px-2.5 py-1 rounded-lg">
                {isStudent ? '🎓 Student Portal' : '👤 Community Portal'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">Matara, Sri Lanka</span>
            </div>
            <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              {isStudent 
                ? 'Your skills are valued! Check open gigs below, coordinate with community business owners, or trade academic items.'
                : 'Connect with Ruhuna student talent, browse active service providers, rent out boarding spaces, or donate unused items.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isStudent ? (
              <>
                <Link to="/gigs" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                  <span>Browse Gigs</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/talent?userType=COMMUNITY_MEMBER" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-5 py-3 rounded-2xl font-semibold text-sm transition">
                  Find Workers
                </Link>
              </>
            ) : (
              <>
                <Link to="/gigs" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                  {/* <PlusCircle size={18} /> */}
                  <span>Browse Gigs</span>
                </Link>
                <Link to="/talent" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-5 py-3 rounded-2xl font-semibold text-sm transition">
                  Find Workers
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Personal Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat 1: Opportunity Score (Student) or Active Posts (Community) */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {isStudent ? 'Reputation Score' : 'Open Listings'}
            </span>
            <div className="bg-emerald-950 text-emerald-400 p-2 rounded-xl border border-emerald-900/50">
              <Award size={18} />
            </div>
          </div>
          {isStudent ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-outfit text-white">{user.opportunity_score || 85}</span>
                <span className="text-xs font-semibold text-emerald-400">/ 100</span>
              </div>
              <span className="text-xs text-slate-500 mt-2 block font-medium">Opportunity Score</span>
            </div>
          ) : (
            <div>
              <span className="text-4xl font-extrabold font-outfit text-white">{user.completed_jobs + 2}</span>
              <span className="text-xs text-slate-500 mt-2 block font-medium">Active Gigs & Lodging</span>
            </div>
          )}
        </div>

        {/* Stat 2: Completed Work */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jobs Completed</span>
            <div className="bg-blue-950 text-blue-400 p-2 rounded-xl border border-blue-900/50">
              <Briefcase size={18} />
            </div>
          </div>
          <div>
            <span className="text-4xl font-extrabold font-outfit text-white">{user.completed_jobs}</span>
            <span className="text-xs text-slate-500 mt-2 block font-medium">Contracts Executed</span>
          </div>
        </div>

        {/* Stat 3: Earnings / Expenditures */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {isStudent ? 'Total Earned' : 'Total Spent'}
            </span>
            <div className="bg-amber-950 text-amber-400 p-2 rounded-xl border border-amber-900/50">
              <Coins size={18} />
            </div>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-extrabold font-outfit text-white">
              Rs. {user.total_earnings?.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 mt-2 block font-medium">
              {isStudent ? 'Transferred Income' : 'Student Payments'}
            </span>
          </div>
        </div>

        {/* Stat 4: Average Ratings */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Rating</span>
            <div className="bg-purple-950 text-purple-400 p-2 rounded-xl border border-purple-900/50">
              <Star size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-extrabold font-outfit text-white">
                {parseFloat(user.avg_rating || 0) > 0 ? user.avg_rating : '5.0'}
              </span>
              <div className="flex text-amber-400">
                <Star size={16} className="fill-amber-400" />
              </div>
            </div>
            <span className="text-xs text-slate-500 mt-2 block font-medium">
              Based on {user.ratings_count || 1} review(s)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side - Gigs or Talents Recommendations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={20} />
              <span>{isStudent ? 'Recommended Gigs For You' : 'Recommended Student Workers'}</span>
            </h2>
            <Link to={isStudent ? '/gigs' : '/talent'} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isStudent ? (
              gigs.length > 0 ? (
                gigs.map(gig => (
                  <div key={gig.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/60 transition group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <span className="bg-emerald-950/60 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-900/50 uppercase">
                        {gig.category}
                      </span>
                      <h3 className="font-bold text-slate-200 group-hover:text-white transition text-base">{gig.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">{gig.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {gig.location}</span>
                        <span className="font-medium text-emerald-400">Rs. {parseFloat(gig.budget).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Link to={`/gigs?selected=${gig.id}`} className="w-full md:w-auto bg-slate-950 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white border border-slate-800 group-hover:border-emerald-600 px-4 py-2.5 rounded-xl font-semibold text-xs transition text-center flex items-center justify-center gap-1.5 flex-shrink-0">
                      <span>Apply Now</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/20 border border-slate-800/40 p-8 text-center rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">No open gigs recommended for your profile right now.</p>
                </div>
              )
            ) : (
              talents.length > 0 ? (
                talents.map(talent => (
                  <div key={talent.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/60 transition group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={talent.profile_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${talent.full_name}`} 
                        alt={talent.full_name} 
                        className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950"
                      />
                      <div>
                        <h3 className="font-bold text-slate-200 group-hover:text-white transition text-base">{talent.full_name}</h3>
                        <p className="text-xs text-slate-400 font-medium">{talent.faculty} • {talent.degree_program}</p>
                        
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="bg-slate-950 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-850">
                            Reputation: {talent.opportunity_score}/100
                          </span>
                          <span className="text-xs text-amber-400 flex items-center gap-0.5">
                            <Star size={12} className="fill-amber-400" /> {talent.avg_rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 max-w-xs justify-start md:justify-end">
                      {talent.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-850">{skill}</span>
                      ))}
                    </div>
                    
                    <Link to={`/talent?selected=${talent.id}&userType=${talent.user_type}`} className="w-full md:w-auto bg-slate-950 group-hover:bg-emerald-600 text-slate-300 group-hover:text-white border border-slate-800 group-hover:border-emerald-600 px-4 py-2.5 rounded-xl font-semibold text-xs transition text-center flex items-center justify-center gap-1.5 flex-shrink-0">
                      <span>View Profile</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="bg-slate-900/20 border border-slate-800/40 p-8 text-center rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">No students recommended right now.</p>
                </div>
              )
            )}
          </div>

          {/* Global Impact Dashboard Summary */}
          {stats && (
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 space-y-4 shadow-md">
              <h3 className="text-sm font-bold font-outfit text-slate-300 flex items-center gap-2">
                <Globe className="text-emerald-500" size={16} />
                <span>Local Platform Impact metrics</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                  <span className="text-lg font-bold text-white block">{stats.studentsConnected + stats.communityConnected}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Connected Locals</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                  <span className="text-lg font-bold text-white block">{stats.jobsCompleted}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gigs Completed</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                  <span className="text-lg font-bold text-emerald-400 block">Rs. {stats.totalIncomeGenerated.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Income Created</span>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
                  <span className="text-lg font-bold text-green-400 block">Rs. {stats.estimatedCommunitySavings.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated Savings</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Notifications & Quick Messaging */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
              <Bell className="text-slate-400" size={20} />
              <span>Recent Alerts</span>
            </h2>
            <Link to="/notifications" className="text-xs font-semibold text-slate-400 hover:text-white transition">
              View All
            </Link>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-lg min-h-[250px]">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(notif => (
                  <div key={notif.id} className="flex gap-3 items-start border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-850 text-emerald-400 flex-shrink-0 mt-0.5">
                      <Zap size={14} className={notif.is_read ? 'text-slate-600' : 'text-emerald-400'} />
                    </div>
                    <div className="overflow-hidden">
                      <span className={`text-xs block font-bold truncate ${notif.is_read ? 'text-slate-450' : 'text-slate-200'}`}>
                        {notif.title}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{notif.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
                <ShieldAlert size={32} className="text-slate-600" />
                <p className="text-xs text-slate-500 font-medium">No recent alerts or notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
