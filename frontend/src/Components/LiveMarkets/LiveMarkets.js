import React, { useState, useEffect } from "react";
import PaginationUi from "../Common/PaginationUi";
import { GetliveMarketBroadcast } from "../../Utils/apiService";
import LiveMarketStats from "./LiveMarketStats";

import "./LiveMarkets.css";

const LiveMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedMarketId, setSelectedMarketId] = useState(null); // State for selected market ID
  const marketsPerPage = 10;

  // Fetch market data from the API
  const fetchMarkets = async (page) => {
    const response = await GetliveMarketBroadcast({ page, limit: marketsPerPage });
    if (response.success) {
      setMarkets(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
    } else {
      console.error("Failed to fetch markets:", response.message);
    }
  };

  useEffect(() => {
    fetchMarkets(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleViewStats = (marketId) => {
    setSelectedMarketId(marketId); // Set the selected market ID
  };

  const handleBack = () => {
    setSelectedMarketId(null); // Clear the selected market ID
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ background: "#f0f0f0", minHeight: "75vh" }}
    >
      <div className="tv-container">
        <div className="tv-screen">
          {selectedMarketId ? (
            // Show stats screen
            <div className="stats-screen">
            <LiveMarketStats 
              marketId={selectedMarketId} 
              backButton={<button 
                className="back-button" 
                onClick={handleBack} 
                style={{
                  padding: '10px 20px', 
                  fontSize: '1rem', 
                  backgroundColor: '#4682B4', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '20px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  width: 'auto', 
                  whiteSpace: 'nowrap',
                }}
              >
                Back
              </button>}
            />
          </div>
          
          ) : (
            // Show market list screen
            <>
              {markets.length > 0 ? (
                <>
                  <div className="live-alert">
                    <span className="red-dot"></span> LIVE
                  </div>
                  <ul className="market-list">
                    {markets.map((market) => (
                      <li key={market.marketId} className="market-item">
                        {market.marketName}
                        <button
                          className="live-stats-button"
                          onClick={() => handleViewStats(market.marketId)}
                        >
                          Live Stats
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="pagination-container">
                    <PaginationUi
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalItems / marketsPerPage)}
                      onPageChange={handlePageChange}
                      totalItems={totalItems}
                      itemsPerPage={marketsPerPage}
                    />
                  </div>
                </>
              ) : (
                <div className="no-market-container">
                  <div className="tv-static"></div>
                  <div className="no-market-text">
                    <span>No Live Market Available</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="tv-antenna">
          <div className="antenna-base"></div>
        </div>
        <div className="tv-stand"></div>
      </div>
    </div>
  );
};

export default LiveMarkets;
