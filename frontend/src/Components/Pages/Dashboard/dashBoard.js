import React, { useRef } from "react";
import { Link } from "react-router-dom";
import DashCard from "../../../Utils/constant/DashCard";
import "./DashBoard.css"; // Import the CSS for styling

const Dashboard = () => {
  const cardsRef = useRef(null);

  const scroll = (direction) => {
    const cardWidth = 300; // Width of a single card
    const gap = 20; // Gap between cards
    const scrollDistance = cardWidth + gap;
    cardsRef.current.scrollBy({
      left: direction === "left" ? -scrollDistance : scrollDistance,
      behavior: "smooth",
    });
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1> Welcome To The Lottery Game Admin Dashboard </h1>
      </div>

      <div className="cards-container">
        <button className="arrow left-arrow" onClick={() => scroll("left")}>
          <span>&#x2190;</span>
        </button>

        <div className="cards-wrapper" ref={cardsRef}>
          {DashCard.map((card, index) => (
            <div className="card-item" key={index}>
              <div className="card-content" style={card.cardstyle}>
                <i
                  className={`${card.icon} fa-3x`}
                  style={{ color: "#fff" }}
                  aria-label={card.name}
                />
                <h5>{card.name}</h5>
                <p>{card.description}</p>
                <Link to={card.buttonLink} className="card-button">
                  {card.buttonName}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button className="arrow right-arrow" onClick={() => scroll("right")}>
          <span>&#x2192;</span>
        </button>
      </div>

      <div className="footer-section">
        <p>
          Unlock endless possibilities – create dynamic lottery experiences like
          never before!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
