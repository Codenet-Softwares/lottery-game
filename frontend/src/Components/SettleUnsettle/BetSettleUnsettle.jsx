import React, { useEffect, useState } from "react";
import Pagination from "../Common/Pagination";
import { GetBetMarketStats, DeleteLiveBetMarket } from "../../Utils/apiService";
import ReusableModal from "../Reusables/ReusableModal";
import { useAppContext } from "../../contextApi/context";

const BetSettleUnsettle = ({ marketId, backButton }) => {
  const [betStats, setBetStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });
  const { showLoader, hideLoader } = useAppContext();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });

  const fetchLiveBetMarketStats = async () => {
    try {
      const response = await GetBetMarketStats({
        marketId,
        page: pagination.page,
        limit: pagination.limit,
        search:searchTerm,
      });

      console.log("API Response===========================", response);

      if (response?.success) {
        
        setBetStats(response.data);
        setPagination((prev) => ({
          page: response.pagination?.page || prev.page,
          limit: response.pagination?.limit || prev.limit,
          totalPages: response.pagination?.totalPages || 0,
          totalItems: response.pagination?.totalItems || 0,
        }));
      } else {
        console.error("Failed to fetch market stats:", response?.message);
      }
    } catch (error) {
      console.error("Error fetching market stats:", error);
    }
  };
  useEffect(() => {
    if (marketId) {
      fetchLiveBetMarketStats();
    }
  }, [marketId, pagination.page, pagination.limit, searchTerm]);
  
  const handleShowTickets = (details) => {
    const ticketsBody = details.map((detail) => (
      <div key={detail.sem} className="mb-4 ticket-section">
        <div>
          <div className="ticket-header d-flex justify-content-between align-items-center">
            <h6 className="text-primary fw-bold mb-0">
              SEM: {detail.sem} | Amount: ₹{detail.lotteryPrice}
            </h6>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteTicket(detail.purchaseId)}
            >
              <i className="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
        <div className="ticket-scroll-container">
          <ul className="list-group">
            {detail.tickets.map((ticket, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{ticket}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ));

    setModalContent({
      title: "Purchased Tickets",
      body: <div className="modal-body-container">{ticketsBody}</div>,
    });
    setModalShow(true);
  };
  const handleDeleteTicket = async (purchaseId) => {
    const confirmDeletion = window.confirm(
      "Are you sure you want to delete this live bet? This action is irreversible."
    );
  
    if (confirmDeletion) {
      try {
        showLoader();  
        const response = await DeleteLiveBetMarket({ purchaseId }, false);  
        if (response.success) {
          alert("Live bet deleted successfully!"); 
          // Remove the deleted item from the state instead of refreshing
          setBetStats((prevStats) =>
            prevStats
              .map((user) => ({
                ...user,
                details: user.details.filter(
                  (detail) => detail.purchaseId !== purchaseId
                ),
              }))
              .filter((user) => user.details.length > 0) // Remove users with no remaining bets
          );  
          // Close modal
          setModalShow(false);
        } else {
          alert("Failed to delete live bet. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting live bet:", error);
        alert("An error occurred while deleting the live bet.");
      } finally {
        hideLoader();
      }
    }
  };
  
  useEffect(() => {
    console.log("Market ID================", marketId);
    if (marketId) {
      fetchLiveBetMarketStats();
    }
  }, [marketId, pagination.page, pagination.limit]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const filteredStats = betStats?.filter((user) =>
    user.userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );
  return (
    <div className="container mt-4 rounded" style={{ overflow: "hidden",background:"#F0F0F0" }}>
      {betStats ? (
        <div className="container " style={{ overflow: "hidden" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div
              className="d-flex justify-content-start mt-5 px-5"
              style={{ position: "absolute", left: "40px" }}
            >
              {backButton}
            </div>

            <h3
              className="text-custom fw-bold d-flex align-items-center mt-3"
              style={{
                fontFamily: '"Arial", sans-serif',
                fontSize: "2rem",
                color: "#5a8f7d",
                textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Market Stats For {betStats[0]?.marketName}
            </h3>
          </div>

          <div className="d-flex align-items-center mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by username"
              aria-label="Search"
              aria-describedby="button-search"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                borderRadius: "50px",
                border: "1px solid #4682B4",
                paddingLeft: "30px",
                background: "linear-gradient(to right, #e6f7ff, #4682B4)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) =>
                (e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)")
              }
              onBlur={(e) =>
                (e.target.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)")
              }
            />
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover shadow m-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th style={{ textAlign: "center", border: "none" }}>
                    Serial Number
                  </th>
                  <th
                    style={{
                      width: "29.3%",
                      textAlign: "center",
                      border: "none",
                    }}
                  >
                    Username
                  </th>
                  <th
                    style={{
                      width: "30%",
                      textAlign: "center",
                      border: "none",
                    }}
                  >
                    Total Amount
                  </th>
                  <th
                    style={{
                      width: "31.1%",
                      textAlign: "center",
                      border: "none",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
            </table>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                borderTop: "1px solid #dee2e6",
              }}
            >
              <table className="table table-striped table-bordered table-hover shadow m-0">
                <tbody>
                  {filteredStats?.length > 0 ? (
                    filteredStats.map((user, idx) => (
                      <tr key={idx} style={{ border: "none" }}>
                        <td>{startIndex + idx}</td>
                        <td
                          className="fw-bold text-secondary"
                          style={{ width: "30%", textAlign: "center" }}
                        >
                          {user.userName}
                        </td>
                        <td
                          className="fw-bold text-success"
                          style={{ width: "30%", textAlign: "center" }}
                        >
                          ₹{user.amount}
                        </td>
                        <td style={{ width: "30%", textAlign: "center" }}>
                          <button
                            className="btn btn-info"
                            onClick={() => handleShowTickets(user.details)}
                          >
                            <i className="bi bi-ticket-detailed"></i> Show
                            Tickets
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-danger">
                        The search you are trying to search does not exist.
                        Search existing live markets.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              handlePageChange={handlePageChange}
              startIndex={startIndex}
              endIndex={endIndex}
              totalData={pagination.totalItems}
            />
          </div>

          <ReusableModal
            show={modalShow}
            handleClose={() => setModalShow(false)}
            title={modalContent.title}
            body={modalContent.body}
          />
        </div>
      ) : (
        <p className="text-center text-muted">Loading stats...</p>
      )}
    </div>
  );
};

export default BetSettleUnsettle;
