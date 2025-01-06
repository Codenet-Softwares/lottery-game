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

const PurchasedTickets = () => {
  const { dispatch, showLoader, hideLoader } = useAppContext();
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

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await GetPurchaseHistoryMarketTimings();

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
      } catch (error) {
        console.error("Error fetching markets:", error);
        // Handle fetch failure scenario here, if needed
      }
    };

    fetchMarketData();
  }, [paramMarketId, navigate]);

  // Create debounced fetchPurchasedLotteryTickets function
  const fetchPurchasedLotteryTickets = useCallback(
    debounce(async (searchTerm) => {
      setLoader(true);
      try {
        const response = await PurchasedTicketsHistory({
          marketId: selectedMarketId,
          page: pagination.page,
          limit: pagination.limit,
          searchBySem: searchTerm,
        });

        if (response?.success) {
          setPurchasedTickets(response.data || []);
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems,
          });
          dispatch({
            type: "PURCHASED_LOTTERY_TICKETS",
            payload: response.data,
          });
        } else {
          console.error("Failed to fetch purchased tickets");
        }
      } catch (error) {
        console.error("Error fetching purchased tickets:", error);
      }
      setLoader(false);
    }, 500),
    [selectedMarketId, pagination.page, pagination.limit, dispatch]
  );

  // Effect for fetching purchased tickets when selectedMarketId, pagination, or searchTerm changes
  useEffect(() => {
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

    fetchData();

    return () => {
      fetchPurchasedLotteryTickets.cancel(); // Clean up debounced function on unmount
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
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset pagination on search change
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

  if (loading) {
    return null;
  }

  return (
    <div
      className="container mt-5 p-3"
      style={{
        background: "#e6f7ff",
        borderRadius: "10px",
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
      }}
    >
      {/* Top Navigation for Markets */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Markets</h4>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={handleLeftClick}
            disabled={visibleStartIndex === 0}
          >
            &lt;
          </button>
          <div className="d-flex flex-wrap">
            {visibleMarkets.length > 0 ? (
              visibleMarkets.map((market) => (
                <span
                  key={market.marketId}
                  className={`badge me-2 ${
                    selectedMarketId === market.marketId
                      ? "bg-success"
                      : "bg-primary"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleMarketClick(market.marketId)}
                >
                  {market.marketName}
                </span>
              ))
            ) : (
              <span>No markets available</span>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleRightClick}
            disabled={visibleStartIndex + visibleCount >= markets.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Purchased Tickets Table */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold" style={{ color: "#4682B4" }}>
          Purchased Lottery Tickets
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

      <Table striped hover responsive bordered className="table-sm">
        <thead
          style={{
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
                  <span className="ms-2">Loading tickets...</span>
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
                  <div className="dropdown" style={{ position: "relative" }}>
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
                        maxHeight: dropdownOpen === index ? "200px" : "0", // Adjust to your desired max-height
                        overflow: "hidden", // Hide overflow initially
                        transition: "max-height 0.3s ease", // Smooth transition when opening
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {dropdownOpen === index && (
                        <div
                          style={{
                            maxHeight: "200px", // Sets the maximum height
                            overflowY: "auto", // Enables scrolling if necessary
                            padding: "10px", // Optional: Space inside the dropdown
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
              <td colSpan="5" className="text-center">
                No tickets found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        handlePageChange={handlePageChange}
        startIndex={startIndex}
        endIndex={endIndex}
        totalData={pagination.totalItems}
      />
    </div>
  );
};

export default PurchasedTickets;
