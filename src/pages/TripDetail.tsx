import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, Plus, MapPin, Calendar, DollarSign, Package, FileText, Share2, Clock, ChevronRight } from 'lucide-react';

export function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const tripStops = useTripStore((state) => state.tripStops);
  const setCurrentTrip = useTripStore((state) => state.setCurrentTrip);
  const trips = useTripStore((state) => state.trips);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (tripId && trips.length > 0) {
      const trip = trips.find((t) => t.id === tripId);
      if (trip) {
        setCurrentTrip(trip);
      } else {
        navigate('/dashboard');
      }
    }
  }, [tripId, user, navigate, trips, setCurrentTrip]);

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-gray-500">Loading trip...</div>
      </div>
    );
  }

  const startDate = new Date(currentTrip.start_date);
  const endDate = new Date(currentTrip.end_date);
  const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'packing', label: 'Packing', icon: Package },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-5 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">{currentTrip.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-emerald-100 text-sm">
                  <Calendar size={16} />
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/30">
                  {daysCount} days
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/30">
                  {tripStops.length} stops
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/share/${currentTrip.id}`)}
              className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center gap-2 border border-white/30 self-start"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 -mt-6">
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-lg border border-gray-100 w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Itinerary Tab - Timeline Layout */}
        {activeTab === 'itinerary' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="heading-section">Your Itinerary</h2>
              <button
                onClick={() => navigate(`/trip/${currentTrip.id}/add-stop`)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Stop
              </button>
            </div>

            {tripStops.length === 0 ? (
              <div className="bg-white rounded-2xl text-center py-20 border-2 border-dashed border-emerald-200 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="text-emerald-600" size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No stops yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Start adding cities to your itinerary and plan your route
                </p>
                <button
                  onClick={() => navigate(`/trip/${currentTrip.id}/add-stop`)}
                  className="btn-primary mx-auto flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add First Stop
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-300 to-cyan-300 hidden md:block" />

                <div className="space-y-4">
                  {tripStops.map((stop, index) => {
                    const days = Math.ceil((new Date(stop.departure_date).getTime() - new Date(stop.arrival_date).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div
                        key={stop.id}
                        className="relative md:pl-16 cursor-pointer group"
                        onClick={() => navigate(`/trip/${currentTrip.id}/stop/${stop.id}`)}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-4 top-6 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full border-4 border-white shadow-md hidden md:block z-10" />

                        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-100 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md md:hidden">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md hidden md:inline-block">Stop {index + 1}</span>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">{stop.city_name}</h3>
                              </div>
                              {stop.country && <p className="text-gray-500 text-sm">{stop.country}</p>}
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                  <Clock size={14} className="text-teal-500" />
                                  {days} {days === 1 ? 'day' : 'days'}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                  <Calendar size={14} className="text-emerald-500" />
                                  {new Date(stop.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                {stop.cost_index && (
                                  <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                    <DollarSign size={14} className="text-amber-500" />
                                    {stop.cost_index}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-emerald-400 transition-colors flex-shrink-0" size={20} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="heading-section">Trip Budget & Expenses</h2>
                <p className="text-gray-500 text-sm">Track and manage all your trip expenses</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/trip/${currentTrip.id}/budget`)}
              className="btn-primary flex items-center gap-2"
            >
              View Detailed Budget
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Packing Tab */}
        {activeTab === 'packing' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <Package className="text-teal-600" size={24} />
              </div>
              <div>
                <h2 className="heading-section">Packing Checklist</h2>
                <p className="text-gray-500 text-sm">Keep track of everything you need to pack</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/trip/${currentTrip.id}/packing`)}
              className="btn-primary flex items-center gap-2"
            >
              Manage Packing List
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                <FileText className="text-cyan-600" size={24} />
              </div>
              <div>
                <h2 className="heading-section">Trip Notes & Journal</h2>
                <p className="text-gray-500 text-sm">Write notes and keep important reminders</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/trip/${currentTrip.id}/notes`)}
              className="btn-primary flex items-center gap-2"
            >
              View All Notes
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
