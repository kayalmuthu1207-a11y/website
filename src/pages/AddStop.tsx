import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, AlertCircle, Search, MapPin, Globe, DollarSign } from 'lucide-react';

const SAMPLE_CITIES = [
  { name: 'Paris', country: 'France', index: 1.2, image: 'https://images.pexels.com/photos/532836/pexels-photo-532836.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Barcelona', country: 'Spain', index: 0.9, image: 'https://images.pexels.com/photos/1754029/pexels-photo-1754029.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Rome', country: 'Italy', index: 1.0, image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Amsterdam', country: 'Netherlands', index: 1.1, image: 'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Berlin', country: 'Germany', index: 0.8, image: 'https://images.pexels.com/photos/1878717/pexels-photo-1878717.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'London', country: 'United Kingdom', index: 1.3, image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Vienna', country: 'Austria', index: 0.9, image: 'https://images.pexels.com/photos/3568460/pexels-photo-3568460.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Prague', country: 'Czech Republic', index: 0.7, image: 'https://images.pexels.com/photos/374848/pexels-photo-374848.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Istanbul', country: 'Turkey', index: 0.6, image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Athens', country: 'Greece', index: 0.8, image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Bangkok', country: 'Thailand', index: 0.5, image: 'https://images.pexels.com/photos/57916/pexels-photo-57916.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Tokyo', country: 'Japan', index: 1.2, image: 'https://images.pexels.com/photos/1484520/pexels-photo-1484520.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'New York', country: 'United States', index: 1.4, image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Sydney', country: 'Australia', index: 1.1, image: 'https://images.pexels.com/photos/1878717/pexels-photo-1878717.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

export function AddStop() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const tripStops = useTripStore((state) => state.tripStops);
  const addTripStop = useTripStore((state) => state.addTripStop);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof SAMPLE_CITIES[0] | null>(null);

  const [formData, setFormData] = useState({
    arrivalDate: '',
    departureDate: '',
  });

  const filteredCities = SAMPLE_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user || !currentTrip || !tripId) {
      setError('Missing required information');
      return;
    }

    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    if (!formData.arrivalDate || !formData.departureDate) {
      setError('Both arrival and departure dates are required');
      return;
    }

    if (new Date(formData.arrivalDate) >= new Date(formData.departureDate)) {
      setError('Departure date must be after arrival date');
      return;
    }

    setLoading(true);

    try {
      await addTripStop({
        trip_id: currentTrip.id,
        city_name: selectedCity.name,
        country: selectedCity.country,
        cost_index: selectedCity.index,
        arrival_date: formData.arrivalDate,
        departure_date: formData.departureDate,
        order_index: tripStops.length,
      });

      navigate(`/trip/${tripId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stop');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Add a Destination</h1>
          <p className="text-emerald-100 mt-2">Expand your {currentTrip.title} itinerary</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* City Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 -mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Globe className="text-emerald-600" size={22} />
              Choose a City
            </h2>

            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city or country..."
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border-2 flex items-center gap-3 ${
                    selectedCity?.name === city.name
                      ? 'bg-emerald-50 border-emerald-500 shadow-md'
                      : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm'
                  }`}
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{city.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{city.country}</span>
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        ${city.index}x
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 -mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <MapPin className="text-teal-600" size={22} />
              Travel Dates
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival Date</label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Date</label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {selectedCity && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Destination</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCity.image}
                      alt={selectedCity.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-lg font-bold text-gray-900">{selectedCity.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <DollarSign size={14} className="text-amber-500" />
                        Cost index: {selectedCity.index}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedCity}
                className="btn-primary w-full mt-4"
              >
                {loading ? 'Adding Stop...' : 'Add This Destination'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
