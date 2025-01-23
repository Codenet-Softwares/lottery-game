import React, { useState, useEffect } from "react";
import PaginationUi from "../Common/PaginationUi";
import { GetliveMarketBroadcast } from "../../Utils/apiService";
import LiveMarketStats from "./LiveMarketStats";

import "./LiveMarkets.css";

const LiveMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedMarketId, setSelectedMarketId] = useState(null); // State for selected market ID
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const marketsPerPage = 10;
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  // Fetch market data from the API
  const fetchMarkets = async (page) => {
    const response = await GetliveMarketBroadcast({
      page,
      limit: marketsPerPage,
      search: debouncedSearchTerm,
    });
    if (response.success) {
      setMarkets(response.data || []);
      setFilteredMarkets(response.data || []);
      setTotalItems(response.pagination?.totalItems || 0);
    } else {
      console.error("Failed to fetch markets:", response.message);
    }
  };

  useEffect(() => {
    fetchMarkets(currentPage);
  }, [currentPage]);

  // Filter markets based on the debounced search term
  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = markets.filter((market) =>
        market.marketName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredMarkets(filtered);
    } else {
      setFilteredMarkets(markets);
    }
  }, [debouncedSearchTerm, markets]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleViewStats = (marketId) => {
    setSelectedMarketId(marketId); // Set the selected market ID
  };

  const handleBack = () => {
    setSelectedMarketId(null); // Clear the selected market ID
    fetchMarkets(currentPage || 1);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ background: "#f0f0f0", minHeight: "75vh" }}
    >
      <div className="tv-container">
        <div className="tv-screen">
          {selectedMarketId ? (
            <div className="stats-screen">
              <LiveMarketStats
                marketId={selectedMarketId}
                backButton={
                  <button
                    className="back-button"
                    onClick={handleBack}
                    style={{
                      padding: "10px 20px",
                      fontSize: "1rem",
                      backgroundColor: "#4682B4",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "20px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                      width: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Back
                  </button>
                }
              />
            </div>
          ) : markets.length === 0 ? (
            <div className="no-market-container">
              <div className="tv-static"></div>
              <div className="no-market-text">
                <span>No Live Market Available</span>
              </div>
            </div>
          ) : (
            <>
              <div className="live-alert">
                <span className="red-dot"></span> LIVE
              </div>
              <div className="search-container-search-live">
                <input
                  type="text"
                  className="form-control search-input-live"
                  placeholder="Search by market name"
                  aria-label="Search markets"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              {filteredMarkets.length > 0 ? (
                <>
                  <ul className="market-list">
                    {filteredMarkets.map((market) => (
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
                    <span>No Live Market Found with this name</span>
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
