import React from 'react';
import { Link } from 'react-router-dom';  // Import
import "./Navbar.css";  // Ensure you have styles for both desktop and mobile views
import { signOut } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import { RxHamburgerMenu } from "react-icons/rx";

const Navbar = ({ onNavigate }) => {
  const [showmenu, setShowmenu] = React.useState(false);
  const { auth } = firebaseServices;

  const handleHamburger = () => {
    setShowmenu(!showmenu);  // Toggle the menu visibility on mobile view
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);  // Sign out user from Firebase
      localStorage.removeItem("user");  // Remove user data from localStorage
      onNavigate("login");  // Navigate to the login page
      setShowmenu(false);  // Close the mobile menu after logout
    } catch (error) {
      console.error("Logout error:", error);  // Log any logout errors
    }
  };

  // Function to navigate and close the menu
  const handleNavigation = (page) => {
    onNavigate(page);  // Navigate to the desired page
    setShowmenu(false);  // Close the mobile menu after navigation
  };

  return (
    <div className="wrapper">
      {/* Navigation Menu for Web and Mobile */}
      <nav className={showmenu ? "menu-mobile" : "menu-web"}>
        <ul>
          {/* Navigation Items */}
          <li onClick={() => handleNavigation("home")}>Home Page</li>
          <li onClick={() => handleNavigation("start")}>Start</li> {/* Navigate to Start page */}
          <li onClick={() => handleNavigation("progress")}>Progress</li>
          <li onClick={handleLogout}>Log out</li>  {/* Logout functionality */}
        </ul>
      </nav>


      {/* Hamburger Menu for Mobile */}
      <div className="hamburger">
        <button onClick={handleHamburger}><RxHamburgerMenu /></button>  {/* Display the hamburger icon */}
      </div>
    </div>
  );
};

export default Navbar;
