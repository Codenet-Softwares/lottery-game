import React from "react";
import "./BetAfterWin.css";
import { useNavigate } from "react-router-dom";

const BetAfterWin = () => {
  const navigate = useNavigate();

  const handleLiveStatsClick = () => {
    navigate("/live-stats");
  };
  return (
    <div className="text-center bet_page">
      <div>
        <h1 className="fw-bold heading py-3 text-uppercase">Bet After Win</h1>
      </div>
      <div className="container">
        <div className="search-container-search-live">
          <input
            type="text"
            className="form-control search-input-live"
            placeholder="Search by market name"
            aria-label="Search markets"
            // value={searchTerm}
            // onChange={handleSearchChange}
          />
        </div>
        <ul className="market-list">
          <li className="market-item">
            <h5>Market Name:</h5>
            <button
              className="live-stats-button"
              onClick={handleLiveStatsClick}
            >
              Live Stats
            </button>{" "}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BetAfterWin;
