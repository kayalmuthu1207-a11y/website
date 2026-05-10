import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import { ArrowLeft, Plus, Trash2, DollarSign, TrendingDown, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Expense {
  id: string;
  trip_id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  created_at: string;
}

const EXPENSE_CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: 'bg-emerald-500',
  Food: 'bg-amber-500',
  Transport: 'bg-teal-500',
  Activities: 'bg-cyan-500',
  Shopping: 'bg-pink-500',
  Other: 'bg-gray-500',
};

export function Budget() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentTrip = useTripStore((state) => state.currentTrip);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    description: '',
    amount: '',
  });

  useEffect(() => {
    if (!user || !tripId) {
      navigate('/login');
      return;
    }

    loadExpenses();
  }, [tripId, user, navigate]);

  const loadExpenses = async () => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from('trip_expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses((data as Expense[]) || []);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tripId || !formData.category || !formData.amount) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trip_expenses')
        .insert([
          {
            trip_id: tripId,
            category: formData.category,
            description: formData.description || null,
            amount: parseFloat(formData.amount),
            currency: 'USD',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setExpenses([data as Expense, ...expenses]);
      setFormData({ category: EXPENSE_CATEGORIES[0], description: '', amount: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('trip_expenses').delete().eq('id', id);

      if (error) throw error;
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  })).filter((cb) => cb.total > 0);

  const maxCategoryAmount = Math.max(...categoryBreakdown.map((cb) => cb.total), 1);

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
          <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins">Budget & Expenses</h1>
          <p className="text-emerald-100 mt-2">{currentTrip.title}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="text-emerald-600" size={22} />
                  Track Expenses
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                  <Plus size={18} />
                  Add Expense
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleAddExpense} className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input-field"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g., Dinner at Italian restaurant"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="btn-primary flex-1">Add Expense</button>
                      <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                    </div>
                  </div>
                </form>
              )}

              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-gray-300" size={28} />
                  </div>
                  <p className="text-gray-500">No expenses tracked yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-8 rounded-full ${CATEGORY_COLORS[expense.category] || 'bg-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm">{expense.category}</h3>
                          {expense.description && (
                            <p className="text-xs text-gray-500 truncate">{expense.description}</p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <p className="text-lg font-bold text-emerald-600">${expense.amount.toFixed(2)}</p>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
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
                <DollarSign className="text-emerald-600" size={22} />
                Total Budget
              </h3>
              <p className="text-4xl font-bold text-emerald-600">${totalBudget.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">{expenses.length} expenses tracked</p>
            </div>

            {categoryBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-5">By Category</h3>
                <div className="space-y-4">
                  {categoryBreakdown.map((cb) => (
                    <div key={cb.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cb.category] || 'bg-gray-400'}`} />
                          <p className="text-sm font-medium text-gray-700">{cb.category}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">${cb.total.toFixed(2)}</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${CATEGORY_COLORS[cb.category] || 'bg-gray-400'} rounded-full h-2 transition-all`}
                          style={{ width: `${(cb.total / maxCategoryAmount) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {((cb.total / totalBudget) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingDown className="text-emerald-600" size={18} />
                Budget Tip
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Track expenses as you go to stay informed about your spending and ensure you stay within budget.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
