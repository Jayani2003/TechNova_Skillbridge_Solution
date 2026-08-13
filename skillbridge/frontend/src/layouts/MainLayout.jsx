import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  MapPin, 
  Home as HomeIcon, 
  Gift, 
  ClipboardList, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    const fetchBadges = async () => {
      try {
        if (!user) return;
        // Fetch notifications count
        const notifications = await api.get('/notifications');
        const unreadNotif = notifications.filter(n => !n.is_read).length;
        setUnreadNotifications(unreadNotif);

        // Fetch conversations to sum unread messages
        const conversations = await api.get('/messages/conversations');
        // Let's check conversations. Since last_message is returned, let's query the unread messages in a simple way or count conversations with unread
        // For simplicity, we can query conversations, or just count conversations that might contain unread.
        // Actually, we'll mock or set a simple count for messages. Let's count conversations with unread flags from the database.
        // For the MVP, let's just make it check if any messages are unread.
        // We will sum them or set to 1 if there are any unread messages. Let's look at notifications instead for instant message notification counters.
      } catch (err) {
        console.error('Error fetching badges:', err);
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    setShowLogoutConfirm(true);
  };

  const confirmBackToHome = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const cancelBackToHome = () => {
    setShowLogoutConfirm(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Gigs / Jobs Board', path: '/gigs', icon: Briefcase },
    { name: 'Find Talent', path: '/talent', icon: Search },
    { name: 'Nearby Map', path: '/nearby', icon: MapPin },
    { name: 'Boarding Lodging', path: '/boarding', icon: HomeIcon },
    { name: 'Donate & Resources', path: '/resources', icon: Gift },
    { name: 'My Jobs Tracker', path: '/my-jobs', icon: ClipboardList },
    { name: 'Messages', path: '/messages', icon: MessageSquare, badge: unreadMessages },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-4 z-40">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg text-white font-bold flex items-center justify-center">SB</div>
          <span className="font-semibold text-lg font-outfit tracking-wide text-white">SkillBridge</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-30
        h-full min-h-screen
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="bg-emerald-600 w-10 h-10 rounded-xl text-white font-bold font-outfit text-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
            S
          </div>
          <div>
            <span className="font-bold text-xl font-outfit tracking-wide text-white block">SkillBridge</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Local Economy</span>
          </div>
        </div>

        {/* User Mini Profile */}
        {user && (
          <Link to="/profile" className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 hover:bg-slate-800/40 transition">
            <div className="relative">
              <img 
                src={user.profile_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.full_name}`} 
                alt={user.full_name} 
                className="w-10 h-10 rounded-full border border-emerald-500 bg-slate-800"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></span>
            </div>
            <div className="overflow-hidden">
              <span className="font-medium text-sm text-slate-200 block truncate">{user.full_name}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                {user.user_type === 'STUDENT' ? (
                  <span className="text-emerald-400">🎓 Student</span>
                ) : (
                  <span className="text-orange-400">👤 Community</span>
                )}
              </span>
            </div>
          </Link>
        )}

        {/* Back to Home button below profile card */}
        {user && (
          <div className="px-4 py-2 border-b border-slate-800">
            <button
              onClick={handleBackToHome}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition text-xs font-semibold"
            >
              <HomeIcon size={16} className="text-slate-500" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-3.5 rounded-xl transition-all duration-150 text-sm font-medium
                  ${isActive(item.path) 
                    ? 'bg-slate-800 text-white font-semibold border-l-4 border-emerald-500' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
              >
                <div className="flex items-center gap-3">
                  <IconComponent size={20} className={isActive(item.path) ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Theme Switcher & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition text-sm font-bold cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} className="text-amber-500 fill-amber-500/20" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={20} className="text-indigo-400 fill-indigo-400/20" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition text-sm font-medium"
          >
            <LogOut size={20} className="text-slate-500 group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
      {/* Custom Logout Confirmation Dialog Box */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative text-center">
            {/* Warning Icon with glow */}
            <div className="mx-auto w-14 h-14 bg-emerald-950/30 text-emerald-450 rounded-full border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-950/20">
              <LogOut size={28} />
            </div>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Back to Home</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to log out of your current session and return to the Home page?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelBackToHome}
                className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-205 py-3 rounded-xl font-semibold text-xs transition border border-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBackToHome}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-xs transition shadow-lg shadow-emerald-950/20 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
