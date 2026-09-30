import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, onAuthStateChanged, User } from './firebase';
import { Home } from './components/Home';
import { Layout } from './components/Layout';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { WorkoutLogger } from './pages/WorkoutLogger';
import { WorkoutHistory } from './pages/WorkoutHistory';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="font-mono text-xs uppercase tracking-[0.5em] animate-pulse">
          Initializing System...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/log" /> : <Home />} />
        
        {user && (
          <>
            <Route path="/library" element={<Layout><ExerciseLibrary /></Layout>} />
            <Route path="/log" element={<Layout><WorkoutLogger /></Layout>} />
            <Route path="/history" element={<Layout><WorkoutHistory /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
