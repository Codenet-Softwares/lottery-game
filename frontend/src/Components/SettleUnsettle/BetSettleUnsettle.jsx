import React, { useEffect, useState } from "react";
import Pagination from "../Common/Pagination";
import { GetBetMarketStats, DeleteLiveBetMarket } from "../../Utils/apiService";
import ReusableModal from "../Reusables/ReusableModal";
import { useAppContext } from "../../contextApi/context";
import "./BetSettleUnsettle.css";
// import { useNavigate } from "react-router-dom";

const BetSettleUnsettle = ({ marketId, backButton, onAllDataDeleted }) => {
  // const {navigate}= useNavigate();
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLiveBetMarketStats = async () => {
    try {
      const response = await GetBetMarketStats({
        marketId,
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm,
      });

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
  }, [marketId, pagination.page, pagination.limit, debouncedSearchTerm]);

  const handleShowTickets = (details) => {
    const ticketsBody = details.map((detail) => (
      <div key={detail.sem} className="bet-settle-ticket-section mb-4">
        <div>
          <div className="bet-settle-ticket-header">
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
        <div className="bet-settle-ticket-scroll-container">
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
      body: <div className="bet-settle-modal-body-container">{ticketsBody}</div>,
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
          setBetStats((prevStats) => {
            const updatedStats = prevStats
              .map((user) => {
                const filteredDetails = user.details.filter(
                  (detail) => detail.purchaseId !== purchaseId
                );
                const deletedDetail = user.details.find(
                  (detail) => detail.purchaseId === purchaseId
                );
                return {
                  ...user,
                  details: filteredDetails,
                  amount: deletedDetail
                    ? user.amount - deletedDetail.lotteryPrice
                    : user.amount,
                };
              })
              .filter((user) => user.details.length > 0);

              if (updatedStats.length === 0) {
                // Redirect to BetAfterWin page
                window.location.href = "/bet-tracker";
                // navigate("/bet-tracker");
              }

            return updatedStats;
          });
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

  const startIndex = pagination.totalItems > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endIndex = pagination.totalItems > 0
    ? Math.min(pagination.page * pagination.limit, pagination.totalItems)
    : 0;

  return (
    <div className="container mt-4 rounded bet-settle-container">
      {betStats ? (
        <div className="container border-0" style={{ overflow: "hidden" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">

            <div className="bet-settle-back-button d-flex justify-content-start">
              {backButton}
            </div>
            <h3 className="bet-settle-header fw-bold d-flex align-items-center mt-3">
              Market Stats For {betStats[0]?.marketName}
            </h3>
          </div>

          <div className="d-flex align-items-center mb-3">
            <input
              type="text"
              className="form-control bet-settle-search-input"
              placeholder="Search By Username"
              aria-label="Search"
              aria-describedby="button-search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover shadow m-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th style={{ textAlign: "center", border: "none" }}>
                    Serial Number
                  </th>
                  <th style={{ width: "29.3%", textAlign: "center", border: "none" }}>
                    Username
                  </th>
                  <th style={{ width: "30%", textAlign: "center", border: "none" }}>
                    Total Amount
                  </th>
                  <th style={{ width: "31.1%", textAlign: "center", border: "none" }}>
                    Actions
                  </th>
                </tr>
              </thead>
            </table>

            <div className="bet-settle-table-container">
              <table className="table table-striped table-bordered table-hover shadow m-0">
                <tbody>
                  {filteredStats?.length > 0 ? (
                    filteredStats.map((user, idx) => (
                      <tr key={idx} style={{ border: "none" }}>
                        <td>{startIndex + idx}</td>
                        <td className="bet-settle-username-cell">{user.userName}</td>
                        <td className="bet-settle-amount-cell">₹{user.amount}</td>
                        <td className="bet-settle-actions-cell">
                          <button
                            className="btn btn-info"
                            onClick={() => handleShowTickets(user.details)}
                          >
                            <i className="bi bi-ticket-detailed"></i> Show Tickets
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-danger fw-bold">
                        The Search You Are Trying To Search Does Not Exist. Search Existing Live Markets.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalItems > 0 && (
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

          <ReusableModal
            show={modalShow}
            handleClose={() => setModalShow(false)}
            title={modalContent.title}
            body={modalContent.body}
          />
        </div>
      ) : (
        <p className="text-center text-muted">Loading Stats...</p>
      )}
    </div>
  );
};

export default BetSettleUnsettle;