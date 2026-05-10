import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, AlertCircle, MapPin, Calendar, FileText } from 'lucide-react';

export function CreateTrip() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const createTrip = useTripStore((state) => state.createTrip);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a trip');
      return;
    }

    if (!formData.title.trim()) {
      setError('Trip title is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Both start and end dates are required');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const trip = await createTrip({
        user_id: user.id,
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate,
        is_public: false,
      });

      navigate(`/trip/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
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
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Plan Your Next Adventure</h1>
          <p className="text-emerald-100 mt-2">Create a new trip and start exploring</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 -mt-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Trip Name</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., European Summer Adventure"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your trip plans, interests, and expectations..."
                  rows={4}
                  className="input-field pl-12 resize-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Optional - helps you remember what you want to do</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating Trip...' : 'Create Trip'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
