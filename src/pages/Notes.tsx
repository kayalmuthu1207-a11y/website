import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, Plus, Trash2, FileText, CreditCard as Edit2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TripNote {
  id: string;
  trip_id: string;
  trip_stop_id?: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function Notes() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const tripStops = useTripStore((state) => state.tripStops);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tripStopId: '',
  });

  useEffect(() => {
    if (!user || !tripId) {
      navigate('/login');
      return;
    }

    loadNotes();
  }, [tripId, user, navigate]);

  const loadNotes = async () => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from('trip_notes')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as TripNote[]) || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripId || !formData.content.trim()) {
      return;
    }

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('trip_notes')
          .update({
            title: formData.title || null,
            content: formData.content,
            trip_stop_id: formData.tripStopId || null,
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;

        const updated = data as TripNote;
        setNotes(
          notes.map((n) => (n.id === editingId ? updated : n))
        );
        setEditingId(null);
      } else {
        const { data, error } = await supabase
          .from('trip_notes')
          .insert([
            {
              trip_id: tripId,
              title: formData.title || null,
              content: formData.content,
              trip_stop_id: formData.tripStopId || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        setNotes([data as TripNote, ...notes]);
      }

      setFormData({ title: '', content: '', tripStopId: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleEditNote = (note: TripNote) => {
    setEditingId(note.id);
    setFormData({
      title: note.title || '',
      content: note.content,
      tripStopId: note.trip_stop_id || '',
    });
    setShowForm(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('trip_notes').delete().eq('id', id);

      if (error) throw error;
      setNotes(notes.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', content: '', tripStopId: '' });
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Trip Notes & Journal</h1>
          <p className="text-emerald-100 mt-2">{currentTrip.title}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-emerald-600" size={22} />
              Your Notes
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
              >
                <Plus size={18} />
                Add Note
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                {editingId ? 'Edit Note' : 'Create New Note'}
              </h3>
              <form onSubmit={handleSaveNote} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Restaurant recommendations"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Related Stop (Optional)
                  </label>
                  <select
                    value={formData.tripStopId}
                    onChange={(e) => setFormData({ ...formData, tripStopId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">General Note</option>
                    {tripStops.map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        {stop.city_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note here..."
                    rows={6}
                    className="input-field resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update Note' : 'Save Note'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-300" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-500 mb-6">Start adding notes to organize your trip ideas</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => {
                const stop = note.trip_stop_id ? tripStops.find((s) => s.id === note.trip_stop_id) : null;
                return (
                  <div key={note.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-emerald-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {note.title && (
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{note.title}</h3>
                        )}
                        {stop && (
                          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 mb-2">
                            <MapPin size={14} />
                            {stop.city_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-gray-400 mt-4">
                      {new Date(note.created_at).toLocaleDateString()} at{' '}
                      {new Date(note.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
