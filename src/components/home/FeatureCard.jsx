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
          width: 90%;
          max-width: 380px;
          height: auto;
          padding-bottom: 32px;
          border-radius: 24px;
          border: 2px solid black;
          background-color: #fff;
          box-sizing: border-box;
          margin: 0 auto;
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          background-color: white;
          transform: scale(1.03);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
          object-fit: cover;
          border-radius: 24px 24px 0 0;
        }

        .content-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 8px;
          margin-top: 20px;
          padding-left: 16px;
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

        /* Responsive styles */
        @media (max-width: 640px) {
          .feature-card {
            width: 95%;
            padding: 0 10px;
            height: auto;
          }

          .image-container {
            height: 250px;
          }

          .feature-title {
            font-size: 18px;
          }

          .feature-description {
            font-size: 14px;
          }
        }
      `}</style>
    </article>
  );
}

export default FeatureCard;
