import React, { useState } from "react";
import "./Trashmarketdetails.css";
import { TrashMarketsDelete,RevokeMarketsDelete } from "../../Utils/apiService";
import Pagination from "../Common/Pagination";
import { useAppContext } from "../../contextApi/context";

const Trashmarketdetails = ({
  details,
  pagination,
  SearchTerm,
  handlePageChange,
  refreshMarkets, // this is used to refresh the market list after deleting
  startIndex,
  endIndex,
  handleSearchChange,
  fetchMarketDetails, // pass the fetchMarketDetails function from the parent
}) => {

  const { showLoader, hideLoader } = useAppContext();
  const [expandedTickets, setExpandedTickets] = useState(null);

  const toggleTicketsDropdown = (index) => {
    setExpandedTickets(expandedTickets === index ? null : index);
  };

  // const handleDelete = async (trashId,selectedMarketId) => {
 
  //   if (window.confirm("Are you sure you want to delete this market?")) {
  //     try {
  //       await TrashMarketsDelete({trashId:trashId });
  //       alert("Market deleted successfully!");
  //       // Call the refreshMarkets and also refetch market details after deletion
  //       refreshMarkets(); // Refresh markets list
  //       fetchMarketDetails( selectedMarketId); // Refetch the market details
  //     } catch (error) {
  //       console.error("Error deleting market:", error);
  //       alert("Failed to delete the market. Please try again.");
  //     }
  //   }
  // };

  // const handleRevoke = async (trashId, selectedMarketId) => {
  //  
  //   if (window.confirm("Are you sure you want to revoke this market?")) {
  //     const requestBody = {
  //       trashMarketId:trashId

  //     }
      
  //       const response = await RevokeMarketsDelete(requestBody);

  //       if (response.success){
  //         alert("Market revoked successfully!");
  //       refreshMarkets(); // Refresh the markets list after revoke
  //       fetchMarketDetails( selectedMarketId)

  //       }else {

  //         alert ("Error Revoking")
  //       }
        
  //   }
  // };

  const handleDelete = async (trashId, selectedMarketId) => {
 
    if (window.confirm("Are you sure you want to delete this market?")) {
      try {
        showLoader(); // Show loader before the request
        await TrashMarketsDelete({ trashId: trashId });
        alert("Market deleted successfully!");
        refreshMarkets(); // Refresh markets list
        fetchMarketDetails(selectedMarketId); // Refetch the market details
      } catch (error) {
        console.error("Error deleting market:", error);
        alert("Failed to delete the market. Please try again.");
      } finally {
        hideLoader(); // Hide loader after the request
      }
    }
  };
  
  const handleRevoke = async (trashId, selectedMarketId) => {

    if (window.confirm("Are you sure you want to revoke this market?")) {
      try {
        showLoader(); // Show loader before the request
        const requestBody = { trashMarketId: trashId };
        const response = await RevokeMarketsDelete(requestBody);
  
        if (response.success) {
          alert("Market revoked successfully!");
          refreshMarkets(); // Refresh the markets list after revoke
          fetchMarketDetails(selectedMarketId);
        } else {
          alert("Error revoking market.");
        }
      } catch (error) {
        console.error("Error revoking market:", error);
        alert("Failed to revoke the market. Please try again.");
      } finally {
        hideLoader(); // Hide loader after the request
      }
    }
  };
  

  // Handle "No results found" scenario
  const isNoResultsFound = details.length === 0;
  // Ensure `details` and `details[0]` are valid
  const marketName = details?.[0]?.marketName || "Unknown Market";

  return (
    <div className="market-details-container px-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="market-details-title text-start">
          Trash Market Details of {marketName}
        </h3>
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by username..."
            value={SearchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
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
            {isNoResultsFound ? (
              <tr>
                <td
                  colSpan="7"
                  className="no-results-found"
                  style={{ textAlign: "center" }}
                >
                  No results found
                </td>
              </tr>
            ) : (
              details.map((detail, index) => (
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
                        onClick={() =>
                          handleDelete(detail.trashMarketId, detail.marketId)
                        }
                      ></i>
                      <i
                        className="bi bi-arrow-counterclockwise undo-icon"
                        title="Revoke"
                        style={{ marginLeft: "8px" }}
                        onClick={() => handleRevoke(detail.trashMarketId, detail.marketId)}
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
              ))
            )}
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
