//FeatureCard.jsx

import React from "react";

function FeatureCard({ image, altText, title, description, backgroundColor }) {
  return (
    <article className="feature-card">
      <div className="image-container" style={{ backgroundColor }}>
        <img src={image} alt={altText} className="feature-image" />
      </div>
      <div className="content-container">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>

      <style jsx>{`
        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 90%; /* Make it take 90% width of the screen */
          max-width: 380px; /* Limit to 380px width max */
          height: auto; /* Let it adjust based on content */
          padding-bottom: 32px;
          border-radius: 24px;
          border: 2px solid black; /* Red thin border */
          background-color: #fff;
          box-sizing: border-box;
          margin: 0 auto; /* Center align the card */
        }

        .image-container {
          width: 100%;
          height: 320px;
          border-radius: 24px 24px 0 0;
          position: relative;
        }

        .feature-image {
        
          width: 100%;
          height: 100%;
          object-fit: cover; /* Make sure the image doesn't stretch */
        }

        .content-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 8px;
          margin-top: 20px;
          padding-left: 16px; /* Some padding for better content alignment */
        }

        .feature-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 32px;
          color: #000;
          margin: 0;
        }

        .feature-description {
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 200;
          line-height: 24px;
          color: rgba(0, 0, 0, 0.6);
          margin: 0;
        }

        /* Responsive Styling for smaller devices */
        @media (max-width: 640px) {
          .feature-card {
            width: 95%; /* Let it occupy more width on smaller screens */
            padding: 0 10px; /* Add some horizontal padding */
            height: auto; /* Make sure the card height adjusts automatically */
          }

          .image-container {
            height: 250px; /* Reduce image height on small screens */
          }

          .feature-title {
            font-size: 18px;
          }

          
          z-description {
            font-size: 14px;
          }
        }
      `}</style>
    </article>
  );
}

export default FeatureCard;
