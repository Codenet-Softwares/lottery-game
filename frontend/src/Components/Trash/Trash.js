import React, { useEffect, useState } from "react";
import "./Trash.css";
import { DeletedLiveBetsMarkets, DeletedLiveBetsMarketsDetails } from "../../Utils/apiService";

const Trash = () => {
  const [isBinOpen, setIsBinOpen] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [selectedMarketDetails, setSelectedMarketDetails] = useState(null);

  // Function to fetch markets from the API
  const fetchMarkets = async () => {
    const response = await DeletedLiveBetsMarkets();
    setMarkets(response.data);
  };

  // Function to fetch market details by marketId
  const fetchMarketDetails = async (marketId) => {
    try {
      const response = await DeletedLiveBetsMarketsDetails({ marketId });
      setSelectedMarketDetails(response.data);
    } catch (error) {
      console.error("Error fetching market details:", error);
    }
  };

  useEffect(() => {
    if (isBinOpen) {
      fetchMarkets();
    }
  }, [isBinOpen]);

  const openCrumpledPaper = () => setIsBinOpen(true);
  const closeCrumpledPaper = () => {
    setIsBinOpen(false);
    setSelectedMarketDetails(null); // Reset details when closing the bin
  };

  return (
    <div className={`trash-container ${isBinOpen ? "paper-mode" : ""}`}>
      {!isBinOpen && (
        <div className="dustbin">
          <div className="small-lid"></div>
          <div className="lid" onClick={openCrumpledPaper}>
            <span className="lid-text">Open Me to see deleted markets</span>
          </div>
          <div className="bin-body">
            <p className="bin-text">Use me for deleting markets to store!</p>
          </div>
        </div>
      )}
      <button className="back-to-bin" onClick={closeCrumpledPaper}>
        Back to Trash
      </button>
      {isBinOpen && (
        <div className="crumpled-paper">
          <div className="market-sidebar">
            <h3>Deleted Markets</h3>
            <ul className="market-list-custom">
              {markets.map((market, index) => (
                <li
                  key={index}
                  className="market-item"
                  onClick={() => fetchMarketDetails(market.marketId)}
                >
                  {market.marketName}
                </li>
              ))}
            </ul>
          </div>
          <div className="paper-content">
            {selectedMarketDetails ? (
              <div className="market-details">
                <h3>Market Details</h3>
                <p><strong>ID:</strong> {selectedMarketDetails.marketId}</p>
                <p><strong>Name:</strong> {selectedMarketDetails.marketName}</p>
                <p><strong>Description:</strong> {selectedMarketDetails.description}</p>
                <p><strong>Status:</strong> {selectedMarketDetails.status}</p>
                {/* Add more fields as needed */}
              </div>
            ) : (
              <p>Select a market to view its details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;
