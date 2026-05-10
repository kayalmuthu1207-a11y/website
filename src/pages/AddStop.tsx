import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, AlertCircle, Search, MapPin, Globe, DollarSign, Calendar, Plane, Star, Users, ChevronRight } from 'lucide-react';

const SAMPLE_CITIES = [
  { name: 'Paris', country: 'France', index: 1.2, image: 'https://images.pexels.com/photos/532836/pexels-photo-532836.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'City of Light', travelers: '2.4k' },
  { name: 'Barcelona', country: 'Spain', index: 0.9, image: 'https://images.pexels.com/photos/1754029/pexels-photo-1754029.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Art & Architecture', travelers: '1.8k' },
  { name: 'Rome', country: 'Italy', index: 1.0, image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Eternal City', travelers: '2.1k' },
  { name: 'Amsterdam', country: 'Netherlands', index: 1.1, image: 'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Canals & Culture', travelers: '1.5k' },
  { name: 'Berlin', country: 'Germany', index: 0.8, image: 'https://images.pexels.com/photos/1878717/pexels-photo-1878717.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'History & Nightlife', travelers: '1.3k' },
  { name: 'London', country: 'United Kingdom', index: 1.3, image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Royal Capital', travelers: '3.2k' },
  { name: 'Vienna', country: 'Austria', index: 0.9, image: 'https://images.pexels.com/photos/3568460/pexels-photo-3568460.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Music & Elegance', travelers: '980' },
  { name: 'Prague', country: 'Czech Republic', index: 0.7, image: 'https://images.pexels.com/photos/374848/pexels-photo-374848.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Fairytale City', travelers: '1.1k' },
  { name: 'Istanbul', country: 'Turkey', index: 0.6, image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'East Meets West', travelers: '1.6k' },
  { name: 'Athens', country: 'Greece', index: 0.8, image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Ancient Wonders', travelers: '890' },
  { name: 'Bangkok', country: 'Thailand', index: 0.5, image: 'https://images.pexels.com/photos/57916/pexels-photo-57916.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Street Food Capital', travelers: '2.8k' },
  { name: 'Tokyo', country: 'Japan', index: 1.2, image: 'https://images.pexels.com/photos/1484520/pexels-photo-1484520.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Tradition & Future', travelers: '2.2k' },
  { name: 'New York', country: 'United States', index: 1.4, image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'The Big Apple', travelers: '4.1k' },
  { name: 'Sydney', country: 'Australia', index: 1.1, image: 'https://images.pexels.com/photos/1878717/pexels-photo-1878717.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Harbor City', travelers: '1.4k' },
  { name: 'Marrakech', country: 'Morocco', index: 0.5, image: 'https://images.pexels.com/photos/1913951/pexels-photo-1913951.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Red City', travelers: '760' },
  { name: 'Bali', country: 'Indonesia', index: 0.4, image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=600', tagline: 'Island Paradise', travelers: '3.5k' },
];

const POPULAR_TAGS = ['Europe', 'Asia', 'Budget-Friendly', 'Beach', 'Culture', 'Adventure', 'Food'];

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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showDateForm, setShowDateForm] = useState(false);

  const [formData, setFormData] = useState({
    arrivalDate: '',
    departureDate: '',
  });

  const filteredCities = SAMPLE_CITIES.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTag === 'Europe') return matchesSearch && ['France', 'Spain', 'Italy', 'Netherlands', 'Germany', 'United Kingdom', 'Austria', 'Czech Republic', 'Greece', 'Turkey'].includes(city.country);
    if (activeTag === 'Asia') return matchesSearch && ['Thailand', 'Japan', 'Indonesia'].includes(city.country);
    if (activeTag === 'Budget-Friendly') return matchesSearch && city.index <= 0.7;
    if (activeTag === 'Beach') return matchesSearch && ['Thailand', 'Indonesia', 'Greece', 'Morocco', 'Australia'].includes(city.country);
    if (activeTag === 'Culture') return matchesSearch && ['France', 'Italy', 'Japan', 'Austria', 'Czech Republic'].includes(city.country);
    if (activeTag === 'Adventure') return matchesSearch && ['Turkey', 'Morocco', 'Thailand', 'Indonesia'].includes(city.country);
    if (activeTag === 'Food') return matchesSearch && ['Thailand', 'Italy', 'Japan', 'France', 'Spain'].includes(city.country);
    return matchesSearch;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCity = (city: typeof SAMPLE_CITIES[0]) => {
    setSelectedCity(city);
    setShowDateForm(true);
    setError('');
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
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-5 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Trip
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Plane className="text-emerald-200" size={24} />
            <span className="text-emerald-200 text-sm font-semibold uppercase tracking-wider">{currentTrip.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Explore Destinations</h1>
          <p className="text-emerald-100 mt-2 text-base">Search and add your next destination to the itinerary</p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-5 top-4 text-gray-400" size={22} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities, countries, or vibes..."
                className="w-full pl-14 pr-6 py-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base border-0"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTag === null
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
            }`}
          >
            All
          </button>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTag === tag
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCities.map((city) => (
            <button
              key={city.name}
              onClick={() => handleSelectCity(city)}
              className={`group relative h-64 rounded-2xl overflow-hidden text-left transition-all duration-300 ${
                selectedCity?.name === city.name
                  ? 'ring-3 ring-emerald-500 shadow-xl scale-[1.02]'
                  : 'hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Selected Badge */}
              {selectedCity?.name === city.name && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                  Selected
                </div>
              )}

              {/* Cost Index Badge */}
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/20">
                <DollarSign size={12} className="inline -mt-0.5" />
                {city.index}x
              </div>

              {/* City Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg leading-tight">{city.name}</h3>
                <p className="text-white/70 text-sm">{city.country}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-emerald-300 text-xs font-medium">{city.tagline}</p>
                  <div className="flex items-center gap-1 text-white/50 text-xs">
                    <Users size={12} />
                    {city.travelers}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No cities found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Date Selection Panel - slides in when city selected */}
        {showDateForm && selectedCity && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDateForm(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* City Preview Header */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={selectedCity.image}
                  alt={selectedCity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="text-white font-bold text-2xl">{selectedCity.name}</h3>
                  <p className="text-white/70 text-sm">{selectedCity.country} - {selectedCity.tagline}</p>
                </div>
                <button
                  onClick={() => setShowDateForm(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>

              {/* Date Form */}
              <div className="p-6">
                {error && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar size={14} className="inline mr-1.5 -mt-0.5 text-emerald-500" />
                        Arrival
                      </label>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar size={14} className="inline mr-1.5 -mt-0.5 text-teal-500" />
                        Departure
                      </label>
                      <input
                        type="date"
                        name="departureDate"
                        value={formData.departureDate}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  {/* Cost Index Info */}
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <DollarSign className="text-amber-500" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Cost Index: {selectedCity.index}x</p>
                      <p className="text-xs text-gray-500">
                        {selectedCity.index < 0.7 ? 'Budget-friendly destination' : selectedCity.index < 1.1 ? 'Moderate cost level' : 'Higher cost destination'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? 'Adding...' : (
                      <>
                        <MapPin size={18} />
                        Add {selectedCity.name} to Itinerary
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
