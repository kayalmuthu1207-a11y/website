import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, Share2, Copy, Check, Globe, Lock, Eye } from 'lucide-react';

export function ShareTrip() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const updateTrip = useTripStore((state) => state.updateTrip);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (tripId && !currentTrip) {
      navigate(`/trip/${tripId}`);
    }
  }, [user, tripId, currentTrip, navigate]);

  const generateShareLink = async () => {
    if (!tripId || !currentTrip) return;

    setLoading(true);

    try {
      const token = Math.random().toString(36).substring(2, 15);

      await updateTrip(tripId, {
        is_public: true,
        public_share_token: token,
      });
    } catch (error) {
      console.error('Failed to generate share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!currentTrip?.public_share_token) return;

    const shareLink = `${window.location.origin}/shared/${currentTrip.public_share_token}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublic = async () => {
    if (!tripId) return;

    setLoading(true);

    try {
      await updateTrip(tripId, {
        is_public: !currentTrip?.is_public,
      });
    } catch (error) {
      console.error('Failed to toggle public:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const shareLink = currentTrip.public_share_token
    ? `${window.location.origin}/shared/${currentTrip.public_share_token}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Share Your Trip</h1>
          <p className="text-emerald-100 mt-2">{currentTrip.title}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Share2 className="text-emerald-600" size={22} />
            </div>
            Share Your Itinerary
          </h2>

          <div className="space-y-8">
            {/* Public Toggle */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                {currentTrip.is_public ? <Globe className="text-emerald-600" size={20} /> : <Lock className="text-gray-500" size={20} />}
                Make Trip Public
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                When your trip is public, others can view and get inspired by your itinerary via a shared link.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePublic}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                    currentTrip.is_public
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-md disabled:opacity-50'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md disabled:opacity-50'
                  }`}
                >
                  {loading ? 'Loading...' : currentTrip.is_public ? 'Make Private' : 'Make Public'}
                </button>
                <span
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs ${
                    currentTrip.is_public
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {currentTrip.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            {/* Share Link */}
            {currentTrip.is_public && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Shareable Link</h3>
                <p className="text-gray-500 text-sm mb-5">Share this link with friends and family to inspire their travels:</p>

                {shareLink ? (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateShareLink}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Generating...' : 'Generate Share Link'}
                  </button>
                )}
              </div>
            )}

            {/* What viewers can see */}
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="text-emerald-600" size={18} />
                What viewers can see
              </h4>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </span>
                  Trip title, dates & description
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </span>
                  All stops, cities & locations
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </span>
                  Activities & itinerary details
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </span>
                  Budget breakdown & summaries
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock size={10} className="text-white" />
                  </span>
                  Read-only (cannot edit)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
