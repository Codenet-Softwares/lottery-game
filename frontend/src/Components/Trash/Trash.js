import React, { useEffect, useState } from "react";
import "./Trash.css";
import { DeletedLiveBetsMarkets, DeletedLiveBetsMarketsDetails } from "../../Utils/apiService";
import Trashmarketdetails from "./Trashmarketdetails";

const Trash = () => {
  const [isBinOpen, setIsBinOpen] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [selectedMarketDetails, setSelectedMarketDetails] = useState(null);
  //  const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      totalPages: 0,
      totalItems: 0,
    });


      // Debounce search term
      // useEffect(() => {
      //   const timer = setTimeout(() => {
      //     setDebouncedSearchTerm(searchTerm);
      //   }, 500);
    
      //   return () => clearTimeout(timer);
      // }, [searchTerm]);

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

       // Reset pagination to page 1 when switching markets
       setPagination((prev) => ({ ...prev, page:pagination.page }));

      const response = await DeletedLiveBetsMarketsDetails({ 
        marketId ,
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
      });
      setSelectedMarketDetails(response.data||[]);
           // Safely handle pagination properties
           setPagination((prev) => ({
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 10,
            totalPages: response.pagination?.totalPages || 0,
            totalItems: response.pagination?.totalItems || 0,
          }));
    } catch (error) {
      console.error("Error fetching market details:", error);
    }
  };
  useEffect(() => {
    if (selectedMarketDetails?.[0]?.marketId) {
      const marketId = selectedMarketDetails[0]?.marketId;
      if (marketId) {
        fetchMarketDetails(marketId); // Re-fetch market details when the page changes
      }
    }
  }, [pagination.page]);
  

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
    // Calculate start and end indices for pagination display
    const startIndex = (pagination.page - 1) * pagination.limit + 1;
    const endIndex = Math.min(
      pagination.page * pagination.limit,
      pagination.totalItems
    );

  // Handle page change
const handlePageChange = (newPage) => {
  setPagination({
    ...pagination,
    page: newPage,
  });
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
    <Trashmarketdetails details={selectedMarketDetails} refreshMarkets={fetchMarkets}   pagination={pagination}
    debouncedSearchTerm={debouncedSearchTerm}
    handlePageChange={handlePageChange} 
    startIndex={startIndex}
    endIndex={endIndex}
    
    />
   
  )}
</div>

        </div>
      )}
    </div>
  );
};

export default Trash;
