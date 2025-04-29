//App.jsx
import React, { useState, useEffect } from 'react';
import Home from './components/home/Home';
import Quiz from './components/quiz/Quiz';
import Login from './components/login/Login';
import Navbar from './components/navbar/Navbar';
import Progress from './components/progress/Progress';
import Start from './components/start/start'; // ✅ Import start.jsx properly with capital 'S'

const App = () => {
  // Check authentication status
  const isAuthenticated = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser !== null;
  };

  // State to track current page asdas
  //home 
  const [currentPage, setCurrentPage] = useState("login");

  // Check authentication on initial load
  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentPage("home");
    } else {
      setCurrentPage("login");
    }
  }, []);

  // Function to handle navigation
  const navigate = (page) => {
    if (page !== 'login' && !isAuthenticated()) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  // Make navigation function globally available
  useEffect(() => {
    window.appNavigate = navigate;
    return () => {
      delete window.appNavigate;
    };
  }, []);

  // Render appropriate component based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;    // Home.jsx page (✅ correct)
      case "start":
        return <Start />;   // Start.jsx page
      case "practice":
        return <Quiz />;    // Quiz.jsx page
      case "progress":
        return <Progress />; // Progress.jsx page
      case "login":
      default:
        return <Login onLoginSuccess={() => navigate('start')} />;
    }
  };

  return (
    <>
      {isAuthenticated() && <Navbar onNavigate={navigate} />}
      {renderPage()}
    </>
  );
};

export default App;
