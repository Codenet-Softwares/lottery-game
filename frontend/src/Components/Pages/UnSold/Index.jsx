import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../../../contextApi/context";
// import {
//   GetPurchaseHistoryMarketTimings,
//   LotteryRange,
//   PurchasedTicketsHistory,
// } from "../../../Utils/apiService";

import { Table, Spinner, Card } from "react-bootstrap";
import debounce from "lodash.debounce";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../../Common/Pagination";
import { format } from "date-fns";
// import "./PurchasedTickets.css";
import '../PurchasedTickets/PurchasedTickets.css'
import { generateGroups, generateNumbers, generateSeries } from "../../../Utils/helper";
import { getLotteryRange } from "../../../Utils/getInitialState";
import Search from "./Search/Search";
import { GetPurchaseHistoryMarketTimings ,LotteryRange , PurchasedTicketsHistory } from "../../../Utils/apiService";

const UnsoldTickets = () => {
  const { dispatch, showLoader, hideLoader, store , isLoading} = useAppContext();
  const { marketId: paramMarketId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(true);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [modifiedpurchasedTickets, setModifiedPurchasedTickets] = useState({});

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });
  // Get today's date in "yyyy-MM-dd" format
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today); //for date filter
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(
    paramMarketId || null
  );
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [lotteryRange, setLotteryRange] = useState(getLotteryRange);
  const [allActiveMarket, SetAllActiveMarket] = useState([]);
  const [filteredMarket, setFilteredMarket] = useState(null);
  const [filteredNumbers, setFilteredNumbers] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [responseData, setResponseData] = useState(null);
  const visibleCount = 5;

  console.log("purchasedTickets", modifiedpurchasedTickets)
  console.log("modifiedpurchasedTickets", responseData)

  const fetchMarketData = async () => {
    const response = await GetPurchaseHistoryMarketTimings({
      date: selectedDate,
    });

    if (response?.success) {
      const marketsData = response.data || [];
      setMarkets(marketsData);

      if (!paramMarketId && marketsData.length > 0) {
        const firstMarketId = marketsData[0].marketId;
        navigate(`/unsold-tickets/${firstMarketId}`, { replace: true });
        setSelectedMarketId(firstMarketId);
      } else if (marketsData.length === 0) {
        console.error("Market Not Found");
        // No markets to handle further, do nothing or add specific fallback logic
      }
    } else {
      console.error("Failed to fetch markets");
      // Handle unsuccessful fetch scenario here, if needed
    }
  };

  useEffect(() => {
    fetchMarketData();
    // fetchData();
  }, [paramMarketId, navigate, selectedDate]);



  

  // Create debounced fetchPurchasedLotteryTickets function
  const fetchPurchasedLotteryTickets = useCallback(
    debounce(async (searchTerm) => {
      if (!selectedMarketId) return;
      setLoader(true);

      const response = await PurchasedTicketsHistory({
        marketId: selectedMarketId,
        page: pagination.page,
        limit: pagination.limit,
        searchBySem: searchTerm,
      });

      if (response?.success) {
        setPurchasedTickets(response.data || []);
        let result = [];
        response.data.forEach(item => {
          // Simply push all tickets into the result array
          result.push(...item.tickets);
        });
        setModifiedPurchasedTickets(result);

        setPagination({
          page: response?.pagination?.page || 1,
          limit: response?.pagination?.limit || 10,
          totalPages: response?.pagination?.totalPages,
          totalItems: response?.pagination?.totalItems,
        });

        dispatch({
          type: "PURCHASED_LOTTERY_TICKETS",
          payload: response.data,
        });
      } else {
        console.error("Failed to fetch purchased tickets");
      }

      setLoader(false);
    }, 500),
    [selectedMarketId, pagination.page, pagination.limit, dispatch]
  );
  const fetchData = async () => {
    setLoading(true);
    showLoader();
    try {
      await fetchPurchasedLotteryTickets(searchTerm);
    } catch (error) {
      console.error("Error fetching lottery markets:", error);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };
  // Effect for fetching purchased tickets when selectedMarketId, pagination, or searchTerm changes
  useEffect(() => {
    if (!selectedMarketId) return;

    fetchData();

    return () => {
      fetchPurchasedLotteryTickets.cancel();
    };
  }, [
    selectedMarketId,
    pagination.page,
    pagination.limit,
    searchTerm,
    fetchPurchasedLotteryTickets,
  ]);

  // Handle market click (select a market)
  const handleMarketClick = (marketId) => {
    setSelectedMarketId(marketId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    navigate(`/unsold-tickets/${marketId}`);
 
    
  };

  // Handle pagination left click (to view previous markets)
  const handleLeftClick = () => {
    setVisibleStartIndex((prev) => Math.max(0, prev - 1));
  };

  // Handle pagination right click (to view next markets)
  const handleRightClick = () => {
    setVisibleStartIndex((prev) =>
      Math.min(prev + 1, Math.max(0, markets.length - visibleCount))
    );
  };

  // Slice the visible markets based on pagination settings
  const visibleMarkets = markets.slice(
    visibleStartIndex,
    visibleStartIndex + visibleCount
  );

  // Function to handle fetching and setting lottery range and market data
  const handleLotteryRange = async () => {
    const data = await LotteryRange({
      search: debouncedSearchTerm,
    });
    SetAllActiveMarket(data?.data);
    setFilteredMarket(data?.data[0]);
    setLotteryRange({
      group_start: data?.data[0]?.group_start,
      group_end: data?.data[0]?.group_end,
      series_start: data?.data[0]?.series_start,
      series_end: data?.data[0]?.series_end,
      number_start: data?.data[0]?.number_start,
      number_end: data?.data[0]?.number_end,
    });

    // Initialize the filtered numbers based on the fetched range
    setFilteredNumbers(
      generateNumbers(data.data[0]?.number_start, data.data[0]?.number_end)
    );
    setFilteredGroups(
      generateGroups(data.data[0]?.group_start, data.data[0]?.group_end)
    );
    setFilteredSeries(
      generateSeries(data.data[0]?.series_start, data.data[0]?.series_end)
    );
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        await handleLotteryRange();
        // await handleMarketClickSearch(paramMarketId);
      } catch (error) {
        console.error("Error fetching lottery markets:", error);
      } finally {
        hideLoader();
      }
    };
    fetchData();
  }, [debouncedSearchTerm]);


  const handleMarketClickSearch = async (marketId) => {
    // Filter the selected market object from allActiveMarket
    const filteredObject = allActiveMarket.find(
      (item) => item.id === marketId
    );
    setFilteredMarket(filteredObject);
    setLotteryRange({
      group_start: filteredObject?.group_start,
      group_end: filteredObject?.group_end,
      series_start: filteredObject?.series_start,
      series_end: filteredObject?.series_end,
      number_start: filteredObject?.number_start,
      number_end: filteredObject?.number_end,
    });

    // Initialize the filtered numbers based on the fetched range
    setFilteredNumbers(
      generateNumbers(filteredObject.number_start, filteredObject.number_end)
    );
    setFilteredGroups(
      generateGroups(filteredObject.group_start, filteredObject.group_end)
    );
    setFilteredSeries(
      generateSeries(filteredObject.series_start, filteredObject.series_end)
    );
  };


  function modifyTicketsWithStatus(data, result) {
    // Create a modified tickets array where each ticket is an object with tickno and isSold
    const modifiedTickets = data.tickets.map(ticket => {
      const isSold = result.includes(ticket); // Check if ticket exists in the result array
      return {
        tickno: ticket,
        isSold: isSold
      };
    });
  
    // Return the modified object with updated tickets array
    return {
      ...data,
      tickets: modifiedTickets
    };
  }
  

  

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ background: "#f0f0f0", minHeight: "75vh" }}
    >
      <div
        className="container mt-5 p-3"
        style={{
          background: "#e6f7ff",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
     
       
        {/* Top Navigation for Markets */}
        <div
          className="d-flex justify-content-between align-items-center mb-3 p-2 rounded shadow"
          style={{
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
          }}
        >
          {visibleMarkets.length > 0 ? (
            <>
              <h4
                className="fw-bold"
                style={{
                  color: "#4682B4",
                }}
              >
                SELECT MARKETS
              </h4>
              <div className="d-flex align-items-center">
                {/* Left Navigation Button */}
                <button
                  className="btn btn-sm btn-outline-primary me-3"
                  onClick={handleLeftClick}
                  disabled={visibleStartIndex === 0}
                  style={{
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    &lt;
                  </span>
                </button>

                {/* Visible Markets */}
                <div className="d-flex flex-wrap justify-content-center">
                  {visibleMarkets.map((market) => (
                    <span
                      key={market.marketId}
                      className={`badge text-white me-2 mb-2 ${
                        selectedMarketId === market.marketId
                          ? "bg-success"
                          : "bg-primary"
                      }`}
                      style={{
                        cursor: "pointer",
                        padding: "10px 15px",
                        fontSize: "14px",
                        borderRadius: "20px",
                        transition: "all 0.3s ease-in-out",
                      }}
                      onClick={() => handleMarketClick(market.marketId)}
                    >
                      {market.marketName}
                    </span>
                  ))}
                </div>

                {/* Right Navigation Button */}
                <button
                  className="btn btn-sm btn-outline-primary ms-3"
                  onClick={handleRightClick}
                  disabled={visibleStartIndex + visibleCount >= markets.length}
                  style={{
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    &gt;
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center w-100">
              <h4
                style={{
                  color: "#FF6347",
                  fontWeight: "bold",
                  // marginBottom: "10px",
                }}
              >
                No Markets Available
              </h4>
              <p style={{ color: "#6c757d" }}>
                Please try again later or check your purchases.
              </p>
            </div>
          )}
        </div>
        
          {/* Search Section */}
        <main className="alt-main-content p-4">
        {filteredMarket ? (
          <Card className="welcome-card shadow-sm"
          style={{
            marginTop: "-40px",
            borderRadius: "0 0 20px 20px",
            zIndex: "1",
            position: "relative",
          }}
          
          >
            <Card.Body>
              {/* Display Market Name Above the Form */}
              <div className="text-center mb-4">
                {/* <h2
                  className="mb-1"
                  style={{
                    color: "#4682B4",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  🔍 Search Lottery Tickets for {filteredMarket.marketName}
                </h2> */}
              </div>
              <h2
                className="mb-1"
                style={{
                  color: "#4682B4",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                🔍 Check Lottery Tickets for {filteredMarket.marketName}
              </h2>
              {/* Pass filtered market and other props to Search component */}
              <Search
                marketId={selectedMarketId}
                filteredNumbers={filteredNumbers}
                filteredGroups={filteredGroups}
                filteredSeries={filteredSeries}
                setFilteredNumbers={setFilteredNumbers}
                setFilteredGroups={setFilteredGroups}
                setFilteredSeries={setFilteredSeries}
                lotteryRange={lotteryRange}
                responseData={responseData}
                setResponseData={setResponseData}
                modifiedpurchasedTickets={modifiedpurchasedTickets}
                checkTicketStatus={modifyTicketsWithStatus}
              />
            </Card.Body>
          </Card>
        ) : (
          <Card className="welcome-card shadow-sm">
            <Card.Body>
              {!isLoading && (
                <Card.Title className="welcome-title">
                  No Market Available
                </Card.Title>
              )}
            </Card.Body>
          </Card>
        )}
        </main>
    
      </div>
    </div>
  );
};

export default UnsoldTickets;
