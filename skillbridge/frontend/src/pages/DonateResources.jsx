import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  MapPin, 
  X,
  Phone,
  Gift,
  HelpCircle,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
<<<<<<< HEAD
  Check
=======
  PhoneCall,
  MessageCircle
>>>>>>> jayaninew
} from 'lucide-react';

const DonateResources = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Lists
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Forms modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formType, setFormType] = useState('DONATION'); // 'DONATION' or 'REQUEST'

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Textbooks');
  const [itemCondition, setItemCondition] = useState('Good');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateSelectedResourceInUrl = (resourceId) => {
    const params = new URLSearchParams(searchParams);
    if (resourceId) {
      params.set('selected', String(resourceId));
    } else {
      params.delete('selected');
    }
    setSearchParams(params, { replace: true });
  };

  const toPhoneDigits = (phoneNumber) => String(phoneNumber || '').replace(/[^\d]/g, '');

  const categories = [
    'Textbooks', 'Calculators', 'Stationery', 'Clothes', 
    'Furniture', 'Electronics', 'Computer accessories', 'Bags', 'Other'
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      let query = `/resources?1=1`;
      if (type) query += `&type=${type}`;
      if (category) query += `&category=${category}`;
      if (search) query += `&search=${search}`;

      const data = await api.get(query);
      setResources(data);
      
      // Update selected detail if visible
      if (selectedResource) {
        const freshDetail = await api.get(`/resources/${selectedResource.id}`);
        setSelectedResource(freshDetail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, category, type]);

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (!selectedId) {
      return;
    }

    api.get(`/resources/${selectedId}`)
      .then((details) => {
        setSelectedResource(details);
        if (details.type && type !== details.type) {
          setType(details.type);
        }
      })
      .catch(() => setError('Selected resource could not be loaded.'));
  }, [searchParams]);

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !formCategory || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/resources', {
        title,
        description,
        category: formCategory,
        item_condition: itemCondition,
        type: formType,
        location,
        latitude: 6.0725 + (Math.random() - 0.5) * 0.02,
        longitude: 80.5750 + (Math.random() - 0.5) * 0.02
      });

      setSuccess(`Resource ${formType.toLowerCase()} posted successfully! Matches are calculated dynamically.`);
      setTitle('');
      setDescription('');
      setLocation('');
      setShowCreateModal(false);
      fetchResources();
    } catch (err) {
      setError(err.message || 'Error posting resource.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimResource = async (resourceId) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/resources/${resourceId}/status`, { status: 'DONATED' });
      setSuccess('Resource successfully marked as fulfilled/claimed! Platform impact metrics updated.');
      setSelectedResource(null);
      fetchResources();
    } catch (err) {
      console.error('Error claiming resource:', err);
      setError(err.message || 'Error updating resource status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Donate & Resources</h1>
          <p className="text-sm text-slate-400 mt-1">A circular exchange model for students to donate unused items or request educational equipment.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Plus size={18} />
          <span>Post Item / Request</span>
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
        {/* Left Side: Filter and Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search bar and Filters */}
          <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
              />
              <Search className="absolute left-3 top-3 text-slate-500" size={14} />
            </div>

            <div className="md:col-span-3">
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-400"
              >
                <option value="">Exchange Type</option>
                <option value="DONATION">Donations (Available Free)</option>
                <option value="REQUEST">Requests (Needed Items)</option>
              </select>
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
          </div>

          {/* Cards List */}
          {loading && resources.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map(item => (
                <div 
                  key={item.id}
                  onClick={() => updateSelectedResourceInUrl(item.id)}
                  className={`bg-slate-900/60 border rounded-3xl p-5 hover:border-slate-700/60 transition group cursor-pointer flex flex-col justify-between space-y-4 ${selectedResource?.id === item.id ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-850'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${item.type === 'DONATION' ? 'bg-emerald-950/60 border-emerald-900/50 text-emerald-400' : 'bg-pink-950/60 border-pink-900/50 text-pink-400'}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-200 group-hover:text-white transition text-base leading-tight">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-850/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[150px]"><MapPin size={12} /> {item.location}</span>
                    <span className="bg-slate-950 text-slate-400 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-850 flex items-center gap-1 group-hover:border-slate-700 transition">
                      <span>Details</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/40 py-16 text-center rounded-3xl">
              <p className="text-sm text-slate-500 font-semibold">No resource items or requests found matching filters.</p>
            </div>
          )}
        </div>

        {/* Right Side: details panel */}
        <div className="lg:col-span-4">
          {selectedResource ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${selectedResource.type === 'DONATION' ? 'bg-emerald-950/60 border-emerald-900/50 text-emerald-400' : 'bg-pink-950/60 border-pink-900/50 text-pink-400'}`}>
                    {selectedResource.type}
                  </span>
                  <h2 className="text-lg font-bold font-outfit text-white mt-2 leading-tight">{selectedResource.title}</h2>
                </div>
                <button 
                  onClick={() => updateSelectedResourceInUrl(null)}
                  className="text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Category</span>
                  <span className="text-xs font-bold text-slate-200">{selectedResource.category}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Item Condition</span>
                  <span className="text-xs font-bold text-slate-200">{selectedResource.item_condition}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Item Details</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-2xl">{selectedResource.description}</p>
              </div>

              {/* Contact info */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Contact owner</span>
                <p className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{selectedResource.owner_phone}</span>
                </p>
                {selectedResource.owner_phone && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`https://wa.me/${toPhoneDigits(selectedResource.owner_phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-950/60 border border-emerald-900/60 text-emerald-400 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                    >
                      <MessageCircle size={12} />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${selectedResource.owner_phone}`}
                      className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                    >
                      <PhoneCall size={12} />
                      <span>Call</span>
                    </a>
                    <a
                      href={`sms:${selectedResource.owner_phone}`}
                      className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
                    >
                      SMS
                    </a>
                  </div>
                )}
                <span className="text-[9px] text-slate-500 block">Listed by user: {selectedResource.owner_name}</span>
              </div>

              {/* Action: Mark as received / Fulfill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleClaimResource(selectedResource.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 cursor-pointer active:scale-[0.99]"
                >
                  <Gift size={16} />
                  <span>
                    {selectedResource.owner_id === user?.id 
                      ? `Mark My ${selectedResource.type === 'DONATION' ? 'Donation' : 'Request'} as Completed` 
                      : (selectedResource.type === 'DONATION' ? 'Mark Free Donation as Claimed' : 'Fulfill this Resource Request')}
                  </span>
                </button>
              </div>

              {/* Resource Matching Engine list (Only visible when viewing a REQUEST!) */}
              {selectedResource.type === 'REQUEST' && selectedResource.matches && selectedResource.matches.length > 0 && (
                <div className="border-t border-slate-850/60 pt-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="text-emerald-500 fill-emerald-500 animate-pulse" size={14} />
                    <span>Matching items found nearby</span>
                  </h3>

                  <div className="space-y-3">
                    {selectedResource.matches.map(match => (
                      <div key={match.id} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-slate-200 block leading-tight">{match.title}</span>
                            <span className="text-[9px] text-slate-500 mt-0.5 block">{match.distance} km away • Condition: {match.item_condition}</span>
                          </div>
                          <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-900/50 uppercase">Donation</span>
                        </div>
                        <div className="text-[10px] text-slate-400 border-t border-slate-900 pt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Phone size={10} className="text-emerald-400" /> {match.owner_phone} ({match.owner_name})</span>
                          {match.owner_phone && (
                            <span className="flex items-center gap-2">
                              <a href={`https://wa.me/${toPhoneDigits(match.owner_phone)}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300">WA</a>
                              <a href={`tel:${match.owner_phone}`} className="text-slate-300 hover:text-white">Call</a>
                              <a href={`sms:${match.owner_phone}`} className="text-slate-300 hover:text-white">SMS</a>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/40 border-dashed rounded-3xl p-8 text-center py-24 sticky top-6">
              <Gift className="text-slate-700 mx-auto mb-4" size={40} />
              <p className="text-sm text-slate-500 font-semibold">Select an item to view exchange details, contact details, or trigger matching donations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">Create Supply Exchange Post</h3>
            <p className="text-xs text-slate-400 mb-6">Choose whether you are donating a free item or requesting one, and list coordinates.</p>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-1 rounded-2xl mb-6 border border-slate-850">
              <button
                type="button"
                onClick={() => setFormType('DONATION')}
                className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${formType === 'DONATION' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Donate Free Item
              </button>
              <button
                type="button"
                onClick={() => setFormType('REQUEST')}
                className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${formType === 'REQUEST' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Request Item
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Item Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CASIO Scientific Calculator fx-991EX"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {formType === 'DONATION' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Condition</label>
                    <select
                      value={itemCondition}
                      onChange={(e) => setItemCondition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention standard details, condition specs, subject/syllabus codes for books..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address / Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Faculty Hostel Entrance"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm transition mt-4 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
              >
                {loading ? 'Posting...' : `Post ${formType === 'DONATION' ? 'Donation' : 'Request'}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateResources;
