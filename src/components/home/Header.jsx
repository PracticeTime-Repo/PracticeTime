import React from "react";
import logo from "../../assets/logo.png";

function Header() {
  return (
    <header className="header-container">
      {/* Logo Image positioned above the taglines */}
      <img
        src={logo}
        alt="PracticeTime.ai"
        className="logo"
        onClick={() => window.appNavigate('home')} // Navigate to home when clicked
      />

      <div className="tagline-container">
        {/* First tagline */}
        <h1 className="tagline">
          the more you <span className="highlight">practice!</span>
        </h1>

        {/* Second tagline */}
        <h2 className="tagline">
          the better you <span className="highlight">become!</span>
        </h2>
      </div>

      {/* Arrow pointing from the first tagline to the second tagline */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 185 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="arrow-icon"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,7 L10,3.5 z" fill="black" />
          </marker>
        </defs>

        <path
          d="M1 27.3447C25.2017 10.5269 76.9959 15.4575 91.4948 37.4728C96.3756 44.8838 92.6925 57.4736 78.9832 52.9366C66.2483 48.722 65.096 29.7458 70.0428 20.7397C77.4662 -0.277324 105.1568 -1.16802 115.894 3.17802C193 62.9366 70.0428 127.857 42.8367 125.245"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="6 6"
          transform="translate(40, 10)" // Adjusted position
          markerEnd="url(#arrowhead)"
        />
      </svg>

      <style jsx>{`
        .header-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
        }

        .tagline-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .tagline {
          font-family: "Space Grotesk", sans-serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 44px;
          color: #000;
          margin: 0;
        }

        .highlight {
          color: #38b6ff;
        }

        .logo {
          margin-bottom: 70px;
          width: 380px;
          height: auto;
          cursor: pointer;
        }

        .arrow-icon {
           margin-left: 462px;
    margin-bottom: 3px;
    margin-top: -110px;
        }
    @keyframes draw-arrow {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  .arrow-icon path {
    // animation: draw-arrow 5s ease forwards;
    stroke-dasharray: 12 6;
    stroke-dashoffset: 1000;
  }
        /* For mobile responsiveness */
        @media (max-width: 640px) {
  .logo {
    margin-bottom: 40px;
    width: 80%;
    height: auto;
  }

  .header-container {
    gap: 10px;
    padding: 0 20px;
  }

  .tagline-container {
    align-items: center;
    text-align: center;
  }

  .tagline {
    font-size: 26px;
    line-height: 32px;
    text-align: left;
  }

  .arrow-icon {
    display: none;
  }
}

      `}</style>
    </header>
  );
}

export default Header;
