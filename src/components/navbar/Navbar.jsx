// import React from 'react';
// import "./Navbar.css";
// import { signOut } from "firebase/auth";
// import firebaseServices from "../firebase/firebaseSetup";
// import { RxHamburgerMenu } from "react-icons/rx";

// const Navbar = ({ onNavigate }) => {
//   const [showmenu, setShowmenu] = React.useState(false);
//   const { auth } = firebaseServices;

//   const handleHamburger = () => {
//     setShowmenu(!showmenu);
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       localStorage.removeItem("user");
//       onNavigate("login"); // Use onNavigate instead of useNavigate
//       setShowmenu(false);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   // Function to navigate & close menu
//   const handleNavigation = (page) => {
//     onNavigate(page); // Use onNavigate prop
//     setShowmenu(false);
//   };

//   return (
//     <div className="wrapper">
//       <nav className={showmenu ? "menu-mobile" : "menu-web"}>
//         <ul>

//         <li onClick={() => handleNavigation("progress")}>Progress</li>
//           <li onClick={() => handleNavigation("home")}>Home</li>
          
//           <li onClick={handleLogout}>Log out</li>
//         </ul>
//       </nav>

//       <div className="hamburger">
//         <button onClick={handleHamburger}><RxHamburgerMenu /></button>
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useEffect, useRef } from "react";
import "./Navbar.css";
import { signOut } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaHome, FaChevronDown } from "react-icons/fa";

const Navbar = ({ onNavigate }) => {
  const [showmenu, setShowmenu] = React.useState(false);
  const [showlogout, setShowlogout] = React.useState(window.innerWidth <= 768);
  const { auth } = firebaseServices;
  const dropdownRef = useRef(null);

  const handleHamburger = () => {
    setShowmenu(!showmenu);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      onNavigate("login");
      setShowmenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (page) => {
    onNavigate(page);
    setShowmenu(false);
    setShowlogout(false);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowlogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ensure logout dropdown is shown by default on small screens
  useEffect(() => {
    const handleResize = () => {
      setShowlogout(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container">
    <header className="navbar">
      <div className="navbar-left">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0442a517a403251d5959637b0e2a64010cc28ce9?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
          alt="PracticeTime Logo"
          className="logo-image"
        />
      </div>

      {/* <button1 className="hamburger" onClick={handleHamburger}>
        <RxHamburgerMenu />
      </button1> */}
      <button className="hamburger" onClick={handleHamburger}>
  {showmenu ? "❌" : <RxHamburgerMenu />}
</button>
<div className="web-navbar">
      <nav className={`navbar-menu ${showmenu ? "open" : ""}`}>
        <ul>
          <li onClick={() => handleNavigation("home")}>
            <FaHome /> Home
          </li>
          <li onClick={() => handleNavigation("progress")}>Track Progress</li>

          <li className="user-dropdown" ref={dropdownRef}>
            <div className="user-trigger" onClick={() => setShowlogout((prev) => !prev)}>
              Hi, 👋 &nbsp;<span>User Name</span>
              <FaChevronDown size={12} />
            </div>
            {showlogout && (
              <ul className="dropdown-menu">
                <li onClick={handleLogout} className="logout">
                  Log out
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
      </div>
      <div className="mobile-navbar">
      <nav className={`navbar-menu ${showmenu ? "open" : ""}`}>
  <div className="dropdown-header">
    <span className="emoji">😊</span>
    <span className="greeting">Hi 👋, @User Name</span>
  </div>
  <hr />
  <ul>
    <li onClick={() => handleNavigation("home")}>
      Home <FaChevronDown className="chevron" />
    </li>
    <li onClick={() => handleNavigation("progress")}>
      Track Progress <FaChevronDown className="chevron" />
    </li>
    <li onClick={handleLogout}>
      Logout <FaChevronDown className="chevron" />
    </li>
  </ul>
</nav>
</div>
    </header>
    </div>
  );
};

export default Navbar;
