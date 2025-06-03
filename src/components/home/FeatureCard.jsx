import React from "react";

function FeatureCard({ image, altText, title, description, backgroundColor }) {
  return (
    <article className="feature-card1">
      <div className="image-container" style={{ backgroundColor }}>
        <img src={image} alt={altText} className="feature-image" />
      </div>
      <div className="content-container">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>

      <style jsx>{`
        .feature-card1 {
          flex: 1 1 300px;
          max-width: 380px;
          background-color: #fff;
          border-radius: 24px;
          overflow: hidden;
          border: 2px solid black;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card1:hover {
          transform: scale(1.03);
          background-color: white;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .image-container {
          height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .feature-image {
        display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .content-container {
          padding: 20px;
        }

        .feature-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #000;
        }

        .feature-description {
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.7);
        }

        @media (max-width: 640px) {
        .feature-card1 {
          flex: 1 1 auto;
          max-width: 380px;
          background-color: #fff;
          border-radius: 24px;
          overflow: hidden;
          border: 2px solid black;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
          .image-container {
            height: auto;
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
