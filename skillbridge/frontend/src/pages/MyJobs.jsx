import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star, 
  MessageSquare,
  Coins,
  TrendingUp,
  X,
  User,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

const MyJobs = () => {
  const { user } = useAuth();
  
  // Lists
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState({
    total_earned: 0,
    total_spent: 0,
    active_jobs: 0,
    completed_jobs: 0
  });

  // Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedJobForRating, setSelectedJobForRating] = useState(null);
  
  // Rating form
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/jobs');
      setJobs(data.jobs);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (jobId, status) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/jobs/${jobId}/status`, { status });
      setSuccess(`Job marked as ${status.toLowerCase()} successfully!`);
      fetchJobs();
    } catch (err) {
      setError(err.message || 'Error updating job status.');
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!ratingValue) {
      setError('Please select a rating score.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/jobs/${selectedJobForRating.id}/rate`, {
        rating_value: parseInt(ratingValue),
        feedback
      });
      setSuccess('Rating submitted successfully! Feedback has been shared.');
      setFeedback('');
      setRatingValue(5);
      setShowRateModal(false);
      fetchJobs();
    } catch (err) {
      setError(err.message || 'Error submitting rating.');
    } finally {
      setLoading(false);
    }
  };

  const postedJobs = jobs.filter(j => j.poster_id === user.id);
  const acceptedJobs = jobs.filter(j => j.worker_id === user.id);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white font-bold">My Jobs Tracker</h1>
        <p className="text-sm text-slate-400 mt-1">Track active contracts, manage completed jobs, and review earnings.</p>
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

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="border-r border-slate-850 pr-4 last:border-0">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Total income</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-outfit">Rs. {summary.total_earned.toLocaleString()}</span>
        </div>
        <div className="border-r border-slate-850 pr-4 last:border-0">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Total expenditure</span>
          <span className="text-2xl font-extrabold text-slate-200 font-outfit">Rs. {summary.total_spent.toLocaleString()}</span>
        </div>
        <div className="border-r border-slate-850 pr-4 last:border-0">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Active Contracts</span>
          <span className="text-2xl font-extrabold text-blue-400 font-outfit">{summary.active_jobs}</span>
        </div>
        <div className="last:border-0">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Completed Contracts</span>
          <span className="text-2xl font-extrabold text-purple-400 font-outfit">{summary.completed_jobs}</span>
        </div>
      </div>

      {/* Grid: Jobs Posted vs Jobs Accepted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columns 1: Jobs I Posted (Employer Mode) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
            <ClipboardList size={18} className="text-orange-400" />
            <span>Jobs I Posted (Employer)</span>
          </h2>

          <div className="space-y-4">
            {postedJobs.length > 0 ? (
              postedJobs.map(job => (
                <div key={job.id} className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-sm hover:border-slate-800 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${job.status === 'COMPLETED' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : job.status === 'IN_PROGRESS' ? 'bg-blue-950 border-blue-500/50 text-blue-400' : 'bg-red-950 border-red-500/50 text-red-400'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-200 text-sm mt-2 leading-snug">{job.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Hired Worker: {job.worker_name}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-400">Rs. {parseFloat(job.budget).toLocaleString()}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 border-t border-slate-850/60 pt-3 flex items-center justify-between">
                    <span>Started: {new Date(job.created_at).toLocaleDateString()}</span>
                    
                    <div className="flex gap-2">
                      {job.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold transition"
                          >
                            Complete Job
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'CANCELLED')}
                            className="bg-slate-950 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {job.status === 'COMPLETED' && !job.worker_rating && (
                        <button
                          onClick={() => {
                            setSelectedJobForRating(job);
                            setShowRateModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-0.5"
                        >
                          <Star size={10} className="fill-white" />
                          <span>Rate Student</span>
                        </button>
                      )}

                      {job.worker_rating && (
                        <span className="text-[10px] text-slate-500 italic">Rated: {job.worker_rating} Stars</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/10 border border-slate-850/50 p-8 text-center rounded-2xl">
                <p className="text-xs text-slate-500">You haven't posted any jobs or hired anyone yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Columns 2: Jobs I Accepted (Worker Mode) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
            <Briefcase size={18} className="text-emerald-400" />
            <span>Jobs I Accepted (Worker)</span>
          </h2>

          <div className="space-y-4">
            {acceptedJobs.length > 0 ? (
              acceptedJobs.map(job => (
                <div key={job.id} className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-4 shadow-sm hover:border-slate-800 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${job.status === 'COMPLETED' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : job.status === 'IN_PROGRESS' ? 'bg-blue-950 border-blue-500/50 text-blue-400' : 'bg-red-950 border-red-500/50 text-red-400'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-200 text-sm mt-2 leading-snug">{job.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Employer: {job.poster_name}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-400">Rs. {parseFloat(job.budget).toLocaleString()}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 border-t border-slate-850/60 pt-3 flex items-center justify-between">
                    <span>Assigned: {new Date(job.created_at).toLocaleDateString()}</span>
                    
                    <div className="flex gap-2">
                      {job.status === 'COMPLETED' && (
                        <span className="text-[10px] text-slate-500 italic">Job successfully completed. Earnings updated.</span>
                      )}
                      {job.status === 'IN_PROGRESS' && (
                        <span className="text-[10px] text-blue-400 flex items-center gap-1"><Clock size={10} /> In Progress...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/10 border border-slate-850/50 p-8 text-center rounded-2xl">
                <p className="text-xs text-slate-500">You haven't accepted or worked on any gigs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Submission Modal (for Employers rating Student workers) */}
      {showRateModal && selectedJobForRating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => {
                setShowRateModal(false);
                setSelectedJobForRating(null);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Leave Rating</h3>
            <p className="text-xs text-slate-400 mb-6">Leave a star review and comments to update the worker's Opportunity Score.</p>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Star rating (1 to 5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRatingValue(val)}
                      className={`p-2 rounded-xl text-xs transition border flex items-center gap-1 font-bold ${ratingValue === val ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
                    >
                      <Star size={16} className={ratingValue >= val ? 'fill-amber-400 text-amber-400' : ''} />
                      <span>{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Review feedback</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us about the student's professionalism, speed, and design results..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm transition mt-4 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
              >
                {loading ? 'Submitting review...' : 'Submit Rating'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
