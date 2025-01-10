import React, { useEffect, useState } from "react";
import "./Trash.css";
import { DeletedLiveBetsMarkets, DeletedLiveBetsMarketsDetails } from "../../Utils/apiService";
import Trashmarketdetails from "./Trashmarketdetails";

const Trash = () => {
  const [isBinOpen, setIsBinOpen] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [selectedMarketDetails, setSelectedMarketDetails] = useState(null);

  // Function to fetch markets from the API
  const fetchMarkets = async () => {
    try {
      const response = await DeletedLiveBetsMarkets();
      if (response.data && response.data.length > 0) {
        setMarkets(response.data);
      } else {
        setMarkets([]); 
        console.warn("No deleted markets found.");
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };
  
  // Function to fetch market details by marketId
  const fetchMarketDetails = async (marketId) => {
    try {
      const response = await DeletedLiveBetsMarketsDetails({ marketId });
      setSelectedMarketDetails(response.data||[]);
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
    setSelectedMarketDetails(null); 
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
    
      {isBinOpen && (
        <div className="crumpled-paper">
            <button className="back-to-bin" onClick={closeCrumpledPaper}>
        Back to Trash
      </button>
          <div className="market-sidebar">
            <h3>Deleted Markets</h3>
            <ul className="market-list-custom">
              {markets.map((market, index) => (
                <li
                  key={index}
                  className="market-item-custom"
                  onClick={() => fetchMarketDetails(market.marketId)}
                >
                 
                  {market.marketName}
                </li>
              ))}
            </ul>
          </div>
          <div className="paper-content">
  {selectedMarketDetails === null ? (
    <p className="highlighted-message">Select a market from the left to view its details</p>
  ) : (
    <Trashmarketdetails details={selectedMarketDetails} refreshMarkets={fetchMarkets} />
  )}
</div>

        </div>
      )}
    </div>
  );
};

export default Trash;
