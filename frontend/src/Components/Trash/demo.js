import React, { useEffect, useState } from "react";
import "./Trash.css";
import {
  DeletedLiveBetsMarkets,
  DeletedLiveBetsMarketsDetails,
} from "../../Utils/apiService";
import Trashmarketdetails from "./Trashmarketdetails";

const Trash = () => {
  const [isBinOpen, setIsBinOpen] = useState(false);
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
  const [noMarketsFound, setNoMarketsFound] = useState(false); // State to track no markets found

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleMarketStatusToggle = async () => {
    const newStatus = !selectedMarket.isActive;

    try {
      showLoader();
      const response = await isActiveLottery(
        { status: newStatus, marketId: selectedMarket.marketId },
        true
      );
      if (response.success) {
        toast.success(`Market is now ${newStatus ? "Active" : "Inactive"}`);
      } else {
        toast.error("Failed to update market status");
      }
    } catch (error) {
      console.error("Error activating/deactivating lottery:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchMarketTerm(searchMarketTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchMarketTerm]);

  const handleSearchMarketChange = (e) => {
    setSearchMarketTerm(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fetch markets from the API
  const fetchMarkets = async () => {
    try {
      const response = await DeletedLiveBetsMarkets({
        search: debouncedSearchMarketTerm,
      });
      if (response.data && response.data.length > 0) {
        setMarkets(response.data);
        setNoMarketsFound(false); // Reset no markets found state
      } else {
        setMarkets([]);
        setNoMarketsFound(true); // Set no markets found state
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  // Fetch market details based on selected marketId, search and pagination
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

  // Refetch market details when selectedMarketId or debouncedSearchTerm changes
  useEffect(() => {
    if (selectedMarketId !== null) {
      fetchMarketDetails(selectedMarketId);
    }
  }, [
    selectedMarketId,
    debouncedSearchTerm,
    pagination.page,
    pagination.limit,
  ]);

  // Refetch markets if search term is cleared
  useEffect(() => {
    if (debouncedSearchMarketTerm === "") {
      fetchMarkets();
    }
  }, [debouncedSearchMarketTerm]);

  // Refetch markets if search term is cleared
  useEffect(() => {
    if (debouncedSearchTerm === "") {
      if (selectedMarketId !== null) {
        fetchMarketDetails(selectedMarketId);
      }
    }
  }, [debouncedSearchTerm]);

  // Fetch markets when the bin is opened and reset details when the bin is closed
  useEffect(() => {
    if (isBinOpen) {
      fetchMarkets();
    } else {
      setSelectedMarketDetails(null);
    }
  }, [isBinOpen, debouncedSearchMarketTerm]);

  const openCrumpledPaper = () => setIsBinOpen(true);
  const closeCrumpledPaper = () => {
    setIsBinOpen(false);
    setSelectedMarketDetails(null);
    setSelectedMarketId(null);
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
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
        <div className="main-container-trash">
          <div
            className="search-bar-container-shrink-2"
            style={{
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50%",
              zIndex: 10,
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#f1f7ff",
              padding: "10px",
              borderRadius: "50px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <input
              type="text"
              className="search-bar-shrink-1"
              placeholder="Search deleted markets..."
              value={searchMarketTerm}
              onChange={handleSearchMarketChange}
              style={{
                width: "100%",
                padding: "10px 20px",
                borderRadius: "50px",
                border: "1px solid #4682B4",
                backgroundColor: "#f1f7ff",
                color: "#4682B4",
                fontSize: "16px",
                outline: "none",
                boxShadow: "none",
                transition: "all 0.3s ease-in-out",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1e5c8a")}
              onBlur={(e) => (e.target.style.borderColor = "#4682B4")}
            />
          </div>
          <div className="crumpled-paper">
            <button className="back-to-bin" onClick={closeCrumpledPaper}>
              Back to Trash
            </button>
            <aside className="market-sidebar">
              <h3>Deleted Markets</h3>
              <ul className="market-list-custom">
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
                <p className="no-markets-found">No markets with this name exist.</p>
              )}
            </aside>
            <div className="paper-content">
              {selectedMarketDetails === null ? (
                <p className="highlighted-message">
                  Select a market from the left to view its details
                </p>
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
      )}
    </div>
  );
};

export default Trash;
