import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Briefcase, 
  Star, 
  Clock, 
  HeartHandshake, 
  Gift, 
  Coins, 
  Edit3, 
  X, 
  Check,
  Zap
} from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  
  // Lists
  const [profileData, setProfileData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  
  // Toggle Form
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  
  // Student fields
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('');
  const [availability, setAvailability] = useState('');
  const [expectedRate, setExpectedRate] = useState('');
  const [bio, setBio] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  // Community fields
  const [occupation, setOccupation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Fetch full profile info including ratings history
      const data = await api.get(`/talents/${user.id}`);
      setProfileData(data);

      // Fetch personal impact data
      const impact = await api.get(`/impact/users/${user.id}`);
      setImpactData(impact);

      // Load form defaults
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      
      if (data.user_type === 'STUDENT') {
        setUniversity(data.university || '');
        setFaculty(data.faculty || '');
        setAcademicYear(data.academic_year || '1st Year');
        setDegreeProgram(data.degree_program || '');
        setAvailability(data.availability || '');
        setExpectedRate(data.expected_rate !== undefined && data.expected_rate !== null ? data.expected_rate : '');
        setBio(data.bio || '');
        setSkillsStr(data.skills ? data.skills.join(', ') : '');
      } else {
        setOccupation(data.occupation || '');
        setBusinessName(data.business_name || '');
        setServices(data.services || '');
        setBio(data.bio || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user?.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    const targetUserType = profileData?.user_type || user?.user_type;
    const isStudentUser = targetUserType === 'STUDENT';
    const skillsArr = skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      location: location.trim(),
      user_type: targetUserType,
      ...(isStudentUser
        ? { 
            university: university.trim(), 
            faculty: faculty.trim(), 
            academic_year: academicYear, 
            degree_program: degreeProgram.trim(), 
            availability: availability.trim(), 
            expected_rate: parseFloat(expectedRate || 0), 
            bio: bio.trim(), 
            skills: skillsArr 
          }
        : { 
            occupation: occupation.trim(), 
            business_name: businessName.trim(), 
            services: services.trim(), 
            bio: bio.trim() 
          }
      )
    };

    setSubmitting(true);
    try {
      await api.put('/auth/profile', payload);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      if (refreshUser) {
        await refreshUser();
      }
      loadProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Error updating profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profileData || !impactData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isStudent = profileData.user_type === 'STUDENT';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* 1. Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={profileData.profile_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileData.full_name}`} 
              alt={profileData.full_name} 
              className="w-16 h-16 rounded-full border border-emerald-500/30 bg-slate-950 shadow-md"
            />
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-950/60 border border-emerald-900/50 px-2 py-0.5 rounded">
                {isStudent ? '🎓 Student' : '👤 Community Member'}
              </span>
              <h1 className="text-2xl font-extrabold font-outfit text-white mt-1 leading-tight">{profileData.full_name}</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {isStudent ? `${profileData.faculty} • ${profileData.university}` : `${profileData.occupation}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccess('');
              setIsEditing(!isEditing);
            }}
            className="bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer z-10"
          >
            {isEditing ? (
              <>
                <X size={14} />
                <span>Cancel Edit</span>
              </>
            ) : (
              <>
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </>
            )}
          </button>
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

      {/* Profile Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile Details or Edit Form */}
        <div className="lg:col-span-8 space-y-6">
          {isEditing ? (
            /* ========================================================
               EDIT FORM VIEW
               ======================================================== */
            <form noValidate onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <h3 className="text-sm font-bold font-outfit text-slate-350 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Edit3 size={16} />
                <span>Update Profile Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Location Address</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              {isStudent ? (
                /* Student Specific Edit */
                <div className="space-y-4 pt-4 border-t border-slate-850/60">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">🎓 Student details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">University</label>
                      <input 
                        type="text" 
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty</label>
                      <input 
                        type="text" 
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Degree Program</label>
                      <input 
                        type="text" 
                        value={degreeProgram}
                        onChange={(e) => setDegreeProgram(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Year</label>
                      <select 
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Availability slots</label>
                      <input 
                        type="text" 
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g. Evenings, Weekends"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Hourly Rate (Rs.)</label>
                      <input 
                        type="number" 
                        value={expectedRate}
                        onChange={(e) => setExpectedRate(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={skillsStr}
                      onChange={(e) => setSkillsStr(e.target.value)}
                      placeholder="e.g. React, Node.js, Photoshop"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              ) : (
                /* Community Specific Edit */
                <div className="space-y-4 pt-4 border-t border-slate-850/60">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest">👤 Community member details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Occupation</label>
                      <input 
                        type="text" 
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Business Name (Optional)</label>
                      <input 
                        type="text" 
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Services You Can Offer</label>
                    <input 
                      type="text" 
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="e.g. Printing, Typing, Copywriting"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Biography (Bio)</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about your goals, qualifications, background, and services..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ========================================================
               NORMAL DETAIL VIEW
               ======================================================== */
            <div className="space-y-6">
              {/* Bio block */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biography</h3>
                <p className="text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-2xl">
                  {profileData.bio || 'No personal biography provided yet. Edit your profile to write one!'}
                </p>
              </div>

              {/* Specific detail specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isStudent ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🎓 Study specifications</h3>
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-400">University: <span className="font-semibold text-slate-200">{profileData.university}</span></p>
                      <p className="text-slate-400">Faculty: <span className="font-semibold text-slate-200">{profileData.faculty}</span></p>
                      <p className="text-slate-400">Academic Year: <span className="font-semibold text-slate-200">{profileData.academic_year}</span></p>
                      <p className="text-slate-400">Degree: <span className="font-semibold text-slate-200">{profileData.degree_program}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">👤 Services Specifications</h3>
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-400">Occupation: <span className="font-semibold text-slate-200">{profileData.occupation}</span></p>
                      {profileData.business_name && <p className="text-slate-400">Business: <span className="font-semibold text-slate-200">{profileData.business_name}</span></p>}
                      <p className="text-slate-400">Services Offered: <span className="font-semibold text-emerald-400">{profileData.services || 'Not defined'}</span></p>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Credentials</h3>
                  <div className="space-y-2.5 text-xs text-slate-350">
                    <p className="flex items-center gap-2"><Mail size={14} className="text-slate-500" /> {profileData.email}</p>
                    <p className="flex items-center gap-2"><Phone size={14} className="text-slate-500" /> {profileData.phone}</p>
                    <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> {profileData.location}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {isStudent && profileData.skills && profileData.skills.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills Directory</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.skills.map(s => (
                      <span key={s} className="bg-slate-950 text-slate-400 text-xs px-3 py-1.5 rounded-xl border border-slate-850 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews and Ratings History */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span>Feedback Ratings ({profileData.ratings?.length || 0})</span>
                </h3>

                <div className="divide-y divide-slate-850">
                  {profileData.ratings && profileData.ratings.length > 0 ? (
                    profileData.ratings.map(review => (
                      <div key={review.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <img 
                              src={review.reviewer_image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${review.reviewer_name}`} 
                              alt={review.reviewer_name}
                              className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800"
                            />
                            <div>
                              <span className="font-semibold text-slate-200 text-xs block leading-tight">{review.reviewer_name}</span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">Job: {review.job_title}</span>
                            </div>
                          </div>
                          
                          <div className="flex text-amber-400 items-center gap-0.5 text-xs font-bold">
                            <Star size={12} className="fill-amber-400" />
                            <span>{review.rating_value}.0</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-950/20 p-3 rounded-xl border border-slate-850/40">
                          "{review.feedback}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">No reviews or ratings received yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Reputation & Personal Impact Grid */}
        <div className="lg:col-span-4 space-y-6">
          {/* Opportunity Reputation Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={16} className="text-emerald-500" />
              <span>Platform Reputation Score</span>
            </h3>

            <div className="text-center py-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <span className="text-5xl font-black font-outfit text-white block">
                {profileData.opportunity_score}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1 block">
                Opportunity Score
              </span>
            </div>

            {profileData.opportunity_score_breakdown && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg">
                  <span className="text-slate-550">Experience rating</span>
                  <span className="font-bold text-slate-200">{profileData.opportunity_score_breakdown.experience}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg">
                  <span className="text-slate-550">Availability factor</span>
                  <span className="font-bold text-slate-200">{profileData.opportunity_score_breakdown.availability}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg">
                  <span className="text-slate-550">Reliability factor</span>
                  <span className="font-bold text-slate-200">{profileData.opportunity_score_breakdown.reliability}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg">
                  <span className="text-slate-550">Profile details completion</span>
                  <span className="font-bold text-slate-200">{profileData.opportunity_score_breakdown.profileCompleteness}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Personal Economic & Community Impact Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={16} className="text-emerald-500 fill-emerald-500" />
              <span>Personal SkillBridge Impact</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                <Briefcase size={16} className="text-emerald-400 mx-auto" />
                <span className="text-base font-bold text-white block">{impactData.jobsCompleted}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Jobs Done</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                <Coins size={16} className="text-amber-400 mx-auto" />
                <span className="text-xs font-bold text-emerald-400 block truncate">
                  Rs. {isStudent ? impactData.earned.toLocaleString() : impactData.spent.toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">
                  {isStudent ? 'Earnings' : 'Investments'}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                <Clock size={16} className="text-blue-400 mx-auto" />
                <span className="text-base font-bold text-white block">{impactData.hoursContributed}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Hours Done</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                <HeartHandshake size={16} className="text-red-400 mx-auto" />
                <span className="text-base font-bold text-white block">{impactData.peopleHelped}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Locals Helped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
