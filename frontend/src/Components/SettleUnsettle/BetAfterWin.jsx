import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GetliveMarketBet } from "../../Utils/apiService";
import Pagination from "../Common/Pagination";
import BetSettleUnsettle from "./BetSettleUnsettle";

const BetAfterWin = () => {
  const [betMarkets, setBetMarkets] = useState([]);
  const [liveBetMarkets, setLiveBetMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [liveState, setLiveState] = useState(false);

  useEffect(() => {
    fetchLiveMarketBet();
  }, [pagination.page, pagination.limit, searchTerm]);

  const fetchLiveMarketBet = async () => {
    const response = await GetliveMarketBet({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
    });

    if (response && response.success) {
      setBetMarkets(response.data || []);
      setLiveBetMarkets(response.data || []);
      setPagination({
        page: response?.pagination?.page || pagination.page,
        limit: response?.pagination?.limit || pagination.limit,
        totalPages: response?.pagination?.totalPages || 0,
        totalItems: response?.pagination?.totalItems || 0,
      });
    } else {
      setBetMarkets([]);
      setLiveBetMarkets([]);
      setPagination((prev) => ({ ...prev, totalItems: 0 }));
    }
  };

  const handleLiveStatsClick = (marketId) => {
    setSelectedMarketId(marketId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // const toggleLiveState = () => {
  //   setLiveState((prevState) => !prevState);
  // };

  return (
    <div className="text-center bet_page rounded-4" style={{background:"#333333"}}>
      <div className="container-fluid p-3 px-5">
        {!selectedMarketId && (
          <>
            <h1 className="fw-bold heading py-3 text-uppercase text-light">
              Bet After Win
            </h1>
            <div className="search-container-search-live d-flex justify-content-center align-items-center">
              <input
                type="text"
                className="form-control search-input-live"
                placeholder="Search by market name"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </>
        )}

        {selectedMarketId ? (
          <div>
            <BetSettleUnsettle
              marketId={selectedMarketId}
              backButton={
                <button
                  className="back-button"
                  onClick={() => setSelectedMarketId(null)}
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
        ) : liveBetMarkets.length > 0 ? (
          <>
            <ul className="market-list">
              {liveBetMarkets.map((market) => (
                <li key={market.marketId} className="market-item">
                  {market.marketName}
                  <button
                    className="live-stats-button"
                    onClick={() => handleLiveStatsClick(market.marketId)}
                  >
                    Win Stats
                  </button>
                </li>
              ))}
            </ul>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              handlePageChange={handlePageChange}
              startIndex={(pagination.page - 1) * pagination.limit + 1}
              endIndex={Math.min(
                pagination.page * pagination.limit,
                pagination.totalItems
              )}
              totalData={pagination.totalItems}
            />
          </>
        ) : (
          <div className="no-market-container">
            <div className="tv-static"></div>
            <div className="no-market-text">
              <span>No Live Market Found with this name</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetAfterWin;
