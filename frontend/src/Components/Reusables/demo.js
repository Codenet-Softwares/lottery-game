import React, { useState, useEffect } from "react";
import {
  subAdminWinResult,
  ViewSubAdminsTickets,
} from "../../Utils/apiService";
import Pagination from "../Common/Pagination";
import ReusableModal from "../Reusables/ReusableModal";
import ComparisonTable from "../PrizeAppproval/ComparisonTable";
import { Button, Form, Accordion, Modal } from "react-bootstrap";

const WinResult = () => {
  const [loading, setLoading] = useState(true);
  const [subAdminResult, setSubAdminResult] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedMarketTicket, setSelectedMarketTicket] = useState(null);
  const [editablePrizes, setEditablePrizes] = useState({});
  const [errors, setErrors] = useState({});
  const [currentMarket, setCurrentMarket] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });

  const prizeData = {
    1: { rank: "1st", description: "Top prize for the winner" },
    2: { rank: "2nd", description: "Prize for 10 winners" },
    3: { rank: "3rd", description: "Prize for 10 winners" },
    4: { rank: "4th", description: "Prize for 10 winners" },
    5: { rank: "5th", description: "Prize for 100 winners" },
  };

  const fetchSubAdminResult = async () => {
    try {
      setLoading(true);
      const response = await subAdminWinResult({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter,
      });

      if (response?.success) {
        setAllResults(response.data || []);
        setPagination((prev) => ({
          page: response.pagination?.page || prev.page,
          limit: response.pagination?.limit || prev.limit,
          totalPages: response.pagination?.totalPages || 0,
          totalItems: response.pagination?.totalItems || 0,
        }));
      } else {
        setAllResults([]);
      }
    } catch (error) {
      console.error("Error fetching sub-admin result:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdminResult();
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  const fetchSubAdminTicketData = async (marketId, status) => {
    try {
      const response = await ViewSubAdminsTickets({ status }, marketId);
      if (response?.success) {
        setModalContent(response.data || []);
        setShowModal(true);
      } else {
        setModalContent([]);
      }
    } catch (error) {
      console.error("Error fetching sub-admin ticket data:", error);
    }
  };

  const handlePrepareEdit = (market) => {
    setCurrentMarket(market);
    // Transform the modalContent into the editable format
    const transformedPrizes = {};
    
    modalContent.forEach(item => {
      const rankNumber = item.prizeCategory === "First Prize" ? "1" :
                         item.prizeCategory === "Second Prize" ? "2" :
                         item.prizeCategory === "Third Prize" ? "3" :
                         item.prizeCategory === "Fourth Prize" ? "4" : "5";
      
      transformedPrizes[rankNumber] = {
        amount: item.prizeAmount.toString(),
        complementaryAmount: item.complementaryPrize?.toString() || "",
        ticketNumbers: item.ticketNumber || [""],
        isMatched: item.isMatched // Assuming isMatched is available in the data
      };
    });
    
    setEditablePrizes({
      [market.marketName]: transformedPrizes
    });
    setShowEditModal(true);
  };

  const validateInput = (value) => {
    const invalidCharacters = /[-*#+=@_]/;
    return !invalidCharacters.test(value);
  };

  const handlePrizeChange = (rank, value) => {
    if (validateInput(value)) {
      setErrors((prev) => ({ ...prev, [rank]: undefined }));
      setEditablePrizes(prev => {
        const newPrizes = {...prev};
        newPrizes[currentMarket.marketName][rank].amount = value;
        newPrizes[currentMarket.marketName][rank].isMatched = false; // Mark as unmatched when edited
        return newPrizes;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        [rank]: "Invalid input. Please avoid special characters.",
      }));
    }
  };

  const handleComplementaryChange = (rank, value) => {
    if (validateInput(value)) {
      setErrors((prev) => ({ ...prev, [rank]: undefined }));
      setEditablePrizes(prev => {
        const newPrizes = {...prev};
        newPrizes[currentMarket.marketName][rank].complementaryAmount = value;
        newPrizes[currentMarket.marketName][rank].isMatched = false; // Mark as unmatched when edited
        return newPrizes;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        [rank]: "Invalid input. Please avoid special characters.",
      }));
    }
  };

  const handleTicketChange = (rank, index, value, rankInput) => {
    if (value.length > 10 && rankInput === "1st") return;
    if (value.length > 5 && rankInput === "2nd") return;
    if (value.length > 4 && ["3rd", "4th", "5th"].includes(rankInput)) return;
    
    if (validateInput(value)) {
      setErrors((prev) => ({ ...prev, [rank]: undefined }));
      setEditablePrizes(prev => {
        const newPrizes = {...prev};
        newPrizes[currentMarket.marketName][rank].ticketNumbers[index] = value;
        newPrizes[currentMarket.marketName][rank].isMatched = false; // Mark as unmatched when edited
        return newPrizes;
      });
    } else {
      setErrors((prev) => ({
        ...prev,
        [rank]: "Invalid input. Please avoid special characters.",
      }));
    }
  };

  const handleSaveChanges = async () => {
    // Here you would call your API to save the changes
    // For now, we'll just close the modal and refresh the data
    setShowEditModal(false);
    fetchSubAdminResult();
  };

  useEffect(() => {
    if (statusFilter) {
      const filteredResults = allResults.filter(
        (item) => item.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setSubAdminResult(filteredResults);
    } else {
      setSubAdminResult(allResults);
    }
  }, [statusFilter, allResults]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );

  return (
    <div className="container d-flex justify-content-center mt-4">
      <div
        className="col-md-10 p-4 rounded shadow"
        style={{ background: "linear-gradient(135deg, #f0f9ff, #cce7f6)" }}
      >
        <h2
          className="text-center mb-3 fw-bold fw-bold text-uppercase"
          style={{ color: "#284B63" }}
        >
          SubAdmin History
        </h2>

        {/* Search Bar */}
        <div className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search By Market Name"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {/* Status Dropdown */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approve">Approve</option>
            <option value="Reject">Reject</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-muted">Loading...</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped text-center">
                <thead className="bg-primary text-white">
                  <tr>
                    <th>Market Name</th>
                    <th>Status</th>
                    <th className="test-start">Remark</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subAdminResult.length > 0 ? (
                    subAdminResult.map((item) => (
                      <tr key={item.marketId}>
                        <td className="text-center align-top">
                          {item.marketName}
                        </td>
                        <td className="text-center align-top">
                          <span
                            className={`badge rounded-pill px-3 py-2 fw-semibold ${
                              item.status === "Approve"
                                ? "bg-success text-white"
                                : item.status === "Reject"
                                ? "bg-danger text-white"
                                : "bg-warning text-dark"
                            }`}
                            style={{ textTransform: "capitalize" }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-start align-top text-wrap fw-semibold text-info">
                          {item.remarks ||
                            "Your submission is not yet approved."}
                        </td>

                        <td className="text-center align-top">
                          <button
                            className={`badge rounded-pill px-3 py-2 fw-semibold me-2 ${
                              item.status === "Approve"
                                ? "bg-success text-white"
                                : item.status === "Reject"
                                ? "bg-danger text-white"
                                : "bg-warning text-dark opacity-75"
                            }`}
                            onClick={() =>
                              fetchSubAdminTicketData(
                                item.marketId,
                                item.status
                              )
                            }
                          >
                            {item.status === "Approve"
                              ? "Show Prize"
                              : item.status === "Reject"
                              ? "Show Prize"
                              : "Pending"}
                          </button>
                          
                          {item.status === "Reject" && (
                            <button
                              className="badge rounded-pill px-3 py-2 fw-semibold bg-primary text-white"
                              onClick={() => handlePrepareEdit(item)}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-danger fw-bold"
                      >
                        No Data Available for Selected Status
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Prize Display Modal */}
            <ReusableModal
              show={showModal}
              handleClose={() => {
                setShowModal(false);
              }}
              title="Approval Check"
              body={
                <ComparisonTable
                  modalContent={modalContent}
                  loadingModal={loadingModal}
                />
              }
            />

            {/* Edit Prize Modal */}
            <Modal
              show={showEditModal}
              onHide={() => setShowEditModal(false)}
              size="lg"
              centered
            >
              <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>Edit Prizes for {currentMarket?.marketName}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {currentMarket && editablePrizes[currentMarket.marketName] && (
                  <Accordion defaultActiveKey="0">
                    {Object.entries(prizeData).map(
                      ([key, { rank, description }]) => {
                        const prizeInfo = editablePrizes[currentMarket.marketName][key];
                        if (!prizeInfo) return null;
                        
                        return (
                          <Accordion.Item eventKey={key} key={key}>
                            <Accordion.Header style={{
                              backgroundColor: prizeInfo.isMatched ? '#d4edda' : '#f8d7da'
                            }}>
                              {rank} Prize - {description}
                            </Accordion.Header>
                            <Accordion.Body>
                              {/* For the 1st Prize, include ticket number input */}
                              {["1"].includes(key) && (
                                <div>
                                  <Form.Label
                                    style={{ color: "#555", fontSize: "0.9rem" }}
                                  >
                                    Enter Ticket Number:
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={prizeInfo.ticketNumbers[0] || ""}
                                    onChange={(e) =>
                                      handleTicketChange(
                                        key,
                                        0,
                                        e.target.value,
                                        prizeData[key].rank
                                      )
                                    }
                                    placeholder="Enter ticket number"
                                    style={{
                                      borderRadius: "8px",
                                      fontSize: "0.95rem",
                                      marginBottom: "15px",
                                    }}
                                  />
                                  {errors[key]?.ticketNumber0 && (
                                    <div>
                                      <small className="text-danger">
                                        {errors[key].ticketNumber0}
                                      </small>
                                    </div>
                                  )}
                                  <Form.Label
                                    style={{ color: "#555", fontSize: "0.9rem" }}
                                  >
                                    Enter Complementary Amount:
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={prizeInfo.complementaryAmount || ""}
                                    onChange={(e) =>
                                      handleComplementaryChange(
                                        key,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter complementary amount"
                                    style={{
                                      borderRadius: "8px",
                                      fontSize: "0.95rem",
                                      marginBottom: "15px",
                                    }}
                                  />
                                  {errors[key]?.complementaryAmount && (
                                    <small className="text-danger">
                                      {errors[key].complementaryAmount}
                                    </small>
                                  )}
                                </div>
                              )}

                              {/* Prize Amount Input */}
                              <Form.Label
                                style={{ color: "#555", fontSize: "0.9rem" }}
                              >
                                Enter Prize Amount:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={prizeInfo.amount || ""}
                                onChange={(e) =>
                                  handlePrizeChange(
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter amount"
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.95rem",
                                  marginBottom: "15px",
                                }}
                              />
                              {errors[key]?.amount && (
                                <small className="text-danger">
                                  {errors[key].amount}
                                </small>
                              )}
                              {/* Ticket Numbers Input for other prizes */}
                              {!["1"].includes(key) && (
                                <div>
                                  <Form.Label
                                    style={{ color: "#555", fontSize: "0.9rem" }}
                                  >
                                    Enter Ticket Numbers (
                                    {prizeData[key].description}):
                                  </Form.Label>
                                  <div className="d-flex flex-wrap gap-2 mt-1">
                                    {(prizeInfo.ticketNumbers || []).map((ticket, idx) => (
                                      <Form.Group
                                        key={idx}
                                        style={{ width: "calc(20% - 10px)" }}
                                      >
                                        <Form.Control
                                          type="text"
                                          value={ticket}
                                          onChange={(e) =>
                                            handleTicketChange(
                                              key,
                                              idx,
                                              e.target.value,
                                              prizeData[key].rank
                                            )
                                          }
                                          placeholder={`Ticket ${idx + 1}`}
                                        />
                                        {errors[key]?.[`ticketNumber${idx}`] && (
                                          <small className="text-danger">
                                            {errors[key][`ticketNumber${idx}`]}
                                          </small>
                                        )}
                                      </Form.Group>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      }
                    )}
                  </Accordion>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>

            {subAdminResult?.length > 0 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                handlePageChange={handlePageChange}
                startIndex={startIndex}
                endIndex={endIndex}
                totalData={pagination.totalItems}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WinResult;