import React from "react";
import FeatureCard from "./FeatureCard";
import bg1 from "./bg1.jpg";
import bg2 from "./bg2.jpg";
import bg3 from "./bg3.jpg";

function FeatureGrid() {
  const features = [
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/f362c9f9f06d526f7152a921fe06f65e66d2a9d9?placeholderIfAbsent=true",
      altText: "Daily Practice",
      title: "10 Mins of Daily Practice!",
      description: "Build skills quickly with short, daily practice sessions",
      backgroundColor: "rgba(250, 235, 120, 0.15)",
    },
    {
      image: bg1,
      altText: "Learn by Doing",
      title: "No Classes - Learn by Doing",
      description: "Master concepts independently through focused, hands-on practice",
      backgroundColor: "rgba(126, 217, 86, 0.2)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/c7b884a0ca3a46bb1982fc7a90c66ee1bd63bc6b?placeholderIfAbsent=true",
      altText: "Level-Based Practice",
      title: "Personalized, Level-Based Practice Sheets",
      description: "Get customized sheets tailored to each learner's pace and ability",
      backgroundColor: "rgba(255, 87, 87, 0.15)",
    },
    {
      image: bg2,
      altText: "Real-World Learning",
      title: "Math Integrated with Real-World Learning Bubbles",
      description: "Discover Math in everyday life, making learning meaningful and practical",
      backgroundColor: "rgba(92, 225, 230, 0.2)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9eebeb646c473d111016f3b98988472f010dbf9c?placeholderIfAbsent=true",
      altText: "Practice Anytime",
      title: "Practice Anytime, Anywhere - Online or Offline",
      description: "Enjoy the flexibility to access Practice Sheets online or take printouts for offline practice",
      backgroundColor: "rgba(203, 107, 230, 0.2)",
    },
    {
      image: bg3,
      altText: "Smart Reporting",
      title: "Smart Reporting",
      description: "Track progress easily with intelligent reports that highlight growth and areas to improve",
      backgroundColor: "rgba(52, 152, 219, 0.15)",
    },
  ];

  return (
    <section className="features-section">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          image={feature.image}
          altText={feature.altText}
          title={feature.title}
          description={feature.description}
          backgroundColor={feature.backgroundColor}
        />
      ))}

      <style jsx>{`
        .features-section {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          padding: 40px 48px;
        }

        @media (max-width: 1024px) {
          .features-section {
            padding: 32px 24px;
            gap: 24px;
          }
        }

        @media (max-width: 640px) {
          .features-section {
            flex-direction: column;
            align-items: center;
            padding: 24px 16px;
            gap: 20px;
          }
        }
      `}</style>
    </section>
  );
}

export default FeatureGrid;
