import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Bell, 
  Check, 
  Trash2, 
  Zap, 
  Briefcase, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondDirectHire = async (notifId, proposalStr, accept) => {
    setError('');
    setSuccess('');
    try {
      // Send accept/decline to backend
      const res = await api.post('/hire/respond', {
        proposalDetails: proposalStr,
        accept
      });
      
      setSuccess(accept ? 'Offer accepted! Job started.' : 'Offer declined.');
      
      // Mark notification as read
      await api.put(`/notifications/${notifId}/read`);
      
      fetchNotifications();
    } catch (err) {
      setError(err.message || 'Error processing response.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white font-bold">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">Review alerts, gig notifications, supply matches, and hiring proposals.</p>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl"
          >
            <Check size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm font-semibold animate-pulse">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* List */}
      {loading && notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mx-auto"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(notif => {
            const isOffer = notif.content.startsWith('OFFER_PROPOSAL:');
            let proposal = null;
            if (isOffer) {
              try {
                const jsonStr = notif.content.split('OFFER_PROPOSAL:')[1];
                proposal = JSON.parse(jsonStr);
              } catch (e) {
                console.error('Error parsing offer details:', e);
              }
            }

            return (
              <div 
                key={notif.id}
                className={`
                  border rounded-3xl p-5 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                  ${notif.is_read 
                    ? 'bg-slate-900/40 border-slate-850/60 opacity-75' 
                    : 'bg-slate-900 border-slate-800 shadow-md ring-1 ring-emerald-500/10'}
                `}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${notif.is_read ? 'bg-slate-700' : 'bg-emerald-500 animate-pulse'}`}></span>
                    <h3 className="font-bold text-slate-200 text-sm leading-snug">{notif.title}</h3>
                  </div>

                  {!isOffer ? (
                    <p className="text-xs text-slate-400 leading-relaxed pl-4">{notif.content}</p>
                  ) : (
                    proposal && (
                      <div className="bg-slate-950 border border-slate-850/60 p-4 rounded-2xl space-y-4 mt-2 max-w-xl pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">CONTRACT DETAILS</span>
                            <h4 className="font-bold text-sm text-slate-200 mt-1">{proposal.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{proposal.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase">Budget Offer</span>
                            <span className="text-xs font-bold text-emerald-400">Rs. {parseFloat(proposal.budget).toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase">Required Deadline</span>
                            <span className="text-xs font-bold text-slate-200">{new Date(proposal.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {!notif.is_read && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleRespondDirectHire(notif.id, notif.content.split('OFFER_PROPOSAL:')[1], true)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                            >
                              <CheckCircle size={14} />
                              <span>Accept Contract</span>
                            </button>
                            <button
                              onClick={() => handleRespondDirectHire(notif.id, notif.content.split('OFFER_PROPOSAL:')[1], false)}
                              className="flex-1 bg-slate-900 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-850 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                            >
                              <XCircle size={14} />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  )}
                  
                  <span className="text-[9px] text-slate-550 block pl-4">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>

                {!notif.is_read && !isOffer && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-xs text-slate-450 hover:text-white bg-slate-950 hover:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-850 flex items-center gap-1 transition flex-shrink-0"
                  >
                    <Check size={12} />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-850/50 py-24 text-center rounded-3xl">
          <Bell className="text-slate-800 mx-auto mb-4" size={40} />
          <p className="text-sm text-slate-500 font-semibold">No notifications or alerts found.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
