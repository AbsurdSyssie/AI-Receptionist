import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // Import listener
import { auth } from "./firebase"; // Firebase Auth instance
import LoginPage from "./LoginPage";
import CallTablePage from "./CallTablePage";
import CallDetailsPage from "./CallDetailsPage";

const App = () => {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user if logged in, null if logged out
      setLoading(false); // Stop loading once auth state is known
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show a loading state until auth is resolved
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/calls" />
            ) : (
              <LoginPage onLogin={(user) => setUser(user)} />
            )
          }
        />
        <Route
          path="/calls"
          element={user ? <CallTablePage /> : <Navigate to="/" />}
        />
        <Route
          path="/calls/:id"
          element={user ? <CallDetailsPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
