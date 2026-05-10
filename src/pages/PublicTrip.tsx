import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Copy, Check, Home, Plane, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Trip, TripStop } from '../store/tripStore';

export function PublicTrip() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPublicTrip();
  }, [token]);

  const loadPublicTrip = async () => {
    if (!token) return;

    try {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('public_share_token', token)
        .maybeSingle();

      if (tripError) throw tripError;

      if (!tripData) {
        navigate('/');
        return;
      }

      setTrip(tripData);

      const { data: stopsData, error: stopsError } = await supabase
        .from('trip_stops')
        .select('*')
        .eq('trip_id', tripData.id)
        .order('order_index', { ascending: true });

      if (stopsError) throw stopsError;
      setStops(stopsData || []);
    } catch (error) {
      console.error('Failed to load public trip:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-gray-500">Loading trip...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <button
            onClick={() => navigate('/')}
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-5 font-medium transition-colors"
          >
            <Home size={20} />
            Back to Traveloop
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">{trip.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-emerald-100 text-sm">
                  <Calendar size={16} />
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/30">
                  {totalDays} days
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center gap-2 border border-white/30 self-start"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {trip.description && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Trip</h2>
            <p className="text-gray-600 leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Itinerary - Timeline */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Itinerary</h2>

          {stops.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stops planned yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-300 to-cyan-300 hidden md:block" />

              <div className="space-y-4">
                {stops.map((stop, index) => {
                  const arrivalDate = new Date(stop.arrival_date);
                  const departureDate = new Date(stop.departure_date);
                  const days = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={stop.id} className="relative md:pl-16">
                      <div className="absolute left-4 top-6 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full border-4 border-white shadow-md hidden md:block z-10" />

                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-emerald-100 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md md:hidden">
                            <span className="text-white font-bold text-xs">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md hidden md:inline-block">Stop {index + 1}</span>
                              <h3 className="text-lg font-bold text-gray-900">{stop.city_name}</h3>
                            </div>
                            {stop.country && <p className="text-gray-500 text-sm">{stop.country}</p>}
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                                <Clock size={14} className="text-teal-500" />
                                {days} {days === 1 ? 'day' : 'days'}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                                <Calendar size={14} className="text-emerald-500" />
                                {arrivalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              {stop.cost_index && (
                                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                                  <DollarSign size={14} className="text-amber-500" />
                                  {stop.cost_index}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Overview Stats */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Destinations</p>
                  <p className="text-3xl font-bold text-emerald-600">{stops.length}</p>
                </div>
                <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MapPin className="text-emerald-600" size={22} />
                </div>
              </div>
            </div>
            <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Duration</p>
                  <p className="text-3xl font-bold text-teal-600">{totalDays}</p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-teal-600" size={22} />
                </div>
              </div>
            </div>
            <div className="p-5 bg-cyan-50 rounded-2xl border border-cyan-100">
              <button
                onClick={() => navigate('/')}
                className="w-full h-full flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-11 h-11 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Plane className="text-cyan-600" size={22} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500">Plan your trip</p>
                  <p className="text-cyan-600 hover:text-cyan-700 font-bold text-sm">Create one</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
