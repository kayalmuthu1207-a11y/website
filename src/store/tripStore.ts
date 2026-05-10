import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image_url?: string;
  is_public: boolean;
  public_share_token?: string;
  created_at: string;
  updated_at: string;
}

export interface TripStop {
  id: string;
  trip_id: string;
  city_name: string;
  country?: string;
  cost_index?: number;
  arrival_date: string;
  departure_date: string;
  latitude?: number;
  longitude?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  trip_stop_id: string;
  title: string;
  description?: string;
  category?: string;
  estimated_cost: number;
  duration_hours?: number;
  time_of_day?: string;
  created_at: string;
  updated_at: string;
}

interface TripStore {
  trips: Trip[];
  currentTrip: Trip | null;
  tripStops: TripStop[];
  activities: Activity[];
  loadTrips: (userId: string) => Promise<void>;
  createTrip: (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => Promise<Trip>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  setCurrentTrip: (trip: Trip) => Promise<void>;
  loadTripStops: (tripId: string) => Promise<void>;
  addTripStop: (stop: Omit<TripStop, 'id' | 'created_at' | 'updated_at'>) => Promise<TripStop>;
  updateTripStop: (id: string, updates: Partial<TripStop>) => Promise<void>;
  deleteTripStop: (id: string) => Promise<void>;
  loadActivities: (tripStopId: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  currentTrip: null,
  tripStops: [],
  activities: [],

  loadTrips: async (userId: string) => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ trips: (data as Trip[]) || [] });
  },

  createTrip: async (trip) => {
    const { data, error } = await supabase
      .from('trips')
      .insert([trip])
      .select()
      .single();

    if (error) throw error;
    const newTrip = data as Trip;
    set({ trips: [newTrip, ...get().trips] });
    return newTrip;
  },

  updateTrip: async (id: string, updates: Partial<Trip>) => {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updated = data as Trip;
    set({
      trips: get().trips.map((t) => (t.id === id ? updated : t)),
      currentTrip: get().currentTrip?.id === id ? updated : get().currentTrip,
    });
  },

  deleteTrip: async (id: string) => {
    const { error } = await supabase.from('trips').delete().eq('id', id);

    if (error) throw error;
    set({
      trips: get().trips.filter((t) => t.id !== id),
      currentTrip: get().currentTrip?.id === id ? null : get().currentTrip,
    });
  },

  setCurrentTrip: async (trip: Trip) => {
    set({ currentTrip: trip });
    await get().loadTripStops(trip.id);
  },

  loadTripStops: async (tripId: string) => {
    const { data, error } = await supabase
      .from('trip_stops')
      .select('*')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    set({ tripStops: (data as TripStop[]) || [] });
  },

  addTripStop: async (stop) => {
    const { data, error } = await supabase
      .from('trip_stops')
      .insert([stop])
      .select()
      .single();

    if (error) throw error;
    const newStop = data as TripStop;
    set({ tripStops: [...get().tripStops, newStop] });
    return newStop;
  },

  updateTripStop: async (id: string, updates: Partial<TripStop>) => {
    const { data, error } = await supabase
      .from('trip_stops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updated = data as TripStop;
    set({
      tripStops: get().tripStops.map((s) => (s.id === id ? updated : s)),
    });
  },

  deleteTripStop: async (id: string) => {
    const { error } = await supabase.from('trip_stops').delete().eq('id', id);

    if (error) throw error;
    set({ tripStops: get().tripStops.filter((s) => s.id !== id) });
  },

  loadActivities: async (tripStopId: string) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('trip_stop_id', tripStopId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    set({ activities: (data as Activity[]) || [] });
  },

  addActivity: async (activity) => {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();

    if (error) throw error;
    const newActivity = data as Activity;
    set({ activities: [...get().activities, newActivity] });
    return newActivity;
  },

  updateActivity: async (id: string, updates: Partial<Activity>) => {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updated = data as Activity;
    set({
      activities: get().activities.map((a) => (a.id === id ? updated : a)),
    });
  },

  deleteActivity: async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);

    if (error) throw error;
    set({ activities: get().activities.filter((a) => a.id !== id) });
  },
}));
