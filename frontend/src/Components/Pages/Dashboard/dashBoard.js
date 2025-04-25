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
    <div className="container-fluid py-3 px-5 dashboard-container m-0 p-0 mt-3">
    <div className="card-scroll-wrapper">
      <div className="row card_row">
        {filteredDashCards.map((card, index) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 mt-2" key={index}>
            <div className="card mini-card h-100 text-white" style={card.cardstyle}>
              <div className="card-body d-flex flex-column align-items-center text-center">
                <i className={`${card.icon} fa-2x mb-2 custom-icon-class`} aria-label={card.name}></i>
                <h5 className="card_title mb-1 fw-bold">{card.name}</h5>
                <p className="card-text fw-bold">{card.description}</p>
                <div className="dash_btn rounded-pill">
                  <Link to={card.buttonLink} className="btn mt-auto btn-sm text-light">
                    {card.buttonName}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  
  );
};

export default Dashboard;
