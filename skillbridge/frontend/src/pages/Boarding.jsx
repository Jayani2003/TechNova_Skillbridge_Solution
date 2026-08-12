import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Search, 
  X,
  Phone,
  Tag,
  CheckSquare,
  Home as HomeIcon,
  Maximize2
} from 'lucide-react';

const Boarding = () => {
  const { user } = useAuth();
  
  // Lists
  const [boardings, setBoardings] = useState([]);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  
  // Form modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [rooms, setRooms] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  // New Boarding Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [roomsCount, setRoomsCount] = useState(1);
  const [contactMethod, setContactMethod] = useState('');
  const [formFacilities, setFormFacilities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const facilityOptions = [
    'Wi-Fi', 'Water', 'Electricity', 'Furnished', 
    'Kitchen', 'Parking', 'Laundry', 'Attached bathroom'
  ];

  const fetchBoardings = async () => {
    try {
      setLoading(true);
      let query = `/boarding?1=1`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;
      if (maxDistance) query += `&maxDistance=${maxDistance}`;
      if (rooms) query += `&rooms=${rooms}`;
      if (selectedFacilities.length > 0) {
        selectedFacilities.forEach(f => {
          query += `&facility=${f}`;
        });
      }

      const data = await api.get(query);
      setBoardings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardings();
  }, [maxPrice, maxDistance, rooms, selectedFacilities]);

  const handleFacilityFilterToggle = (f) => {
    if (selectedFacilities.includes(f)) {
      setSelectedFacilities(selectedFacilities.filter(item => item !== f));
    } else {
      setSelectedFacilities([...selectedFacilities, f]);
    }
  };

  const handleFormFacilityToggle = (f) => {
    if (formFacilities.includes(f)) {
      setFormFacilities(formFacilities.filter(item => item !== f));
    } else {
      setFormFacilities([...formFacilities, f]);
    }
  };

  const handleCreateBoarding = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !price || !location || !distance || !availableDate || !contactMethod) {
      setError('Please fill in all required housing details.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/boarding', {
        title,
        description,
        price: parseFloat(price),
        location,
        distance_from_faculty: parseFloat(distance),
        available_date: availableDate,
        rooms_count: parseInt(roomsCount),
        facilities: formFacilities,
        contact_method: contactMethod,
        latitude: 6.0725 + (Math.random() - 0.5) * 0.01,
        longitude: 80.5750 + (Math.random() - 0.5) * 0.01
      });

      setSuccess('Boarding lodging space listed successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setDistance('');
      setAvailableDate('');
      setRoomsCount(1);
      setContactMethod('');
      setFormFacilities([]);
      setShowCreateModal(false);
      fetchBoardings();
    } catch (err) {
      setError(err.message || 'Error posting boarding listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Boarding Lodging</h1>
          <p className="text-sm text-slate-400 mt-1">Discover verified accommodations, boarding houses, and rooms near the university faculties.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Plus size={18} />
          <span>List Boarding Space</span>
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
          {/* Filters card */}
          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              Filter lodging listings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Price (Rs./month)</label>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Campus Distance (km)</label>
                <input 
                  type="number" 
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  placeholder="e.g. 1.5"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Min Rooms capacity</label>
                <input 
                  type="number" 
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-200"
                />
              </div>
            </div>

            {/* Checkboxes list */}
            <div className="pt-2 border-t border-slate-850/60">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Filter by facilities</span>
              <div className="flex flex-wrap gap-2">
                {facilityOptions.map(f => (
                  <button
                    key={f}
                    onClick={() => handleFacilityFilterToggle(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition border ${selectedFacilities.includes(f) ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards List */}
          {loading && boardings.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : boardings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {boardings.map(b => (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBoarding(b)}
                  className={`bg-slate-900/60 border rounded-3xl p-5 hover:border-slate-700/60 transition group cursor-pointer flex flex-col justify-between space-y-4 ${selectedBoarding?.id === b.id ? 'border-emerald-600 ring-1 ring-emerald-600' : 'border-slate-850'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">Rs. {parseFloat(b.price).toLocaleString()}/month</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{b.distance_from_faculty} km from campus</span>
                    </div>

                    <h3 className="font-bold text-slate-200 group-hover:text-white transition text-base leading-tight">{b.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{b.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-850/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[150px]"><MapPin size={12} /> {b.location}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline">
                      <span>Details</span>
                      <Maximize2 size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/40 py-16 text-center rounded-3xl">
              <p className="text-sm text-slate-500 font-semibold">No boarding spaces found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Right Side: details panel */}
        <div className="lg:col-span-4">
          {selectedBoarding ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Boarding Details</span>
                  <h2 className="text-lg font-bold font-outfit text-white mt-1 leading-tight">{selectedBoarding.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedBoarding(null)}
                  className="text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Monthly Rent</span>
                  <span className="text-xs font-bold text-emerald-400">Rs. {parseFloat(selectedBoarding.price).toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Distance to Faculty</span>
                  <span className="text-xs font-bold text-slate-200">{selectedBoarding.distance_from_faculty} km</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Description</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-2xl">{selectedBoarding.description}</p>
              </div>

              {/* Facilities */}
              {selectedBoarding.facilities && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Facilities Provided</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBoarding.facilities.split(',').map(f => (
                      <span key={f} className="bg-slate-950 text-slate-400 text-[10px] px-2.5 py-1 rounded-lg border border-slate-850 font-medium">{f.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Contact Information</span>
                <p className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{selectedBoarding.contact_method}</span>
                </p>
                <span className="text-[9px] text-slate-500 block">Listed by landlord: {selectedBoarding.poster_name}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800/40 border-dashed rounded-3xl p-8 text-center py-24 sticky top-6">
              <HomeIcon className="text-slate-700 mx-auto mb-4" size={40} />
              <p className="text-sm text-slate-500 font-semibold">Select a listing to view detailed facilities, rent rates, and landlord contacts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Boarding Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 bg-slate-950 p-1.5 rounded-lg border border-slate-850"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold font-outfit text-white mb-2">List Boarding Lodging Space</h3>
            <p className="text-xs text-slate-400 mb-6">Describe the lodgings, monthly price, and check facility checkboxes to list it on the map.</p>

            <form onSubmit={handleCreateBoarding} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Listing Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Luxury Single Room near Tech Faculty"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Rent (Rs.)</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 6500"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Distance to Faculty (km)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 0.5"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the facilities, roommates rules, bills specifications, and lodging description..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Date</label>
                  <input 
                    type="date" 
                    value={availableDate}
                    onChange={(e) => setAvailableDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rooms capacity</label>
                  <input 
                    type="number" 
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address / Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Karagoda Uyangoda, Matara"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Facilities check boxes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Facilities Provided</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {facilityOptions.map(f => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => handleFormFacilityToggle(f)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold transition border text-center ${formFacilities.includes(f) ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Method</label>
                <input 
                  type="text" 
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  placeholder="e.g. Call Priyantha on 0767778888"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm transition mt-4 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
              >
                {loading ? 'Submitting housing...' : 'Post Boarding Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boarding;
