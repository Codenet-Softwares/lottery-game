import React from "react";
import { Link } from "react-router-dom";
import DashCard from "../../../Utils/constant/DashCard";

const Dashboard = () => {
  const cardStyle = {
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  return (
    <div
      className="container-fluid d-flex flex-column"
      style={{ backgroundColor: "#f0f4f8" }}
    >
      <div className="flex-grow-1 p-4">
        <div className="text-center mb-4">
          <h1
            style={{ color: "#2A4058", fontWeight: "bold", fontSize: "2.5rem" }}
          >
            🎉 Welcome To The Lottery Game Admin Dashboard 🎉
          </h1>
          <p
            style={{ fontStyle: "italic", color: "#A5B8D1", fontSize: "1.3em" }}
          >
            This web application is still under development
          </p>
        </div>

        <div className="row justify-content-center">
          {DashCard.map((card, index) => (
            <div className="col-lg-3 col-md-4 col-sm-6 mb-4 d-flex" key={index}>
              <div className="card w-100" style={card.cardstyle}>
                <div className="card-body text-center d-flex flex-column align-items-center justify-content-center">
                  <i
                    className={`${card.icon} fa-3x`}
                    style={{ color: "#fff" }}
                    aria-label={card.name}
                  />
                  <h5
                    className="card-title mt-2"
                    style={{ color: "#fff", fontSize: "1.5em" }}
                  >
                    {card.name}
                  </h5>
                  <p className="card-text" style={{ color: "#fff" }}>
                    {card.description}
                  </p>
                </div>
                <div className="text-center mb-3">
                  <Link
                    to={card.buttonLink}
                    className="btn btn-light"
                    style={{ borderRadius: "50px" }}
                  >
                    {card.buttonName}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <p
            style={{
              fontSize: "1.5em",
              color: "#2A4058",
              fontWeight: "900",
              fontFamily: "Georgia, serif",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Unlock endless possibilities – create dynamic lottery experiences
            like never before!
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
