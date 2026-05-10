import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { Plus, MapPin, Calendar, Settings, LogOut, Plane, TrendingUp, Clock, Globe, Zap, Compass, Star } from 'lucide-react';
import { TripCard } from '../components/TripCard';

const FEATURED_DESTINATIONS = [
  { name: 'Santorini', country: 'Greece', image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600', trips: '2.4k' },
  { name: 'Kyoto', country: 'Japan', image: 'https://images.pexels.com/photos/1484520/pexels-photo-1484520.jpeg?auto=compress&cs=tinysrgb&w=600', trips: '1.8k' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=600', trips: '3.1k' },
  { name: 'Marrakech', country: 'Morocco', image: 'https://images.pexels.com/photos/1913951/pexels-photo-1913951.jpeg?auto=compress&cs=tinysrgb&w=600', trips: '1.2k' },
];

const TRAVEL_TIPS = [
  { icon: Compass, title: 'Smart Planning', desc: 'Build day-by-day itineraries with our timeline view' },
  { icon: Zap, title: 'Budget Tracking', desc: 'Monitor expenses across all your destinations' },
  { icon: Star, title: 'Packing Lists', desc: 'Never forget essentials with smart checklists' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const trips = useTripStore((state) => state.trips);
  const loadTrips = useTripStore((state) => state.loadTrips);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTrips(user.id);
  }, [user, navigate, loadTrips]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const upcomingTrips = trips.filter((t) => new Date(t.start_date) >= new Date());
  const pastTrips = trips.filter((t) => new Date(t.end_date) < new Date());
  const totalTrips = trips.length;
  const daysPlanned = trips.reduce((sum, t) => {
    const days = Math.ceil((new Date(t.end_date).getTime() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-cyan-600/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <Plane className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-poppins text-white">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'Traveler'}!
                </h1>
                <p className="text-emerald-100 text-base mt-1">Ready to plan your next adventure?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 text-white/80 hover:text-white"
                title="Settings"
              >
                <Settings size={22} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 text-white/80 hover:text-red-200"
                title="Sign Out"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Row */}
        {trips.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-8 relative z-10 mb-12">
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-emerald-100 hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Trips</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{totalTrips}</p>
                  <p className="text-xs text-emerald-600 mt-2 font-semibold">Adventures planned</p>
                </div>
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <MapPin className="text-emerald-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-teal-100 hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Days Planned</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{daysPlanned}</p>
                  <p className="text-xs text-teal-600 mt-2 font-semibold">Of travel time</p>
                </div>
                <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Calendar className="text-teal-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-cyan-100 hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Upcoming</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{upcomingTrips.length}</p>
                  <p className="text-xs text-cyan-600 mt-2 font-semibold">Coming soon</p>
                </div>
                <div className="w-11 h-11 bg-cyan-50 rounded-xl flex items-center justify-center">
                  <Clock className="text-cyan-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-amber-100 hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Completed</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{pastTrips.length}</p>
                  <p className="text-xs text-amber-600 mt-2 font-semibold">Memories made</p>
                </div>
                <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-amber-600" size={22} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Destinations */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-lg flex items-center gap-3">
                <Compass className="text-emerald-600" size={28} />
                Featured Destinations
              </h2>
              <p className="text-gray-500 mt-1">Get inspired by popular travel spots</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURED_DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                className="group relative h-56 md:h-64 rounded-2xl overflow-hidden cursor-pointer hover-lift"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="text-white font-bold text-lg md:text-xl">{dest.name}</h3>
                  <p className="text-white/70 text-sm">{dest.country}</p>
                  <p className="text-emerald-300 text-xs font-semibold mt-2">{dest.trips} trips planned</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Tips / Features */}
        <div className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRAVEL_TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <div key={tip.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover-lift">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-emerald-600" size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{tip.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{tip.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Trips Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-lg flex items-center gap-3">
                <Globe className="text-emerald-600" size={28} />
                Your Trips
              </h2>
              <p className="text-gray-500 mt-1">Manage and track all your adventures</p>
            </div>
            <button
              onClick={() => navigate('/create-trip')}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus size={20} />
              Plan New Trip
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="bg-white rounded-2xl text-center py-20 border-2 border-dashed border-emerald-200 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Plane className="text-emerald-600" size={48} />
              </div>
              <h3 className="heading-lg mb-3">No adventures yet</h3>
              <p className="text-gray-500 mb-10 max-w-md mx-auto text-base">
                Start planning your next unforgettable journey today. Create your first trip and let the exploration begin!
              </p>
              <button
                onClick={() => navigate('/create-trip')}
                className="btn-primary mx-auto flex items-center gap-2 px-8 py-3"
              >
                <Plus size={20} />
                Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {upcomingTrips.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                    <div>
                      <h3 className="text-xl font-bold font-poppins text-gray-900">Upcoming Adventures</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{upcomingTrips.length} {upcomingTrips.length === 1 ? 'trip' : 'trips'} planned</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                </div>
              )}

              {pastTrips.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-gray-400 to-slate-400 rounded-full" />
                    <div>
                      <h3 className="text-xl font-bold font-poppins text-gray-900">Past Adventures</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{pastTrips.length} {pastTrips.length === 1 ? 'trip' : 'trips'} completed</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
