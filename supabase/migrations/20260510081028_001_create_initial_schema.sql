/*
  # Traveloop Database Schema

  This migration creates the complete database structure for the Traveloop travel planning application.

  1. New Tables
    - `users` - Extended user profile data
    - `trips` - User's travel trips
    - `trip_stops` - Cities/locations within a trip
    - `activities` - Activities within trip stops
    - `packing_checklist_items` - Packing items for trips
    - `trip_notes` - Notes/journal entries for trips
    - `trip_expenses` - Expense tracking for trips

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read-only access for shared itineraries

  3. Relationships
    - trips belongs to users
    - trip_stops belongs to trips
    - activities belongs to trip_stops
    - All tracking tables belong to trips
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cover_image_url text,
  is_public boolean DEFAULT false,
  public_share_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trip_stops table
CREATE TABLE IF NOT EXISTS trip_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name text NOT NULL,
  country text,
  cost_index numeric(5,2),
  arrival_date date NOT NULL,
  departure_date date NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stops of own trips"
  ON trip_stops FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can manage stops of own trips"
  ON trip_stops FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stops of own trips"
  ON trip_stops FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stops of own trips"
  ON trip_stops FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stops.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_stop_id uuid NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  estimated_cost numeric(10,2) DEFAULT 0,
  duration_hours integer,
  time_of_day text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities of own trips"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = activities.trip_stop_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can manage activities of own trips"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = activities.trip_stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities of own trips"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = activities.trip_stop_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = activities.trip_stop_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities of own trips"
  ON activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trip_stops
      JOIN trips ON trips.id = trip_stops.trip_id
      WHERE trip_stops.id = activities.trip_stop_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create trip_expenses table
CREATE TABLE IF NOT EXISTS trip_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses of own trips"
  ON trip_expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage expenses of own trips"
  ON trip_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses of own trips"
  ON trip_expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses of own trips"
  ON trip_expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create packing_checklist_items table
CREATE TABLE IF NOT EXISTS packing_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text,
  is_packed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE packing_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view packing items of own trips"
  ON packing_checklist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = packing_checklist_items.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage packing items of own trips"
  ON packing_checklist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = packing_checklist_items.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update packing items of own trips"
  ON packing_checklist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = packing_checklist_items.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = packing_checklist_items.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete packing items of own trips"
  ON packing_checklist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = packing_checklist_items.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create trip_notes table
CREATE TABLE IF NOT EXISTS trip_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_stop_id uuid REFERENCES trip_stops(id) ON DELETE SET NULL,
  title text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes of own trips"
  ON trip_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage notes of own trips"
  ON trip_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes of own trips"
  ON trip_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes of own trips"
  ON trip_notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_notes.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);
CREATE INDEX IF NOT EXISTS idx_trips_public_token ON trips(public_share_token);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_stop_id ON activities(trip_stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip_id ON trip_expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_packing_items_trip_id ON packing_checklist_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_notes_trip_id ON trip_notes(trip_id);
