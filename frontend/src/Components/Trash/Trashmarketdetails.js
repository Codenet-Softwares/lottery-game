import React, { useEffect, useState } from "react";
import "./Trashmarketdetails.css";
import { TrashMarketsDelete } from "../../Utils/apiService";
import Pagination from "../Common/Pagination";

const Trashmarketdetails = ({
  details,
  pagination,
  debouncedSearchTerm,
  handlePageChange,
  refreshMarkets,
  startIndex,
  endIndex,
}) => {
  const [expandedTickets, setExpandedTickets] = useState(null);

  useEffect(() => {
    // Additional logic on pagination or search term change if needed
  }, [debouncedSearchTerm, pagination.page]);

  const toggleTicketsDropdown = (index) => {
    setExpandedTickets(expandedTickets === index ? null : index);
  };

  const handleDelete = async (trashId) => {
    if (window.confirm("Are you sure you want to delete this market?")) {
      try {
        await TrashMarketsDelete({ trashId });
        alert("Market deleted successfully!");
        refreshMarkets(); // Call parent function to refresh the list
      } catch (error) {
        console.error("Error deleting market:", error);
        alert("Failed to delete the market. Please try again.");
      }
    }
  };

  // Ensure `details` and `details[0]` are valid
  const marketName = details?.[0]?.marketName || "Unknown Market";

  return (
    <div className="market-details-container" style={{ width: "150%" }}>
      <h3 className="market-details-title">
        Trash Market Details of {marketName}
      </h3>
      <div className="table-container">
        <table className="frost-table">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Username</th>
              <th>SEM</th>
              <th>Price</th>
              <th>Lottery Price</th>
              <th>Tickets</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {details?.map((detail, index) => (
              <React.Fragment key={detail.trashMarketId}>
                <tr key={index}>
                  <td>{startIndex + index}</td>
                  <td>{detail.userName}</td>
                  <td>{detail.sem}</td>
                  <td>{detail.price}</td>
                  <td>{detail.lotteryPrice}</td>
                  <td>
                    <button
                      className="tickets-button"
                      onClick={() => toggleTicketsDropdown(index)}
                    >
                      View Tickets
                    </button>
                  </td>
                  <td>
                    <i
                      className="bi bi-trash-fill delete-icon"
                      title="Delete Market"
                      onClick={() => handleDelete(detail.trashMarketId)}
                    ></i>
                    <i
                      className="bi bi-arrow-counterclockwise undo-icon"
                      title="Revoke"
                      style={{ marginLeft: "8px" }}
                    ></i>
                  </td>
                </tr>
                {expandedTickets === index && (
                  <tr>
                    <td colSpan="6" className="tickets-dropdown-container">
                      <div className="tickets-dropdown">
                        {detail.Tickets.map((ticket, idx) => (
                          <p key={idx} className="ticket-item">
                            {ticket}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        handlePageChange={handlePageChange}
        totalData={pagination.totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
};

export default Trashmarketdetails;
