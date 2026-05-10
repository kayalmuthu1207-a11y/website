import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, Plus, Trash2, MapPin, Calendar, Clock, DollarSign, Tag } from 'lucide-react';

const SAMPLE_ACTIVITIES = [
  { id: '1', title: 'City Walking Tour', category: 'Sightseeing', cost: 40, duration: 3 },
  { id: '2', title: 'Museum Visit', category: 'Culture', cost: 25, duration: 2 },
  { id: '3', title: 'Local Food Tour', category: 'Food', cost: 60, duration: 3 },
  { id: '4', title: 'Shopping', category: 'Shopping', cost: 0, duration: 4 },
  { id: '5', title: 'Beach Day', category: 'Relaxation', cost: 30, duration: 6 },
  { id: '6', title: 'Adventure Activity', category: 'Adventure', cost: 100, duration: 4 },
];

const CATEGORY_COLORS: Record<string, string> = {
  Sightseeing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Culture: 'bg-teal-50 text-teal-700 border-teal-200',
  Food: 'bg-amber-50 text-amber-700 border-amber-200',
  Shopping: 'bg-pink-50 text-pink-700 border-pink-200',
  Relaxation: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Adventure: 'bg-orange-50 text-orange-700 border-orange-200',
};

export function StopDetail() {
  const { tripId, stopId } = useParams<{ tripId: string; stopId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const tripStops = useTripStore((state) => state.tripStops);
  const activities = useTripStore((state) => state.activities);
  const loadActivities = useTripStore((state) => state.loadActivities);
  const addActivity = useTripStore((state) => state.addActivity);
  const deleteActivity = useTripStore((state) => state.deleteActivity);

  const stop = stopId ? tripStops.find((s) => s.id === stopId) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (stopId && stop) {
      loadActivities(stopId);
    }
  }, [stopId, stop, user, navigate, loadActivities]);

  const handleAddActivity = async (activity: typeof SAMPLE_ACTIVITIES[0]) => {
    if (!stop) return;

    try {
      await addActivity({
        trip_stop_id: stop.id,
        title: activity.title,
        category: activity.category,
        estimated_cost: activity.cost,
        duration_hours: activity.duration,
      });
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const handleRemoveActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
    } catch (error) {
      console.error('Failed to remove activity:', error);
    }
  };

  if (!stop || !currentTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const arrivalDate = new Date(stop.arrival_date);
  const departureDate = new Date(stop.departure_date);
  const days = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalCost = activities.reduce((sum, a) => sum + a.estimated_cost, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Trip
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">{stop.city_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {stop.country && (
              <span className="flex items-center gap-1.5 text-emerald-100 text-sm">
                <MapPin size={16} />
                {stop.country}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-emerald-100 text-sm">
              <Calendar size={16} />
              {arrivalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/30">
              {days} {days === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="text-emerald-600" size={22} />
                  Activities
                </h2>
                <button
                  onClick={() => {}}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                  <Plus size={18} />
                  Add Activity
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Tag className="text-emerald-400" size={28} />
                  </div>
                  <p className="text-gray-500 mb-6">No activities planned yet. Pick from suggestions below!</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {SAMPLE_ACTIVITIES.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => handleAddActivity(activity)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-100 hover:border-emerald-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{activity.title}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${CATEGORY_COLORS[activity.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                {activity.category}
                              </span>
                              <span>${activity.cost}</span>
                              <span>{activity.duration}h</span>
                            </div>
                          </div>
                          <Plus size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{activity.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${CATEGORY_COLORS[activity.category || ''] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                              {activity.category}
                            </span>
                            {activity.duration_hours && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {activity.duration_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4 flex items-center gap-3">
                          <p className="font-bold text-emerald-600">${activity.estimated_cost}</p>
                          <button
                            onClick={() => handleRemoveActivity(activity.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Activities */}
            {activities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Plus className="text-teal-600" size={22} />
                  Suggested Activities
                </h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {SAMPLE_ACTIVITIES.filter((a) => !activities.some((act) => act.title === a.title)).map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleAddActivity(activity)}
                      className="w-full text-left p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-100 hover:border-emerald-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{activity.title}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${CATEGORY_COLORS[activity.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                              {activity.category}
                            </span>
                            <span>${activity.cost}</span>
                            <span>{activity.duration}h</span>
                          </div>
                        </div>
                        <Plus size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Stop Summary</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} className="text-teal-500" />
                    Duration
                  </div>
                  <p className="text-xl font-bold text-gray-900">{days} {days === 1 ? 'day' : 'days'}</p>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Tag size={16} className="text-emerald-500" />
                    Activities
                  </div>
                  <p className="text-xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <DollarSign size={16} className="text-amber-500" />
                    Total Cost
                  </div>
                  <p className="text-xl font-bold text-emerald-600">${totalCost}</p>
                </div>
              </div>
            </div>

            {stop.cost_index && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Index</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-2.5 transition-all"
                      style={{ width: `${Math.min(stop.cost_index * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stop.cost_index.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stop.cost_index < 0.7 ? 'Budget-friendly' : stop.cost_index < 1.1 ? 'Moderate' : 'Expensive'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
