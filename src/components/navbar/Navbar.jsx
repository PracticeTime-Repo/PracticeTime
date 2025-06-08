import React, { useEffect, useRef } from "react";
import "./Navbar.css";
import { signOut } from "firebase/auth";
import firebaseServices from "../firebase/firebaseSetup";
import { RxCross2 } from "react-icons/rx";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import home from "./home.png";
import hand from "./hand.png";
import emojiHappy from "./emoji-happy.png";

const Navbar = ({ onNavigate }) => {
  const [showmenu, setShowmenu] = React.useState(false);
  const [showlogout, setShowlogout] = React.useState(window.innerWidth <= 768);
  const { auth } = firebaseServices;
  const dropdownRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

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
    <div className="nav-container">
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Are you sure you want to log out?</h3>
            <p>
              Your progress is saved. You can come back and practice anytime!
            </p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="navbar">
        <div
          className="navbar-left"
          onClick={() => handleNavigation("start")}
          style={{ cursor: "pointer" }}
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0442a517a403251d5959637b0e2a64010cc28ce9?placeholderIfAbsent=true&apiKey=771d35a4e8294f3083bdf0cbd6294e9e"
            alt="PracticeTime Logo"
            className="logo-image"
          />
        </div>

        {/* <button1 className="hamburger" onClick={handleHamburger}>
          {showmenu ? <RxCross2 /> : <RxHamburgerMenu />}
        </button1> */}
        <button className="hamburger" onClick={handleHamburger}>
          {showmenu ? (
            <RxCross2 className="menu-icon" />
          ) : (
            <div className="menu-icon two-line-icon">
              <span></span>
              <span></span>
            </div>
          )}
        </button>

        <div className="web-navbar">
          <nav className={`navbar-menu ${showmenu ? "open" : ""}`}>
            <ul>
              <li onClick={() => handleNavigation("home")}> 
                <img src={home} alt="Home" className="nav-image" />
              </li>

              <li
                onClick={() => handleNavigation("progress")}
                className="track-progress"
              >
                Track Progress
              </li>

              <li
                onClick={() => handleNavigation("progress")}
                className="navbar-line"
              ></li>

              <li className="user-dropdown" ref={dropdownRef}>
                <div
                  className="user-trigger"
                  onClick={() => setShowlogout((prev) => !prev)}
                >
                  <img src={emojiHappy} alt="User" className="avatar-img" />
                  <span>
                    Hi, <img src={hand} alt="wave" className="emoji-img" />{" "}
                    &nbsp;
                    {/* <span>User Name</span> */}
                  </span>
                  <FaChevronDown size={12} className="navbar-arrow" />
                </div>
                {showlogout && (
                  <ul className="dropdown-menu">
                    <li
                      onClick={() => setShowLogoutModal(true)}
                      className="logout"
                    >
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
              <img src={emojiHappy} alt="smile" className="emoji-img" />
              <span className="greeting">
                Hi <img src={hand} alt="wave" className="hand-img" />
              </span>
            </div>
            <hr />
            <ul>
              <li onClick={() => handleNavigation("home")}>
                <span className="menu-text">Home</span>
                <FaChevronRight className="chevron" />
              </li>
              <li onClick={() => handleNavigation("progress")}>
                <span className="menu-text">Track Progress</span>
                <FaChevronRight className="chevron" />
              </li>
              <li onClick={() => setShowLogoutModal(true)}>
                <span className="menu-text">Logout</span>
                <FaChevronRight className="chevron" />
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
