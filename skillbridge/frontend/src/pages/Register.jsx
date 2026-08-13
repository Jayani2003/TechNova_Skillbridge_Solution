import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, User, GraduationCap, MapPin, Mail, Key, Phone, ArrowRight, ChevronLeft } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [userType, setUserType] = useState('STUDENT'); // 'STUDENT' or 'COMMUNITY_MEMBER'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [location, setLocation] = useState('');

  // Student specific
  const [university, setUniversity] = useState('University of Ruhuna');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [studentRegistrationNo, setStudentRegistrationNo] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year');
  const [degreeProgram, setDegreeProgram] = useState('');

  // Community specific
  const [occupation, setOccupation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalEmail = userType === 'STUDENT' ? studentEmail : email;

    if (!fullName || !finalEmail || !password || !phone || !location) {
      setError('Please fill in all common required fields.');
      return;
    }

    const payload = {
      full_name: fullName,
      email: finalEmail,
      password,
      phone,
      user_type: userType,
      location,
      latitude: 6.0535 + (Math.random() - 0.5) * 0.02, // Simulate coordinates around Matara
      longitude: 80.5332 + (Math.random() - 0.5) * 0.02,
      whatsapp_no: whatsappNo,
      ...(userType === 'STUDENT' 
        ? { university, faculty, department, student_registration_no: studentRegistrationNo, student_email: studentEmail, academic_year: academicYear, degree_program: degreeProgram } 
        : { occupation, business_name: businessName, services }
      )
    };

    setLoading(true);
    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-6">
      <div className="w-full max-w-2xl mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ChevronLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Brand Title */}
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-600 w-10 h-10 rounded-xl text-white font-bold font-outfit text-xl flex items-center justify-center shadow-lg shadow-emerald-950/40">
          S
        </div>
        <div>
          <span className="font-bold text-xl font-outfit tracking-wide text-white block">SkillBridge</span>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Local Economy</span>
        </div>
      </Link>

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

        <h2 className="text-2xl font-bold font-outfit text-white text-center mb-1">Create Account</h2>
        <p className="text-xs text-slate-400 text-center mb-6">One identity system. Pick your profile type to personalize your experience.</p>

        {error && (
          <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-medium mb-6 flex items-center gap-2">
            <Shield size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* User Type Switcher */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
          <button
            type="button"
            onClick={() => setUserType('STUDENT')}
            className={`py-3.5 rounded-xl font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 uppercase ${userType === 'STUDENT' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GraduationCap size={16} />
            <span>I am a Student</span>
          </button>
          <button
            type="button"
            onClick={() => setUserType('COMMUNITY_MEMBER')}
            className={`py-3.5 rounded-xl font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 uppercase ${userType === 'COMMUNITY_MEMBER' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <User size={16} />
            <span>Community Member</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Common Information */}
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2">Common Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                  placeholder="e.g. Alex Fernando"
                  required
                />
              </div>

              {userType !== 'STUDENT' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="name@domain.com"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                  placeholder="e.g. 0771234567"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Number <span className="text-slate-500 font-normal lowercase">(optional)</span></label>
                <input
                  type="text"
                  value={whatsappNo}
                  onChange={(e) => setWhatsappNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                  placeholder="e.g. 0771234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Approximate Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                placeholder="e.g. Karagoda Uyangoda, Matara"
                required
              />
            </div>
          </div>

          {/* Section: Type Specific Information */}
          {userType === 'STUDENT' ? (
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2">🎓 Academic Profile Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. University of Ruhuna"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty</label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. Faculty of Technology"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. Information & Communication Technology"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student Registration No</label>
                  <input
                    type="text"
                    value={studentRegistrationNo}
                    onChange={(e) => setStudentRegistrationNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. TG/2021/1000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">University / Student Email</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="student123@fot.ruh.ac.lk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-slate-100 text-sm focus:outline-none transition"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Degree / Study Program</label>
                  <input
                    type="text"
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. BICT (Hons) or B.Sc Engineering"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2">👤 Community Profile Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Occupation / Profession</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. Small Business Owner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Business Name (Optional)</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                    placeholder="e.g. ABC Printing Shop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Services You Can Offer (Comma-separated)</label>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder-slate-700 focus:outline-none transition"
                  placeholder="e.g. Photocopy, Typing Services, Boarding Provider"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
