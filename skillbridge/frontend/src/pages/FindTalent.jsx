import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Search, 
  MapPin, 
  Star, 
  Award,
  ChevronRight,
  Briefcase,
  X,
  Mail,
  Calendar,
  Send,
  Zap,
  TrendingUp
} from 'lucide-react';

const FindTalent = () => {
  const { user } = useAuth();
  
  // Lists
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState(null);
  
  // Modals
  const [showHireModal, setShowHireModal] = useState(false);
  
  // Search Filters
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minOppScore, setMinOppScore] = useState('');
  const [userType, setUserType] = useState('STUDENT'); // default to searching students

  // Hire Form Fields
  const [hireTitle, setHireTitle] = useState('');
  const [hireDesc, setHireDesc] = useState('');
  const [hireBudget, setHireBudget] = useState('');
  const [hireDeadline, setHireDeadline] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTalents = async () => {
    try {
      setLoading(true);
      let query = `/talents?userType=${userType}`;
      if (search) query += `&search=${search}`;
      if (skill) query += `&skill=${skill}`;
      if (minRating) query += `&minRating=${minRating}`;
      if (minOppScore) query += `&minOppScore=${minOppScore}`;
      
      const data = await api.get(query);
      setTalents(data);
      
      // Update selected profile details if set
      if (selectedTalent) {
        const freshProfile = await api.get(`/talents/${selectedTalent.id}`);
        setSelectedTalent(freshProfile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, [userType, minRating, minOppScore]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTalents();
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!hireTitle || !hireDesc || !hireBudget || !hireDeadline) {
      setError('Please fill in all fields to send the hiring offer.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/hire', {
        worker_id: selectedTalent.id,
        title: hireTitle,
        description: hireDesc,
        budget: parseFloat(hireBudget),
        deadline: hireDeadline
      });
      setSuccess(`Direct hiring proposal sent successfully to ${selectedTalent.full_name}! They have been notified.`);
      setHireTitle('');
      setHireDesc('');
      setHireBudget('');
      setHireDeadline('');
      setShowHireModal(false);
    } catch (err) {
      setError(err.message || 'Error submitting hire request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Find Talent</h1>
          <p className="text-sm text-slate-400 mt-1">Discover skilled students and community service providers in your neighborhood.</p>
        </div>
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
        {/* Left Side: Search and Listings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Switcher search types */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setUserType('STUDENT')}
              className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${userType === 'STUDENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Search Student Talent
            </button>
            <button
              onClick={() => setUserType('COMMUNITY_MEMBER')}
              className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${userType === 'COMMUNITY_MEMBER' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Search Community services
            </button>
          </div>

          {/* Search/Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800/80 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 relative">
              <input 
                type="text" 
                placeholder="Search names, bios..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
              />
              <Search className="absolute left-3 top-3 text-slate-500" size={14} />
            </div>

            <div className="md:col-span-3">
              <input 
                type="text" 
                placeholder="Skill (e.g. React)" 
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <select 
                value={minOppScore} 
                onChange={(e) => setMinOppScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-400"
              >
                <option value="">Rep. Score</option>
                <option value="60">&gt; 60</option>
                <option value="75">&gt; 75</option>
                <option value="90">&gt; 90</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-350 py-2.5 rounded-xl text-xs font-semibold transition">
                Apply Filters
              </button>
            </div>
          </form>

          {/* Cards list */}
          {loading && talents.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : talents.length > 0 ? (
            <div className="space-y-4">
              {talents.map(talent => (
                <div 
                  key={talent.id}
                  onClick={async () => {
                    setLoading(true);
                    const details = await api.get(`/talents/${talent.id}`);
                    setSelectedTalent(details);
                    setLoading(false);
                  }}
                  className={`bg-slate-900/60 border rounded-3xl p-5 hover:border-slate-700/60 transition group cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedTalent?.id === talent.id ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-850'}`}
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={talent.profile_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${talent.full_name}`} 
                      alt={talent.full_name} 
                      className="w-12 h-12 rounded-full border border-slate-850 bg-slate-950"
                    />
                    <div>
                      <h3 className="font-bold text-slate-200 group-hover:text-white transition text-base leading-tight">{talent.full_name}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {talent.user_type === 'STUDENT' 
                          ? `${talent.faculty} • ${talent.academic_year}` 
                          : `${talent.occupation} ${talent.business_name ? `(${talent.business_name})` : ''}`
                        }
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-amber-400 flex items-center gap-0.5">
                          <Star size={12} className="fill-amber-400" /> {talent.avg_rating} ({talent.completed_jobs} jobs)
                        </span>
                        <span className="bg-slate-950 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-850">
                          Reputation: {talent.opportunity_score}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs font-semibold text-emerald-400">
                      {talent.expected_rate > 0 ? `Rs. ${talent.expected_rate}/hr` : 'Rate Negotiable'}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={10} /> {talent.location}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/40 py-16 text-center rounded-3xl">
              <p className="text-sm text-slate-500 font-semibold">No active service profiles found matching filters.</p>
            </div>
          )}
        </div>

        {/* Right Side: Profile Details */}
        <div className="lg:col-span-5">
          {selectedTalent ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedTalent.profile_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedTalent.full_name}`} 
                    alt={selectedTalent.full_name} 
                    className="w-14 h-14 rounded-full border border-slate-800 bg-slate-950"
                  />
                  <div>
                    <h2 className="text-lg font-bold font-outfit text-white leading-tight">{selectedTalent.full_name}</h2>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider block mt-0.5">
                      {selectedTalent.user_type === 'STUDENT' ? '🎓 REGISTERED STUDENT' : '👤 COMMUNITY MEMBER'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTalent(null)}
                  className="text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Opportunity Score Block */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Award size={14} className="text-emerald-500" /> Opportunity Reputation Score
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400">{selectedTalent.opportunity_score} <span className="text-xs text-slate-500">/ 100</span></span>
                </div>
                
                {selectedTalent.opportunity_score_breakdown && (
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-850/60">
                      <span className="text-slate-500 block">Experience</span>
                      <span className="font-bold text-slate-200">{selectedTalent.opportunity_score_breakdown.experience}%</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-850/60">
                      <span className="text-slate-500 block">Reliability</span>
                      <span className="font-bold text-slate-200">{selectedTalent.opportunity_score_breakdown.reliability}%</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-850/60">
                      <span className="text-slate-500 block">Profile Comp.</span>
                      <span className="font-bold text-slate-200">{selectedTalent.opportunity_score_breakdown.profileCompleteness}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio & Profile data */}
              <div className="space-y-4 text-xs">
                {selectedTalent.user_type === 'STUDENT' ? (
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Academic Credentials</span>
                    <p className="text-slate-300 font-semibold">{selectedTalent.university}</p>
                    <p className="text-slate-400">{selectedTalent.faculty} • {selectedTalent.degree_program}</p>
                    <p className="text-slate-400 font-medium">Availability: {selectedTalent.availability}</p>
                  </div>
                ) : (
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Service Specifications</span>
                    <p className="text-slate-300 font-semibold">{selectedTalent.occupation}</p>
                    {selectedTalent.business_name && <p className="text-slate-400">Business: {selectedTalent.business_name}</p>}
                    <p className="text-slate-400 font-semibold text-emerald-400">Services: {selectedTalent.services}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bio</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-2xl">{selectedTalent.bio || 'No detailed biography provided yet.'}</p>
                </div>

                {/* Skills */}
                {selectedTalent.skills && selectedTalent.skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Skills & Expertise</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTalent.skills.map(s => (
                        <span key={s} className="bg-slate-950 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-850 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Action buttons */}
                {selectedTalent.id !== user.id && (
                  <div className="pt-4 border-t border-slate-850/60">
                    <button
                      onClick={() => setShowHireModal(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                    >
                      <Briefcase size={16} />
                      <span>Hire {selectedTalent.full_name}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/40 border-dashed rounded-3xl p-8 text-center py-24 sticky top-6">
              <Mail className="text-slate-700 mx-auto mb-4" size={40} />
              <p className="text-sm text-slate-500 font-semibold">Select a profile card to view dynamic credentials and send direct hire proposals.</p>
            </div>
          )}
        </div>
      </div>

      {/* Direct Hire Modal */}
      {showHireModal && selectedTalent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowHireModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Hire {selectedTalent.full_name}</h3>
            <p className="text-xs text-slate-400 mb-6">Describe the micro-job, set your proposed budget, and suggest a completion deadline.</p>

            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Title / Required Service</label>
                <input 
                  type="text" 
                  value={hireTitle}
                  onChange={(e) => setHireTitle(e.target.value)}
                  placeholder="e.g. Design printing shop discount flyer"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Budget (Rs.)</label>
                <input 
                  type="number" 
                  value={hireBudget}
                  onChange={(e) => setHireBudget(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Required Deadline Date</label>
                <input 
                  type="date" 
                  value={hireDeadline}
                  onChange={(e) => setHireDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contract Work Details</label>
                <textarea 
                  value={hireDesc}
                  onChange={(e) => setHireDesc(e.target.value)}
                  placeholder="Outline the detailed tasks, specifications, and scope of work for the student..."
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
                {loading ? 'Submitting proposal...' : 'Send Direct Hire offer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTalent;
