import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, User as UserIcon, AlertCircle, Shield, LogOut, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data. Type YES to confirm')) {
      return;
    }

    setLoading(true);

    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user?.id || '');

      if (deleteError) throw deleteError;

      await signOut();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Account Settings</h1>
          <p className="text-emerald-100 mt-2">Manage your profile and preferences</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Profile */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <UserIcon className="text-emerald-600" size={22} />
              </div>
              Profile Information
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-emerald-700 font-medium text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="input-field opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-2">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <Shield className="text-teal-600" size={22} />
              </div>
              Account Actions
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 bg-amber-50 text-amber-700 hover:bg-amber-100 py-3.5 px-5 rounded-xl font-semibold border border-amber-200 transition-all duration-200"
              >
                <LogOut size={18} />
                Sign Out
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full flex items-center gap-3 bg-red-50 text-red-700 hover:bg-red-100 py-3.5 px-5 rounded-xl font-semibold border border-red-200 disabled:opacity-50 transition-all duration-200"
              >
                <Trash2 size={18} />
                {loading ? 'Deleting Account...' : 'Delete Account Permanently'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
              Deleting your account will permanently remove all your trips, data, and settings. This action cannot be undone.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
