import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../../../contextApi/context";
import {
  GetPurchaseHistoryMarketTimings,
  PurchasedTicketsHistory,
} from "../../../Utils/apiService";
import { Table, Spinner } from "react-bootstrap";
import debounce from "lodash.debounce";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../../Common/Pagination";
import { format } from "date-fns";
import "./PurchasedTickets.css";

const PurchasedTickets = () => {
  const { dispatch, showLoader, hideLoader, store } = useAppContext();

  const { marketId: paramMarketId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(true);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
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
  const visibleCount = 5;

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const fetchMarketData = async () => {
    const response = await GetPurchaseHistoryMarketTimings({
      date: selectedDate,
    });

    if (response?.success) {
      const marketsData = response.data || [];
      setMarkets(marketsData);

      if (!paramMarketId && marketsData.length > 0) {
        const firstMarketId = marketsData[0].marketId;
        navigate(`/purchase-history/${firstMarketId}`, { replace: true });
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

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    const formattedDate = format(new Date(newDate), "yyyy-MM-dd");
    setSelectedDate(formattedDate);
    fetchData();
  };

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

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle pagination page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle market click (select a market)
  const handleMarketClick = (marketId) => {
    setSelectedMarketId(marketId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    navigate(`/purchase-history/${marketId}`);
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

  // Calculate start and end indices for pagination display
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );

  // if (loading) {
  //   return null;
  // }

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
        {/* Date Filter UI */}
        <div className="date-filter-container">
          <div>
            <label htmlFor="date-filter" className="date-filter-label">
              <i
                className="fas fa-calendar-alt me-2"
                style={{ color: "#4682B4" }}
              ></i>
              Select Lottery Market Date:
            </label>
            <p className="date-filter-description">
              Please choose a date to view past available lottery markets.
            </p>
          </div>
          <input
            type="date"
            id="date-filter"
            className="date-filter-input"
            value={selectedDate}
            onChange={handleDateChange}
            max={today} // Prevent selecting future dates
          />
        </div>

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
                LOTTERY MARKETS
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

        {visibleMarkets.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fw-bold" style={{ color: "#4682B4" }}>
                PURCHASED LOTTERY TICKETS
              </h2>
              <div className="w-50">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search purchased tickets by SEM.."
                  aria-label="Search tickets"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div
              style={{
                maxHeight: "300px", // Limit the container height
                overflowY: "auto", // Enable vertical scrolling
              }}
              className="custom-scrollbar"
            >
              <table
                className="table table-striped table-bordered table-hover"
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    backgroundColor: "#4682B4",
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  <tr>
                    <th>Serial Number</th>
                    <th>Market Name</th>
                    <th>Price</th>
                    <th>SEM</th>
                    <th>Tickets</th>
                    <th>User Name</th>
                  </tr>
                </thead>
                <tbody style={{ textAlign: "center" }}>
                  {loader ? (
                    <tr>
                      <td colSpan="6">
                        <div className="d-flex justify-content-center align-items-center">
                          <Spinner animation="border" variant="primary" />
                          <span className="ms-2">Loading Tickets....</span>
                        </div>
                      </td>
                    </tr>
                  ) : purchasedTickets.length > 0 ? (
                    purchasedTickets.map((ticket, index) => (
                      <tr key={index}>
                        <td>{startIndex + index}</td>
                        <td>{ticket.marketName || "N/A"}</td>
                        <td>{ticket.price}</td>
                        <td>{ticket.sem}</td>
                        <td>
                          <div
                            className="dropdown"
                            style={{ position: "relative" }}
                          >
                            <button
                              className="btn btn-link dropdown-toggle"
                              type="button"
                              onClick={() => toggleDropdown(index)}
                            >
                              View Tickets
                            </button>
                            <div
                              className="custom-dropdown-content"
                              style={{
                                maxHeight:
                                  dropdownOpen === index ? "200px" : "0",
                                overflow: "hidden",
                                transition: "max-height 0.3s ease",
                                background: "white",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              {dropdownOpen === index && (
                                <div
                                  style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    padding: "10px",
                                  }}
                                >
                                  <span className="dropdown-item-text">
                                    Ticket Numbers:
                                  </span>
                                  <div className="dropdown-divider" />
                                  {ticket.tickets.length > 0 ? (
                                    ticket.tickets.map((number, i) => (
                                      <span key={i} className="dropdown-item">
                                        {number}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="dropdown-item text-muted">
                                      No ticket numbers available
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{ticket.userName || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column align-items-center mt-5">
            {/* <h3 className="fw-bold" style={{ color: "#4682B4" }}>
              No Markets Yet!
            </h3>
            <p
              className="text-muted"
              style={{
                fontSize: "1.2rem",
                maxWidth: "600px",
                textAlign: "center",
              }}
            >
              Explore available markets or check back later to view your
              purchase history.
            </p> */}
            <div
              className="d-flex justify-content-center align-items-center mt-3"
              style={{
                background: "#e6f7ff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* <img
                    src="https://via.placeholder.com/150"
                    alt="No Markets"
                    style={{ width: "150px", marginRight: "20px" }}
                  /> */}
              <div>
                <h5 className="text-secondary text-center">
                  No purchases to display
                </h5>
                <p className="mb-0 text-muted">
                  Your purchase history will appear here once available markets
                  are added.
                </p>
              </div>
            </div>
          </div>
        )}

        {purchasedTickets?.length > 0 && visibleMarkets?.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            handlePageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
            totalData={pagination.totalItems}
          />
        )}
      </div>
    </div>
  );
};

export default PurchasedTickets;
