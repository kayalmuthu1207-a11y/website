import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, Plus, Trash2, Package, Check, Luggage } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PackingItem {
  id: string;
  trip_id: string;
  item_name: string;
  category: string;
  is_packed: boolean;
  created_at: string;
}

const PACKING_CATEGORIES = ['Clothing', 'Documents', 'Electronics', 'Toiletries', 'Accessories', 'Other'];

const CATEGORY_ICONS: Record<string, string> = {
  Clothing: '👕',
  Documents: '📄',
  Electronics: '🔌',
  Toiletries: '🧴',
  Accessories: '🎒',
  Other: '📦',
};

export function Packing() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const [items, setItems] = useState<PackingItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: PACKING_CATEGORIES[0],
  });

  useEffect(() => {
    if (!user || !tripId) {
      navigate('/login');
      return;
    }

    loadItems();
  }, [tripId, user, navigate]);

  const loadItems = async () => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from('packing_checklist_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems((data as PackingItem[]) || []);
    } catch (error) {
      console.error('Failed to load packing items:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripId || !formData.itemName) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('packing_checklist_items')
        .insert([
          {
            trip_id: tripId,
            item_name: formData.itemName,
            category: formData.category,
            is_packed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setItems([...items, data as PackingItem]);
      setFormData({ itemName: '', category: PACKING_CATEGORIES[0] });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add packing item:', error);
    }
  };

  const handleTogglePacked = async (id: string, isPacked: boolean) => {
    try {
      const { error } = await supabase
        .from('packing_checklist_items')
        .update({ is_packed: !isPacked })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map((item) => (item.id === id ? { ...item, is_packed: !isPacked } : item)));
    } catch (error) {
      console.error('Failed to update packing item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('packing_checklist_items').delete().eq('id', id);

      if (error) throw error;
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete packing item:', error);
    }
  };

  const packedCount = items.filter((i) => i.is_packed).length;
  const categoryItems = PACKING_CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((ci) => ci.items.length > 0);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Packing Checklist</h1>
          <p className="text-emerald-100 mt-2">{currentTrip.title}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Luggage className="text-emerald-600" size={22} />
                  Items to Pack
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleAddItem} className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                      <input
                        type="text"
                        value={formData.itemName}
                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                        placeholder="e.g., Passport, Sunscreen"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input-field"
                      >
                        {PACKING_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="btn-primary flex-1">Add Item</button>
                      <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                    </div>
                  </div>
                </form>
              )}

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-300" size={28} />
                  </div>
                  <p className="text-gray-500">No items yet. Start adding to your packing list</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {categoryItems.map((ci) => (
                    <div key={ci.category}>
                      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <span>{CATEGORY_ICONS[ci.category] || '📦'}</span>
                        {ci.category}
                        <span className="text-gray-400 font-normal normal-case">({ci.items.filter(i => i.is_packed).length}/{ci.items.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {ci.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 ${
                              item.is_packed
                                ? 'bg-emerald-50/50 border-emerald-100'
                                : 'bg-gray-50 border-gray-100 hover:border-emerald-100'
                            }`}
                          >
                            <button
                              onClick={() => handleTogglePacked(item.id, item.is_packed)}
                              className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                item.is_packed
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : 'border-gray-300 hover:border-emerald-400'
                              }`}
                            >
                              {item.is_packed && <Check size={14} className="text-white" />}
                            </button>
                            <span
                              className={`flex-1 text-sm ${item.is_packed ? 'line-through text-gray-400' : 'text-gray-900'}`}
                            >
                              {item.item_name}
                            </span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-emerald-600" size={22} />
                Packing Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Items Packed</p>
                    <p className="text-sm font-bold text-gray-900">
                      {packedCount} / {items.length}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-3 transition-all"
                      style={{
                        width: items.length > 0 ? `${(packedCount / items.length) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {items.length === 0
                    ? 'Add items to track your packing progress'
                    : `${Math.round((packedCount / items.length) * 100)}% complete`}
                </p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <h4 className="font-semibold text-gray-900 mb-3">Packing Tips</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">-</span> Pack heavier items at the bottom</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">-</span> Roll clothes to save space</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">-</span> Keep documents in a separate bag</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">-</span> Check weather before packing</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
