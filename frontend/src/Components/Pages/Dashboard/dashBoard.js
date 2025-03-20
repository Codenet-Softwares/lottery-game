import React, { useRef } from "react";
import { Link } from "react-router-dom";
import DashCard from "../../../Utils/constant/DashCard";
import "./DashBoard.css";
import { useAppContext } from "../../../contextApi/context";

const Dashboard = () => {
  const { store } = useAppContext();
  console.log("====>> line 9", store);
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

  // Filter DashCard based on roles & permissions
  const filteredDashCards =
    store.admin.roles === "admin"
      ? DashCard.filter((card) => {
          // Hide "Authorize Win", "Sub-Admin Data", and "Sub-Admin Result" for admin
          return (
            card.name !== "Authorize Win" &&
            card.name !== "Sub-Admin Data" &&
            card.name !== "Sub-Admin Result"
          );
        })
      : store.admin.roles === "subAdmin"
      ? DashCard.filter((card) => {
          // Always show "Authorize Win" if the subAdmin has the "win-Lottery-Result" permission
          if (
            store.admin.permissions.includes("win-Lottery-Result") &&
            card.name === "Authorize Win"
          ) {
            return true;
          }
          // Show "Sub-Admin Data" if the subAdmin has the "win-Analytics" permission
          if (
            store.admin.permissions.includes("win-Analytics") &&
            card.name === "Sub-Admin Data"
          ) {
            return true;
          }
          // Show "Sub-Admin Result" if the subAdmin has the "result-View" permission
          if (
            store.admin.permissions.includes("result-View") &&
            card.name === "Sub-Admin Result"
          ) {
            return true;
          }
          // Hide all other cards
          return false;
        })
      : [];

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1> Welcome To The Lottery Game Admin Dashboard </h1>
        {/* Display the userName and role here */}
        <div className="user-profile text-uppercase">
          <p className="fw-bold">
            Logged in as: <strong>{store.admin.userName}</strong>
          </p>
          <p className="fw-bold">
            Role: <strong>{store.admin.roles}</strong>
          </p>
        </div>
      </div>

      <div className="cards-container">
        <button className="arrow left-arrow" onClick={() => scroll("left")}>
          <span>&#x2190;</span>
        </button>

        <div className="cards-wrapper" ref={cardsRef}>
          {filteredDashCards.map((card, index) => (
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
