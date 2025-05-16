import React from "react";
import { Spinner } from "react-bootstrap";
import Pagination from "../../Common/Pagination";
import "./PurchasedTickets.css";
import ViewTicketsModal from "./ViewTicketsModal";
import usePurchasedTickets from "../../../Utils/usePurchasedTickets";

const PurchasedTickets = () => {
  const {
    purchasedTicketState,
    setPurchasedTicketState,
    today,
    visibleCount,
    openModalWithTickets,
    handleDateChange,
    handleSearchChange,
    handlePageChange,
    handleMarketClick,
    handleLeftClick,
    handleRightClick,
  } = usePurchasedTickets();

  const visibleMarkets = purchasedTicketState.markets.slice(
    purchasedTicketState.visibleStartIndex,
    purchasedTicketState.visibleStartIndex + visibleCount
  );

  const startIndex =
    (purchasedTicketState.pagination.page - 1) *
      purchasedTicketState.pagination.limit +
    1;
  const endIndex = Math.min(
    purchasedTicketState.pagination.page *
      purchasedTicketState.pagination.limit,
    purchasedTicketState.pagination.totalItems
  );

  return (
    <div className="d-flex align-items-center justify-content-center">
      <div
        className="container mt-5 p-3"
        style={{
          background: "linear-gradient(135deg, #f0f9ff, #cce7f6)",
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
              Please Choose a Date To View Past Available Lottery Markets.
            </p>
          </div>
          <input
            type="date"
            id="date-filter"
            className="date-filter-input"
            value={purchasedTicketState.selectedDate}
            onChange={handleDateChange}
            max={today} // Prevent selecting future dates
            readonly // Prevent manual typing
            onKeyDown={(e) => e.preventDefault()} // Block manual input from keyboard
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
                  color: "#284B63",
                }}
              >
                LOTTERY MARKETS
              </h4>
              <div className="d-flex align-items-center">
                {/* Left Navigation Button */}
                <button
                  className="btn btn-sm btn-outline-primary me-3"
                  onClick={handleLeftClick}
                  disabled={purchasedTicketState.visibleStartIndex === 0}
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
                        purchasedTicketState.selectedMarketId ===
                        market.marketId
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
                  disabled={
                    purchasedTicketState.visibleStartIndex + visibleCount >=
                    purchasedTicketState.markets.length
                  }
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
                Please Try Again Later or Check Your Purchases.
              </p>
            </div>
          )}
        </div>

        {visibleMarkets.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold" style={{ color: "#284B63" }}>
                PURCHASED LOTTERY TICKETS
              </h3>
              <div className="w-50">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search purchased tickets by SEM.."
                  aria-label="Search tickets"
                  value={purchasedTicketState.searchTerm}
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
                  {purchasedTicketState.loader ? (
                    <tr>
                      <td colSpan="6">
                        <div className="d-flex justify-content-center align-items-center">
                          <Spinner animation="border" variant="primary" />
                          <span className="ms-2">Loading Tickets....</span>
                        </div>
                      </td>
                    </tr>
                  ) : purchasedTicketState.purchasedTickets.length > 0 ? (
                    purchasedTicketState.purchasedTickets.map(
                      (ticket, index) => (
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
                                className="btn btn-outline-dark fw-semibold px-4 py-2 rounded-5 shadow-sm border-1"
                                type="button"
                                onClick={() =>
                                  openModalWithTickets(ticket.tickets)
                                }
                              >
                                <i className="bi bi-ticket-perforated me-2"></i>{" "}
                                View Tickets
                              </button>
                              <ViewTicketsModal
                                isOpen={purchasedTicketState.modalOpen}
                                onClose={() =>
                                  setPurchasedTicketState((prev) => ({
                                    ...prev,
                                    modalOpen: false,
                                  }))
                                }
                                ticketNumbers={
                                  purchasedTicketState.selectedTickets
                                }
                              />
                            </div>
                          </td>
                          <td>{ticket.userName || "N/A"}</td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No tickets Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column align-items-center mt-5">
            <div
              className="d-flex justify-content-center align-items-center mt-3"
              style={{
                background: "#e6f7ff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div>
                <h5 className="text-secondary text-center">
                  No Purchases To Display
                </h5>
                <p className="mb-0 text-muted">
                  Your Purchase History Will Appear Here Once Available Markets
                  Are Added.
                </p>
              </div>
            </div>
          </div>
        )}

        {purchasedTicketState.purchasedTickets?.length > 0 &&
          visibleMarkets?.length > 0 && (
            <Pagination
              currentPage={purchasedTicketState.pagination.page}
              totalPages={purchasedTicketState.pagination.totalPages}
              handlePageChange={handlePageChange}
              startIndex={startIndex}
              endIndex={endIndex}
              totalData={purchasedTicketState.pagination.totalItems}
            />
          )}
      </div>
    </div>
  );
};

export default PurchasedTickets;
