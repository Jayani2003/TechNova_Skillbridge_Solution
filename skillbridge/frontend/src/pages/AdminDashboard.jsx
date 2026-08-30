import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Home, 
  Trash2, 
  ShieldCheck,
  AlertOctagon,
  Gift,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [unverifiedStudents, setUnverifiedStudents] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.user_type !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, gigsData, unverifiedData, disputesData, resourcesData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/gigs'),
        api.get('/admin/verification/students'),
        api.get('/admin/disputes/jobs'),
        api.get('/admin/resources')
      ]);
      setStats(statsData);
      setUsers(usersData);
      setGigs(gigsData);
      setUnverifiedStudents(unverifiedData);
      setDisputes(disputesData);
      setResources(resourcesData);
    } catch (err) {
      console.error(err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const showMessage = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showMessage('User deleted successfully');
      setUsers(users.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (err) {
      showMessage(err.message || 'Error deleting user', true);
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) return;
    try {
      await api.delete(`/admin/gigs/${gigId}`);
      showMessage('Gig deleted successfully');
      setGigs(gigs.filter(g => g.id !== gigId));
      setStats(prev => ({ ...prev, totalGigs: prev.totalGigs - 1 }));
    } catch (err) {
      showMessage(err.message || 'Error deleting gig', true);
    }
  };

  const handleVerifyStudent = async (studentId) => {
    try {
      await api.put(`/admin/verification/students/${studentId}/verify`);
      showMessage('Student verified successfully');
      setUnverifiedStudents(unverifiedStudents.filter(s => s.id !== studentId));
      // Update in users list as well
      setUsers(users.map(u => u.id === studentId ? { ...u, is_verified: true } : u));
    } catch (err) {
      showMessage(err.message || 'Error verifying student', true);
    }
  };

  const handleResolveDispute = async (jobId, resolution) => {
    if (!window.confirm(`Are you sure you want to forcefully mark this job as ${resolution}?`)) return;
    try {
      await api.put(`/admin/disputes/jobs/${jobId}/resolve`, { resolution });
      showMessage(`Dispute resolved. Job marked as ${resolution}`);
      setDisputes(disputes.filter(d => d.id !== jobId));
    } catch (err) {
      showMessage(err.message || 'Error resolving dispute', true);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource listing?')) return;
    try {
      await api.delete(`/admin/resources/${resourceId}`);
      showMessage('Resource deleted successfully');
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (err) {
      showMessage(err.message || 'Error deleting resource', true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon, badgeCount }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-4 text-sm font-bold uppercase tracking-wider transition relative ${activeTab === id ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:bg-slate-850 hover:text-slate-300'}`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {badgeCount > 0 && (
        <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white">Admin Control Panel</h1>
        <p className="text-sm text-slate-400 mt-1">Manage users, monitor platform health, verify accounts, and resolve disputes.</p>
      </div>

      {success && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><Trash2 size={16}/></button>
        </div>
      )}
      {error && (
        <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><Trash2 size={16}/></button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="bg-blue-950/60 p-3 rounded-2xl text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block">{stats.totalUsers}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Users</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="bg-emerald-950/60 p-3 rounded-2xl text-emerald-400">
              <Briefcase size={24} />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block">{stats.totalGigs}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Gigs</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="bg-purple-950/60 p-3 rounded-2xl text-purple-400">
              <Home size={24} />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block">{stats.totalBoarding}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Boarding</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="bg-amber-950/60 p-3 rounded-2xl text-amber-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block">Rs. {Number(stats.totalIncome).toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Income Generated</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800 overflow-x-auto custom-scrollbar">
          <TabButton id="users" label="Users" icon={Users} />
          <TabButton id="verification" label="Verify Students" icon={ShieldCheck} badgeCount={unverifiedStudents.length} />
          <TabButton id="disputes" label="Job Disputes" icon={AlertOctagon} badgeCount={disputes.length} />
          <TabButton id="gigs" label="Gigs" icon={Briefcase} />
          <TabButton id="resources" label="Resources" icon={Gift} />
        </div>

        <div className="p-6 min-h-[400px]">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-850 hover:bg-slate-850/50 transition">
                      <td className="py-4 px-4 text-sm font-bold text-slate-200 flex items-center gap-2">
                        {u.full_name}
                        {u.user_type === 'STUDENT' && u.is_verified && <ShieldCheck size={14} className="text-emerald-400" title="Verified Student"/>}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${u.user_type === 'ADMIN' ? 'bg-purple-950 border-purple-500/50 text-purple-400' : u.user_type === 'STUDENT' ? 'bg-blue-950 border-blue-500/50 text-blue-400' : 'bg-emerald-950 border-emerald-500/50 text-emerald-400'}`}>
                          {u.user_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        {u.user_type !== 'ADMIN' && (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-950/40 hover:bg-red-950 border border-red-900/50 text-red-400 p-2 rounded-lg transition group"
                            title="Delete User"
                          >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VERIFICATION TAB */}
          {activeTab === 'verification' && (
            <div className="overflow-x-auto">
              {unverifiedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <ShieldCheck size={48} className="mb-4 opacity-50" />
                  <p>No students pending verification.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">University</th>
                      <th className="py-3 px-4">Reg No</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unverifiedStudents.map(s => (
                      <tr key={s.id} className="border-b border-slate-850 hover:bg-slate-850/50 transition">
                        <td className="py-4 px-4 text-sm font-bold text-slate-200">
                          {s.full_name}<br/><span className="text-xs text-slate-500 font-normal">{s.email}</span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400">{s.university}</td>
                        <td className="py-4 px-4 text-xs text-slate-400 font-mono">{s.student_registration_no}</td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleVerifyStudent(s.id)}
                            className="bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-900/50 text-emerald-400 px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* DISPUTES TAB */}
          {activeTab === 'disputes' && (
            <div className="overflow-x-auto">
              {disputes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <AlertOctagon size={48} className="mb-4 opacity-50" />
                  <p>No active disputes to resolve.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Poster</th>
                      <th className="py-3 px-4">Worker</th>
                      <th className="py-3 px-4">Budget</th>
                      <th className="py-3 px-4 text-right">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map(d => (
                      <tr key={d.id} className="border-b border-slate-850 hover:bg-slate-850/50 transition">
                        <td className="py-4 px-4 text-sm font-bold text-slate-200">{d.title}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">{d.poster_name}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">{d.worker_name}</td>
                        <td className="py-4 px-4 text-xs font-bold text-amber-400">Rs. {Number(d.budget).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleResolveDispute(d.id, 'COMPLETED')}
                              className="bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 px-2.5 py-1.5 rounded border border-emerald-900/50 transition text-[10px] font-bold"
                              title="Force Release Payment"
                            >
                              Release Pay
                            </button>
                            <button 
                              onClick={() => handleResolveDispute(d.id, 'CANCELLED')}
                              className="bg-red-950/40 hover:bg-red-900 text-red-400 px-2.5 py-1.5 rounded border border-red-900/50 transition text-[10px] font-bold"
                              title="Cancel Job without Payment"
                            >
                              Cancel Job
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* GIGS TAB */}
          {activeTab === 'gigs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gigs.map(g => (
                    <tr key={g.id} className="border-b border-slate-850 hover:bg-slate-850/50 transition">
                      <td className="py-4 px-4 text-sm font-bold text-slate-200">{g.title}</td>
                      <td className="py-4 px-4 text-xs text-slate-400">{g.category}</td>
                      <td className="py-4 px-4 text-xs font-bold text-emerald-400">Rs. {Number(g.budget).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${g.status === 'OPEN' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteGig(g.id)}
                          className="bg-red-950/40 hover:bg-red-950 border border-red-900/50 text-red-400 p-2 rounded-lg transition group"
                          title="Delete Gig"
                        >
                          <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.id} className="border-b border-slate-850 hover:bg-slate-850/50 transition">
                      <td className="py-4 px-4 text-sm font-bold text-slate-200">{r.title}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${r.type === 'DONATION' ? 'bg-indigo-950 border-indigo-500/50 text-indigo-400' : 'bg-amber-950 border-amber-500/50 text-amber-400'}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">{r.category}</td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteResource(r.id)}
                          className="bg-red-950/40 hover:bg-red-950 border border-red-900/50 text-red-400 p-2 rounded-lg transition group"
                          title="Delete Resource"
                        >
                          <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
