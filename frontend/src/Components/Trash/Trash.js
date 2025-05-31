import React, { useEffect, useState } from "react";
import "./Trash.css";
import {
  DeletedLiveBetsMarkets,
  DeletedLiveBetsMarketsDetails,
} from "../../Utils/apiService";
import Trashmarketdetails from "./Trashmarketdetails";

const Trash = () => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [selectedMarketDetails, setSelectedMarketDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMarketTerm, setSearchMarketTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedSearchMarketTerm, setDebouncedSearchMarketTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [noMarketsFound, setNoMarketsFound] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchMarketTerm(searchMarketTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchMarketTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchMarketChange = (e) => setSearchMarketTerm(e.target.value);

  const fetchMarkets = async () => {
    try {
      const response = await DeletedLiveBetsMarkets({
        search: debouncedSearchMarketTerm,
      });
      if (response.data && response.data.length > 0) {
        setMarkets(response.data);
        setNoMarketsFound(false);
      } else {
        setMarkets([]);
        setNoMarketsFound(true);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  const fetchMarketDetails = async (marketId) => {
    if (!marketId) return;
    try {
      const response = await DeletedLiveBetsMarketsDetails({
        marketId,
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
      });

      setSelectedMarketDetails(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        totalPages: response.pagination?.totalPages || 0,
        totalItems: response.pagination?.totalItems || 0,
      });
    } catch (error) {
      console.error("Error fetching market details:", error);
    }
  };

  useEffect(() => {
    if (selectedMarketId !== null) {
      fetchMarketDetails(selectedMarketId);
    }
  }, [selectedMarketId, debouncedSearchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMarkets();
  }, [debouncedSearchMarketTerm]);

  useEffect(() => {
    if (debouncedSearchTerm === "" && selectedMarketId !== null) {
      fetchMarketDetails(selectedMarketId);
    }
  }, [debouncedSearchTerm]);

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="trash-container">
      <div className="main-container-trash">
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search Deleted Markets..."
            value={searchMarketTerm}
            onChange={handleSearchMarketChange}
          />
        </div>

        <div className="crumpled-paper">
          <aside className="market-sidebar">
            <h3 className="fw-bold">Deleted Markets</h3>
            <ul className="market-list-custom text-truncate">
              {markets.map((market, index) => (
                <li
                  key={index}
                  className="market-item-custom"
                  onClick={() => {
                    setSelectedMarketId(market.marketId);
                    fetchMarketDetails(market.marketId);
                  }}
                >
                  {market.marketName}
                </li>
              ))}
            </ul>
            {noMarketsFound && (
              <div className="no-markets-message">
                <i className="fas fa-exclamation-circle"></i> No Markets With This Name Exist.
              </div>
            )}
          </aside>

          <div className="paper-content">
            {selectedMarketDetails === null ? (
              <h3 className="highlighted-message border">
                Select Market From The Left To View Its Details
              </h3>
            ) : (
              <Trashmarketdetails
                details={selectedMarketDetails}
                refreshMarkets={fetchMarkets}
                pagination={pagination}
                SearchTerm={searchTerm}
                handlePageChange={handlePageChange}
                handleSearchChange={handleSearchChange}
                startIndex={startIndex}
                endIndex={endIndex}
                fetchMarketDetails={fetchMarketDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trash;
