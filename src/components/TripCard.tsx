import { useNavigate } from 'react-router-dom';
import { Trip } from '../store/tripStore';
import { Calendar, MapPin, MoreVertical, CreditCard as Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTripStore } from '../store/tripStore';

const COVER_IMAGES = [
  'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1484520/pexels-photo-1484520.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=600',
];

interface Props {
  trip: Trip;
}

export function TripCard({ trip }: Props) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const deleteTrip = useTripStore((state) => state.deleteTrip);

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const isUpcoming = startDate >= new Date();

  const coverImage = trip.cover_image_url || COVER_IMAGES[Math.abs(trip.title.charCodeAt(0)) % COVER_IMAGES.length];

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(trip.id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="relative h-44 overflow-hidden">
        <img
          src={coverImage}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {isUpcoming && (
          <div className="absolute top-3 right-3">
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              Upcoming
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2 leading-snug">{trip.title}</h3>
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl z-10 border border-gray-100 overflow-hidden">
                <button
                  onClick={() => {
                    navigate(`/trip/${trip.id}/edit`);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 text-gray-700 font-medium transition-colors text-sm"
                >
                  <Edit2 size={16} />
                  Edit Trip
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 font-medium transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {trip.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{trip.description}</p>
        )}

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar size={14} className="text-emerald-500" />
            <span className="font-medium">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <MapPin size={14} className="text-teal-500" />
            <span className="font-medium">{daysCount} {daysCount === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/trip/${trip.id}`)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold text-sm hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-emerald-100"
        >
          View Trip
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
