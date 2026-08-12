import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Coins, 
  Check, 
  Send,
  SlidersHorizontal,
  X,
  FileText,
  UserCheck,
  Star,
  Zap,
  TrendingUp
} from 'lucide-react';

const Gigs = () => {
  const { user } = useAuth();
  
  // Lists
  const [gigs, setGigs] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [applications, setApplications] = useState([]);
  
  // Form toggles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAppsModal, setShowAppsModal] = useState(false);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // New Gig Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newGigCategory, setNewGigCategory] = useState('Graphic Design');
  const [budget, setBudget] = useState('');
  const [paymentType, setPaymentType] = useState('Fixed');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [duration, setDuration] = useState('');
  const [skills, setSkills] = useState('');

  // Application fields
  const [coverMessage, setCoverMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'IT & Technology', 'Graphic Design', 'Education & Tutoring', 
    'Photography', 'Video Editing', 'Writing', 'Repairs', 
    'Delivery', 'Business Services', 'Household Assistance', 'Other'
  ];

  const fetchGigs = async () => {
    try {
      setLoading(true);
      let query = `/gigs?status=OPEN`;
      if (category) query += `&category=${category}`;
      if (search) query += `&search=${search}`;
      if (minBudget) query += `&minBudget=${minBudget}`;
      if (maxBudget) query += `&maxBudget=${maxBudget}`;
      
      const data = await api.get(query);
      setGigs(data);
      
      // If selectedGig is set, update it with fresh data
      if (selectedGig) {
        const freshDetail = await api.get(`/gigs/${selectedGig.id}`);
        setSelectedGig(freshDetail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [category, minBudget, maxBudget]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGigs();
  };

  const handleCreateGig = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!title || !description || !newGigCategory || !budget || !location || !deadline || !duration) {
      setError('Please fill in all required fields.');
      return;
    }

    const skillsArr = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

    setLoading(true);
    try {
      await api.post('/gigs', {
        title,
        description,
        category: newGigCategory,
        budget: parseFloat(budget),
        payment_type: paymentType,
        location,
        deadline,
        duration,
        skills: skillsArr,
        latitude: 6.0725 + (Math.random() - 0.5) * 0.01, // Near faculty location
        longitude: 80.5750 + (Math.random() - 0.5) * 0.01
      });
      
      setSuccess('Gig posted successfully! Matching workers have been notified.');
      setTitle('');
      setDescription('');
      setBudget('');
      setLocation('');
      setDeadline('');
      setDuration('');
      setSkills('');
      setShowCreateModal(false);
      fetchGigs();
    } catch (err) {
      setError(err.message || 'Error creating gig.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyGig = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!coverMessage || !proposedPrice || !estimatedDuration) {
      setError('Please complete all application details.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/gigs/${selectedGig.id}/apply`, {
        cover_message: coverMessage,
        proposed_price: parseFloat(proposedPrice),
        estimated_duration: estimatedDuration
      });
      setSuccess('Application submitted successfully! The poster has been notified.');
      setCoverMessage('');
      setProposedPrice('');
      setEstimatedDuration('');
      setShowApplyModal(false);
      fetchGigs();
    } catch (err) {
      setError(err.message || 'Error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  const viewApplications = async (gig) => {
    try {
      setLoading(true);
      const apps = await api.get(`/gigs/${gig.id}/applications`);
      setApplications(apps);
      setShowAppsModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHireApplicant = async (appId) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/applications/${appId}`, { status: 'ACCEPTED' });
      setSuccess('Hired successfully! An active contract has been initialized, and other applicants notified.');
      setShowAppsModal(false);
      setSelectedGig(null);
      fetchGigs();
    } catch (err) {
      setError(err.message || 'Error hiring applicant.');
    }
  };

  const handleRejectApplicant = async (appId) => {
    try {
      await api.put(`/applications/${appId}`, { status: 'REJECTED' });
      // Refresh list
      const apps = await api.get(`/gigs/${selectedGig.id}/applications`);
      setApplications(apps);
    } catch (err) {
      console.error(err);
    }
  };

  // Check if hash matches scroll ID
  useEffect(() => {
    if (window.location.hash) {
      const gigId = window.location.hash.replace('#', '');
      if (gigId) {
        api.get(`/gigs/${gigId}`).then(data => setSelectedGig(data)).catch(console.error);
      }
    }
  }, [gigs]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Gigs / Jobs Board</h1>
          <p className="text-sm text-slate-400 mt-1">Browse hyperlocal micro-jobs or post a gig to get help immediately.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Plus size={18} />
          <span>Post a Gig</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Filter and Gig Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search bar and Filters */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800/80 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <input 
                type="text" 
                placeholder="Search gigs..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
              />
              <Search className="absolute left-3 top-3 text-slate-500" size={14} />
            </div>

            <div className="md:col-span-3">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-400"
              >
                <option value="">Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <input 
                type="number" 
                placeholder="Min Budget" 
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition">
                Filter
              </button>
            </div>
          </form>

          {/* Gigs List */}
          {loading && gigs.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : gigs.length > 0 ? (
            <div className="space-y-4">
              {gigs.map(gig => (
                <div 
                  key={gig.id}
                  onClick={async () => {
                    setLoading(true);
                    const details = await api.get(`/gigs/${gig.id}`);
                    setSelectedGig(details);
                    setLoading(false);
                  }}
                  className={`bg-slate-900/60 border rounded-3xl p-5 hover:border-slate-700/60 transition group cursor-pointer ${selectedGig?.id === gig.id ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-850'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-950/60 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-900/50 uppercase">
                        {gig.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Posted by {gig.poster_name}</span>
                    </div>

                    <h3 className="font-bold text-slate-200 group-hover:text-white transition text-base">{gig.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{gig.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-850/60">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {gig.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> Deadline: {gig.deadline}</span>
                      <span className="font-medium text-emerald-400 ml-auto">Rs. {parseFloat(gig.budget).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/40 py-16 text-center rounded-3xl">
              <p className="text-sm text-slate-500 font-semibold">No open gigs match your filters.</p>
            </div>
          )}
        </div>

        {/* Right Side: Gig Detail Panel */}
        <div className="lg:col-span-5">
          {selectedGig ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">{selectedGig.category}</span>
                    <h2 className="text-xl font-bold font-outfit text-white mt-1 leading-tight">{selectedGig.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedGig(null)}
                    className="text-slate-500 hover:text-slate-300 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-850 p-3.5 rounded-2xl">
                  <img 
                    src={selectedGig.poster_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedGig.poster_name}`} 
                    alt={selectedGig.poster_name}
                    className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800"
                  />
                  <div>
                    <span className="text-xs text-slate-300 font-bold block">{selectedGig.poster_name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{selectedGig.poster_type === 'STUDENT' ? 'Student Poster' : 'Community Employer'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gig Description</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-2xl whitespace-pre-wrap">{selectedGig.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Budget Offer</span>
                    <span className="text-sm font-bold text-emerald-400">Rs. {parseFloat(selectedGig.budget).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Estimated Work</span>
                    <span className="text-sm font-bold text-slate-200">{selectedGig.duration}</span>
                  </div>
                </div>

                {/* Skills Required */}
                {selectedGig.skills && selectedGig.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedGig.skills.map(s => (
                        <span key={s} className="bg-slate-950 text-slate-400 text-xs px-2.5 py-1 rounded-lg border border-slate-850 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Actions */}
                <div className="pt-4 border-t border-slate-850/60 flex gap-3">
                  {selectedGig.poster_id === user.id ? (
                    <button
                      onClick={() => viewApplications(selectedGig)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                    >
                      <UserCheck size={16} />
                      <span>Review Applicants ({applications.length || 0})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                    >
                      <Send size={16} />
                      <span>Apply for Gig</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Intelligent Matching Engine Panel (Only visible to Gig Posters!) */}
              {selectedGig.poster_id === user.id && selectedGig.recommendedWorkers && selectedGig.recommendedWorkers.length > 0 && (
                <div className="border-t border-slate-850/60 pt-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="text-emerald-500 fill-emerald-500 animate-pulse" size={14} />
                    <span>AI Matching recommendations</span>
                  </h3>

                  <div className="space-y-3">
                    {selectedGig.recommendedWorkers.map(worker => (
                      <div key={worker.id} className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={worker.profile_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${worker.full_name}`} 
                            alt={worker.full_name} 
                            className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block leading-tight">{worker.full_name}</span>
                            <span className="text-[9px] text-emerald-400 font-semibold block">{worker.match_percentage}% Match • {worker.distance} km away</span>
                          </div>
                        </div>

                        <Link to={`/talent`} className="bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition">
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/40 border-dashed rounded-3xl p-8 text-center py-24 sticky top-6">
              <FileText className="text-slate-700 mx-auto mb-4" size={40} />
              <p className="text-sm text-slate-500 font-semibold">Select a gig from the board to view full details and apply.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODALS SECTION
         ======================================================== */}

      {/* Modal 1: Create Gig */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Post a New Gig</h3>
            <p className="text-xs text-slate-400 mb-6">Describe the task, define a budget, and set skills needed to notify matching workers.</p>

            <form onSubmit={handleCreateGig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gig Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design a logo for local grocery"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={newGigCategory}
                    onChange={(e) => setNewGigCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Budget (Rs.)</label>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the tasks, deliverables, and specific requirements..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Approximate Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Matara Campus Area"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Duration</label>
                  <input 
                    type="text" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 days or 1 week"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deadline Date</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Graphic Design, Photoshop"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm transition mt-4 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
              >
                {loading ? 'Posting Gig...' : 'Post Gig & Find Workers'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Apply to Gig */}
      {showApplyModal && selectedGig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Apply for Gig</h3>
            <p className="text-xs text-slate-400 mb-6">Propose your rate, completion duration, and write a cover message.</p>

            <form onSubmit={handleApplyGig} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Proposed Rate (Rs.)</label>
                  <input 
                    type="number" 
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder={selectedGig.budget}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Est. Completion</label>
                  <input 
                    type="text" 
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g. 2 days"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Message</label>
                <textarea 
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Introduce yourself, explain your relevant skills, and why you are suited for this gig..."
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
                {loading ? 'Submitting Application...' : 'Send Application'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Review Applications (Poster Only) */}
      {showAppsModal && selectedGig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowAppsModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Applicants for "{selectedGig.title}"</h3>
            <p className="text-xs text-slate-400 mb-6">Review candidate qualifications, Opportunity Score, calculated Match Percentage, and choose the best person.</p>

            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map(app => (
                  <div key={app.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <img 
                          src={app.applicant_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${app.applicant_name}`} 
                          alt={app.applicant_name}
                          className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900"
                        />
                        <div>
                          <span className="font-bold text-slate-200 text-sm block">{app.applicant_name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{app.university} • {app.degree_program}</span>
                        </div>
                      </div>

                      {/* Cover Message */}
                      <div className="bg-slate-900/60 border border-slate-850/80 p-3 rounded-xl text-xs text-slate-400 italic">
                        "{app.cover_message}"
                      </div>

                      {/* Matching and Stats Grids */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Proposed Rate</span>
                          <span className="text-xs font-bold text-emerald-400">Rs. {parseFloat(app.proposed_price).toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Opp. Score</span>
                          <span className="text-xs font-bold text-purple-400">{app.opportunity_score}/100</span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Rating</span>
                          <span className="text-xs font-bold text-amber-400 flex justify-center items-center gap-0.5"><Star size={10} className="fill-amber-400" /> {app.avg_rating}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">AI Match</span>
                          <span className="text-xs font-bold text-green-400">{app.match_percentage}%</span>
                        </div>
                      </div>

                      {/* Matching reasons lists */}
                      <div className="bg-slate-900/20 p-3.5 rounded-xl border border-slate-850/50 space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Recommendation breakdown</span>
                        {app.reasons && app.reasons.map((r, i) => (
                          <div key={i} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleHireApplicant(app.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition text-center flex items-center justify-center gap-1.5"
                      >
                        <UserCheck size={14} />
                        <span>Hire Student</span>
                      </button>
                      <button 
                        onClick={() => handleRejectApplicant(app.id)}
                        className="flex-1 bg-slate-900 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-850 px-4 py-2.5 rounded-xl font-bold text-xs transition text-center"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-950 border border-slate-850 p-8 text-center rounded-2xl py-12">
                  <p className="text-xs text-slate-500 font-semibold">No applications received yet for this gig.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gigs;
