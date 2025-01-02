import React, { useState, useEffect } from "react";
import PaginationUi from "../Common/PaginationUi";
import { GetliveMarketBroadcast } from "../../Utils/apiService";
import "./LiveMarkets.css";

const LiveMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const marketsPerPage = 10;

  // Fetch market data from the API
  const fetchMarkets = async (page) => {
    try {
      const response = await GetliveMarketBroadcast({ page, limit: marketsPerPage });
      if (response.success) {
        setMarkets(response.data || []);
        setTotalItems(response.pagination.totalItems || 0);
      } else {
        console.error("Failed to fetch markets:", response.message);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  useEffect(() => {
    fetchMarkets(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ background: "#f0f0f0", minHeight: "75vh" }}
    >
      <div className="tv-container">
        <div className="tv-screen">
          {markets.length > 0 ? (
            <>
              <div className="live-alert">
                <span className="red-dot"></span> LIVE
              </div>
              <ul className="market-list">
                {markets.map((market) => (
                  <li key={market.marketId} className="market-item">
                    {market.marketName}
                    <button className="live-stats-button">Live Stats</button>
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
