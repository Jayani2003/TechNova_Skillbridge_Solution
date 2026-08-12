import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { 
  MapPin, 
  Info, 
  ArrowRight, 
  ShieldAlert, 
  Coins, 
  Clock, 
  BookOpen, 
  Star, 
  User, 
  ShieldCheck, 
  Hammer, 
  HelpCircle, 
  Gift, 
  Calendar 
} from 'lucide-react';

const Nearby = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default coordinate center (Matara, Faculty of Technology area: ~6.0725, 80.5750)
  const defaultCenter = [6.0725, 80.5750];

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        setLoading(true);
        const data = await api.get('/opportunities/nearby');
        setOpportunities(data);
      } catch (err) {
        setError('Failed to load opportunities map data.');
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, []);

  // Bulletproof custom icon generator using Tailwind glow rings
  const createMarkerIcon = (color) => {
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute w-6 h-6 rounded-full opacity-30 animate-ping" style="background-color: ${color}"></div>
          <div class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-md" style="background-color: ${color}"></div>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white">Nearby Opportunities</h1>
        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
          <Info size={14} className="text-emerald-400" />
          <span>Map includes gigs, boarding, donation offers/requests, student workers, and community workers. Locations are slightly shifted for privacy.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[60vh] relative shadow-xl">
          {loading ? (
            <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 bg-slate-900/80 z-10 flex flex-col items-center justify-center text-center p-4">
              <ShieldAlert className="text-red-500 mb-2" size={32} />
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          ) : (
            <MapContainer 
              center={defaultCenter} 
              zoom={14} 
              scrollWheelZoom={true} 
              className="h-full w-full"
            >
              {/* Using standard OpenStreetMap dark-style tiles or public layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {opportunities.map((item) => (
                <Marker 
                  key={item.id} 
                  position={[item.latitude, item.longitude]}
                  icon={createMarkerIcon(item.color)}
                >
                  <Popup className="custom-popup bg-slate-900 text-slate-200">
                    <div className="p-3.5 space-y-3 max-w-[280px] sm:max-w-xs text-slate-200">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 px-2 py-0.5 bg-slate-950/60 rounded-md border border-slate-800">
                          {item.itemLabel || item.itemType}
                        </span>
                        {item.itemType === 'GIG' && <Coins size={12} className="text-blue-400" />}
                        {item.itemType === 'BOARDING' && <BookOpen size={12} className="text-yellow-400" />}
                        {item.itemType === 'DONATION' && <Gift size={12} className="text-green-400" />}
                        {item.itemType === 'REQUEST' && <HelpCircle size={12} className="text-pink-400" />}
                        {item.itemType === 'STUDENT_WORKER' && <User size={12} className="text-purple-400" />}
                        {item.itemType === 'COMMUNITY_WORKER' && <User size={12} className="text-orange-400" />}
                      </div>

                      {/* Title & Subtitle */}
                      <div className="space-y-0.5">
                        {item.route ? (
                          <Link to={item.route} className="font-extrabold text-slate-100 hover:text-emerald-400 hover:underline text-xs block leading-tight transition">
                            {item.title}
                          </Link>
                        ) : (
                          <h4 className="font-extrabold text-slate-100 text-xs block leading-tight">{item.title}</h4>
                        )}
                        <p className="text-[10px] font-semibold text-emerald-400">{item.subtitle}</p>
                      </div>

                      {/* Description / Bio Snippet */}
                      {(item.description || item.bio) && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed italic bg-slate-950/30 p-2 rounded-xl border border-slate-850">
                          "{item.description || item.bio}"
                        </p>
                      )}

                      {/* Dynamic Detailed Specs */}
                      <div className="space-y-1 pt-1 border-t border-slate-850/60 text-[10px] text-slate-300">
                        {/* Boarding House Details */}
                        {item.itemType === 'BOARDING' && (
                          <>
                            <div className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-yellow-400" /> <span>Rooms capacity: {item.roomsCount}</span></div>
                            {item.facilities && item.facilities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.facilities.slice(0, 3).map(f => (
                                  <span key={f} className="bg-slate-950 text-[9px] px-1.5 py-0.5 rounded border border-slate-850 text-slate-400">{f}</span>
                                ))}
                                {item.facilities.length > 3 && <span className="text-[8px] text-slate-500">+{item.facilities.length - 3}</span>}
                              </div>
                            )}
                          </>
                        )}

                        {/* Gig/Job Details */}
                        {item.itemType === 'GIG' && (
                          <>
                            <div className="flex items-center gap-1.5"><Clock size={11} className="text-blue-400" /> <span>Duration: {item.duration}</span></div>
                            <div className="flex items-center gap-1.5"><Calendar size={11} className="text-blue-400" /> <span>Deadline: {item.deadline}</span></div>
                          </>
                        )}

                        {/* Resource Donation/Request Details */}
                        {(item.itemType === 'DONATION' || item.itemType === 'REQUEST') && (
                          <div className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-emerald-400" /> <span>Condition: <span className="font-semibold text-slate-200">{item.condition}</span></span></div>
                        )}

                        {/* Student Worker Details */}
                        {item.itemType === 'STUDENT_WORKER' && (
                          <>
                            <div className="flex items-center gap-1.5"><BookOpen size={11} className="text-purple-400" /> <span>{item.faculty} ({item.academicYear})</span></div>
                            {item.skills && item.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.skills.slice(0, 3).map(s => (
                                  <span key={s} className="bg-slate-950 text-[9px] px-1.5 py-0.5 rounded border border-slate-850 text-slate-400">{s}</span>
                                ))}
                                {item.skills.length > 3 && <span className="text-[8px] text-slate-500">+{item.skills.length - 3}</span>}
                              </div>
                            )}
                          </>
                        )}

                        {/* Community Neighbor Details */}
                        {item.itemType === 'COMMUNITY_WORKER' && (
                          <>
                            <div className="flex items-center gap-1.5"><Hammer size={11} className="text-orange-400" /> <span>Occupation: {item.occupation}</span></div>
                            {item.businessName && <div className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-orange-400" /> <span>Business: {item.businessName}</span></div>}
                          </>
                        )}
                      </div>

                      {/* Location & Link Button */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5 truncate max-w-[130px]" title={item.location}>
                          <MapPin size={9} /> {item.location}
                        </span>
                        {item.route && (
                          <Link
                            to={item.route}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition shadow-md shadow-emerald-950/20"
                          >
                            <span>View Details</span>
                            <ArrowRight size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Legend & Quick List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Map Legend</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 border border-slate-950"></span>
                <span className="text-slate-350">Gigs / Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 border border-slate-950"></span>
                <span className="text-slate-350">Boarding Houses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 border border-slate-950"></span>
                <span className="text-slate-350">Donation Offers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500 border border-slate-950"></span>
                <span className="text-slate-350">Donation Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 border border-slate-950"></span>
                <span className="text-slate-350">Student Workers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 border border-slate-950"></span>
                <span className="text-slate-350">Community Neighbors</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nearby Opportunities List</h3>
            <div className="space-y-3">
              {opportunities.slice(0, 10).map((item) => (
                <div key={item.id} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">{item.itemLabel || item.itemType}</span>
                    <span className="font-bold text-xs text-slate-200 block truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.subtitle}</span>
                    {item.route && (
                      <Link to={item.route} className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 mt-1">
                        <span>Open</span>
                        <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nearby;
