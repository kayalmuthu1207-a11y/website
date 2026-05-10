/*
  # Add missing RLS policies for users table

  1. Security Changes
    - Add INSERT policy for authenticated users to create their own profile
    - This is needed because when a user signs up, they need to insert their profile row
    - The policy checks that the user is inserting their own profile (auth.uid() = id)
*/

-- Add INSERT policy for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can create own profile'
  ) THEN
    CREATE POLICY "Users can create own profile"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
