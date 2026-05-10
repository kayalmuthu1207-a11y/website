import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Plane, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Travel adventure"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-emerald-900/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Plane className="text-white" size={24} />
            </div>
            <span className="text-white font-bold text-2xl font-poppins">Traveloop</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white font-poppins leading-tight mb-6">
            Start your<br />travel story
          </h1>
          <p className="text-teal-100 text-lg max-w-md leading-relaxed">
            Join thousands of travelers who plan smarter, pack better, and travel with confidence.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-300" size={18} />
              </div>
              <span className="text-white/90">Smart itinerary planning</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-300" size={18} />
              </div>
              <span className="text-white/90">Budget tracking & expense management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-300" size={18} />
              </div>
              <span className="text-white/90">Packing lists & travel notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
        <div className="max-w-md w-full">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Plane className="text-white" size={28} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
            <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 mb-2 font-poppins">
              Create Account
            </h1>
            <p className="text-center text-gray-500 font-medium mb-8">
              Join the travel community
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-12"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-12"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              {password && (
                <div className="p-3 bg-emerald-50 rounded-xl space-y-2 border border-emerald-100">
                  <p className="text-xs font-semibold text-gray-600">Password strength:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className={passwordStrength.hasMinLength ? 'text-emerald-600' : 'text-gray-300'} />
                      <span className="text-xs text-gray-600">At least 6 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className={passwordStrength.hasUppercase ? 'text-emerald-600' : 'text-gray-300'} />
                      <span className="text-xs text-gray-600">One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className={passwordStrength.hasNumber ? 'text-emerald-600' : 'text-gray-300'} />
                      <span className="text-xs text-gray-600">One number</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-8"
              >
                {loading ? 'Creating account...' : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="divider my-6" />

            <p className="text-center text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
