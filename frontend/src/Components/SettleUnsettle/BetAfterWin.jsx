import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetliveMarketBet } from "../../Utils/apiService";
import Pagination from "../Common/Pagination";
import BetSettleUnsettle from "./BetSettleUnsettle";
import "./BetAfterWin.css";

const BetAfterWin = () => {
  const navigate = useNavigate();
  const { marketId } = useParams(); // Get marketId from URL

  const [betMarkets, setBetMarkets] = useState([]);
  const [liveBetMarkets, setLiveBetMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(marketId || null);
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

  // const handleLiveStatsClick = (marketId) => {
  //   setSelectedMarketId(marketId);
  // };

  const handleLiveStatsClick = (marketId) => {
    setSelectedMarketId(marketId);
    navigate(`/bet-tracker/${marketId}`);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="bet-after-win-container m-5 border text-uppercase">
      <div className="bet-after-win-inner-container container-fluid ">
        {!selectedMarketId && (
          <>
            <h2 className="bet-after-win-heading fw-bold">Bet After Win</h2>
            <div className="bet-after-win-search-container">
              <input
                type="text"
                className="form-control bet-after-win-search-input"
                placeholder="Search By Market Name"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </>
        )}

        {selectedMarketId ? (
          <div className="bet-after-win-settle-container">
            <BetSettleUnsettle
              marketId={selectedMarketId}
              backButton={
                <button
                  className="bet-after-win-back-button"
                  onClick={() => setSelectedMarketId(null)}
                >
                  <i className="fas fa-arrow-left bg-none"></i>
                </button>
              }
            />
          </div>
        ) : liveBetMarkets.length > 0 ? (
          <>
            <ul className="bet-after-win-market-list">
              {liveBetMarkets.map((market) => (
                <li
                  key={market.marketId}
                  className="bet-after-win-market-item fw-bold"
                >
                  {market.marketName}
                  <button
                    className="bet-after-win-live-stats-button text-uppercase fw-bold"
                    onClick={() => handleLiveStatsClick(market.marketId)}
                  >
                    Win Stats
                  </button>
                </li>
              ))}
            </ul>
            {pagination.totalItems > 0 && (
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
          )}
          </>
        ) : (
          <div className="bet-after-win-no-market-container">
            <div className="tv-static"></div>
            <div className="bet-after-win-no-market-text fw-bold">
              <span>No Data Found</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetAfterWin;
