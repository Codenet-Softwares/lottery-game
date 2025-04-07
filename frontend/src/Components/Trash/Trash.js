import React, { useEffect, useState } from "react";
import "./Trash.css";
import {
  DeletedLiveBetsMarkets,
  DeletedLiveBetsMarketsDetails,
} from "../../Utils/apiService";
import Trashmarketdetails from "./Trashmarketdetails";

const Trash = () => {
  // const [isBinOpen, setIsBinOpen] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(null); // Track selected marketId
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
  const [noMarketsFound, setNoMarketsFound] = useState(false)

  // Debounce search term
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

    const handleSearchMarketChange = (e) => {
      setSearchMarketTerm(e.target.value); // Update the market list search term
    };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term
  };

  // Fetch markets from the API
  const fetchMarkets = async () => {
    try {
      const response = await DeletedLiveBetsMarkets({
        search: debouncedSearchMarketTerm,
      });
      if (response.data && response.data.length > 0) {
        setMarkets(response.data);
        setNoMarketsFound(false)
      } else {
        setMarkets([]);
        setNoMarketsFound(true)
        console.warn("No deleted markets found.");
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  // Fetch market details based on selected marketId, search and pagination
  const fetchMarketDetails = async (marketId) => {
    if (!marketId) return; // Exit if no marketId is selected

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
    fetchMarkets(); // Always fetch when debounced value changes
  }, [debouncedSearchMarketTerm]);
  
  // Refetch markets if search term is cleared
  useEffect(() => {
    if (debouncedSearchTerm === "") {
      if (selectedMarketId !== null) {
        fetchMarketDetails(selectedMarketId); // Ensure details are fetched if no search term
      }
    }
  }, [debouncedSearchTerm]);

  // Fetch markets when the bin is opened and reset details when the bin is closed
 



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
          <div
            className="search-bar-container-shrink-2"
            style={{
              position: "absolute",
              top: "-10px", // Adjust the distance from the top as needed
              left: "50%",
              transform: "translateX(-50%)", // This centers it horizontally
              width: "50%", // Take up a larger width but still centered
              zIndex: 10, // Ensures it’s on top
              display: "flex", // Flexbox for better control
              justifyContent: "center", // Centers the content inside the div
              backgroundColor: "#f1f7ff", // Light background color for the 'merged' effect
              padding: "10px", // Padding around the search bar
              borderRadius: "50px", // Pill shape
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds subtle shadow for a more refined look
            }}
          >
            <input
              type="text"
              className="search-bar-shrink-1"
              placeholder="Search deleted markets..."
              value={searchMarketTerm}
              onChange={handleSearchMarketChange}
              style={{
                width: "100%", // Full width of the container
                padding: "10px 20px", // Adds more padding for a pill shape
                borderRadius: "50px", // Pill shape
                border: "1px solid #4682B4", // Steel Blue border
                backgroundColor: "#f1f7ff", // Light blue background for a professional look
                color: "#4682B4", // Text color matches the button color
                fontSize: "16px", // Adjust text size
                outline: "none", // Removes default focus outline
                boxShadow: "none", // Removes shadow from input
                transition: "all 0.3s ease-in-out", // Smooth transition for hover and focus
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1e5c8a")} // Focus color change
              onBlur={(e) => (e.target.style.borderColor = "#4682B4")} // Reverts border on blur
            />
          </div>
          <div className="crumpled-paper">
            {/* <button className="back-to-bin" onClick={closeCrumpledPaper}>
              Back to Trash
            </button> */}
            <aside className="market-sidebar">
              <h3>Deleted Markets</h3>
              <ul className="market-list-custom">
                {markets.map((market, index) => (
                  <li
                    key={index}
                    className="market-item-custom"
                    onClick={() => {
                      setSelectedMarketId(market.marketId); // Set the selected marketId
                      fetchMarketDetails(market.marketId); // Fetch details immediately
                    }}
                  >
                    {market.marketName}
                  </li>
                ))}
              </ul>
              {noMarketsFound && (
                 <div className="no-markets-message">
                 <i className="fas fa-exclamation-circle"></i> No markets with this name exist.
               </div>
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
  
    </div>
  );
};

export default Trash;
