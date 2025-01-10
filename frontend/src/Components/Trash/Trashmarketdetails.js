import React, { useState } from "react";
import "./Trashmarketdetails.css";
import { TrashMarketsDelete } from "../../Utils/apiService";

const Trashmarketdetails = ({ details, refreshMarkets }) => {
  console.log("===>> line number 6", details);
  const [expandedTickets, setExpandedTickets] = useState(null);

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

  return (
    <div className="market-details-container" style={{ width: '300%' }}>
    <h3 className="market-details-title">
      Trash Market Details of {details[0].marketName}
    </h3>
    <table className="frost-table" >
      <thead>
        <tr>
          <th>Username</th>
          <th>SEM</th>
          <th>Price</th>
          <th>Lottery Price</th>
          <th>Tickets</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {details.map((detail, index) => (
          <React.Fragment key={detail.trashMarketId}>
            <tr>
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
                  // onClick={() => handleRevoke(detail.trashMarketId)}
                  style={{ marginLeft: '8px' }}
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
  
  );
};

export default Trashmarketdetails;
