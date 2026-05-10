import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useTripStore } from './store/tripStore';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { CreateTrip } from './pages/CreateTrip';
import { TripDetail } from './pages/TripDetail';
import { AddStop } from './pages/AddStop';
import { StopDetail } from './pages/StopDetail';
import { Budget } from './pages/Budget';
import { Packing } from './pages/Packing';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';
import { ShareTrip } from './pages/ShareTrip';
import { PublicTrip } from './pages/PublicTrip';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const checkSession = useAuthStore((state) => state.checkSession);
  const loadTrips = useTripStore((state) => state.loadTrips);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (user) {
      loadTrips(user.id);
    }
  }, [user, loadTrips]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shared/:token" element={<PublicTrip />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-trip"
          element={
            <PrivateRoute>
              <CreateTrip />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:tripId"
          element={
            <PrivateRoute>
              <TripDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:tripId/add-stop"
          element={
            <PrivateRoute>
              <AddStop />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:tripId/stop/:stopId"
          element={
            <PrivateRoute>
              <StopDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:tripId/budget"
          element={
            <PrivateRoute>
              <Budget />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:tripId/packing"
          element={
            <PrivateRoute>
              <Packing />
            </PrivateRoute>
          }
        />
        <Route
          path="/trip/:tripId/notes"
          element={
            <PrivateRoute>
              <Notes />
            </PrivateRoute>
          }
        />
        <Route
          path="/share/:tripId"
          element={
            <PrivateRoute>
              <ShareTrip />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
