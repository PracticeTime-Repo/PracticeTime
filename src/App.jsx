// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './components/home/Home';
import Quiz from './components/quiz/Quiz';
import Login from './components/login/Login';
import Navbar from './components/navbar/Navbar';
import Progress from './components/progress/Progress';
import Start from './components/start/start';
import firebaseServices from './components/firebase/firebaseSetup';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("user");
  return isAuthenticated ? children : <Navigate to="/login" />;
};
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("user");

  useEffect(() => {
    window.appNavigate = (page) => navigate(`/${page}`);
    return () => delete window.appNavigate;
  }, [navigate]);

  return (
    <>
      {location.pathname !== '/login' && isAuthenticated && (
        <Navbar onNavigate={(page) => navigate(`/${page}`)} />
      )}
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={() => navigate('/start')} />} />
        <Route path="/" element={<Home />} />
        
        {/* Conditional rendering based on authentication */}
        <Route
          path="/start"
          element={isAuthenticated ? <Start /> : <Navigate to="/login" />}
        />

        <Route path="/practice" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};


const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
