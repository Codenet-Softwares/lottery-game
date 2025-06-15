import React, { useState, useEffect } from "react";
import {
  editLotteryTicketsWin,
  subAdminWinResult,
  ViewSubAdminsTickets,
} from "../../Utils/apiService";
import Pagination from "../Common/Pagination";
import ReusableModal from "../Reusables/ReusableModal";
import ComparisonTable from "../PrizeAppproval/ComparisonTable";
import { FaEdit } from "react-icons/fa";
import { Accordion, Button, Form } from "react-bootstrap";
const WinResult = () => {
  const [loading, setLoading] = useState(true);
  const [subAdminResult, setSubAdminResult] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [editableTickets, setEditableTickets] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  console.log("editableTickets", editableTickets);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const handleShowDetails = () => {
    setTimeout(() => {
      setShowModal(true);
    }, 100);
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
      console.log(
        "Fetching ticket data for Market ID:",
        marketId,
        "Status:",
        status
      );

      const response = await ViewSubAdminsTickets({ status }, marketId);
      console.log("Comparison Data Response:", response);

      if (response?.success) {
        setModalContent(response.data || []);
        setShowModal(true);
      } else {
        setModalContent([]);
        console.warn("No data found for this Market ID and Status.");
      }
    } catch (error) {
      console.error("Error fetching sub-admin ticket data:", error);
    }
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

  const fetchTicketsForEdit = async (marketId, marketName) => {
    try {
      setLoadingModal(true);
      const response = await ViewSubAdminsTickets(
        { status: "Reject" },
        marketId
      );

      if (response?.success) {
        // Initialize the editable tickets with proper structure
        const tickets = {
          matchedEnteries: response.data?.matchedEnteries || [],
          UnmatchedEntries: response.data?.UnmatchedEntries || [],
        };
        setEditableTickets(tickets);
        setSelectedMarket({ marketId, marketName });
        setShowEditModal(true);
      } else {
        setEditableTickets({
          matchedEnteries: [],
          UnmatchedEntries: [],
        });
      }
    } catch (error) {
      console.error("Error fetching tickets for edit:", error);
      setEditableTickets({
        matchedEnteries: [],
        UnmatchedEntries: [],
      });
    } finally {
      setLoadingModal(false);
    }
  };

  const handleTicketChange = (type, prizeIndex, ticketIndex, value) => {
    setEditableTickets((prev) => {
      const newTickets = { ...prev };

      if (type === "matched") {
        // For matched tickets (array of strings)
        newTickets.matchedEnteries[prizeIndex].Tickets[ticketIndex] = value;
      } else {
        // For unmatched tickets (array of objects)
        newTickets.UnmatchedEntries[prizeIndex].Tickets[
          ticketIndex
        ].ticketNumber[0] = value;
      }

      return newTickets;
    });
  };

  const handlePrizeAmountChange = (type, prizeIndex, value) => {
    setEditableTickets((prev) => {
      const newTickets = { ...prev };

      if (type === "matched") {
        // Update prize amount for matched entries
        const prizeName = newTickets.matchedEnteries[prizeIndex].prizeName;
        newTickets.matchedEnteries[prizeIndex].DeclaredPrizes = {
          [prizeName]: value,
        };
      } else {
        // Update prize amount for unmatched entries
        newTickets.UnmatchedEntries[prizeIndex].Tickets[0].amount = value;
      }

      return newTickets;
    });
  };

  const handleComplementaryChange = (prizeIndex, value) => {
    setEditableTickets((prev) => {
      const newTickets = { ...prev };

      // Find the first prize in matched entries
      const firstPrizeIndex = newTickets.matchedEnteries.findIndex(
        (item) => item.prizeName === "First Prize"
      );

      if (firstPrizeIndex !== -1) {
        newTickets.matchedEnteries[firstPrizeIndex].complementaryAmount = value;
      }

      return newTickets;
    });
  };

const handleSaveChanges = async () => {
  try {
    if (!selectedMarket?.marketId) {
      throw new Error("No market selected");
    }

    // Prepare the updatedData array in the required format
    const updatedData = [];

    // Process matched entries
    editableTickets.matchedEnteries?.forEach((prizeGroup) => {
      const prizeItem = {
        prizeCategory: prizeGroup.prizeName,
        prizeAmount: Number(Object.values(prizeGroup.DeclaredPrizes)[0]) || 0,
        ticketNumber: prizeGroup.Tickets || [],
      };

      // Add complementary prize for First Prize
      if (prizeGroup.prizeName === "First Prize" && prizeGroup.complementaryAmount) {
        prizeItem.complementaryPrize = Number(prizeGroup.complementaryAmount) || 0;
      }

      updatedData.push(prizeItem);
    });

    // Process unmatched entries
    editableTickets.UnmatchedEntries?.forEach((prizeGroup) => {
      const tickets = prizeGroup.Tickets?.map(ticket => ticket.ticketNumber?.[0]).filter(Boolean);
      
      if (tickets && tickets.length > 0) {
        updatedData.push({
          prizeCategory: prizeGroup.prizeName,
          prizeAmount: Number(prizeGroup.Tickets?.[0]?.amount) || 0,
          ticketNumber: tickets,
        });
      }
    });

    // Prepare the request body
    const requestBody = {
      marketId: selectedMarket.marketId,
      updatedData: updatedData
    };

    console.log("Saving changes with data:", requestBody);

    // Call the API
    const response = await editLotteryTicketsWin(requestBody, true);

    if (response?.success) {
      alert("Changes saved successfully!");
      fetchSubAdminResult(); // Refresh the data
      setShowEditModal(false);
    } else {
      throw new Error(response?.message || "Failed to save changes");
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    alert(`Error saving changes: ${error.message}`);
  }
};

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
                            className={`badge rounded-pill px-3 py-2 fw-semibold ${
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
                              className="badge rounded-pill px-3 py-2 bg-primary text-white"
                              onClick={() =>
                                fetchTicketsForEdit(
                                  item.marketId,
                                  item.marketName
                                )
                              }
                              title="Edit Tickets"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </td>

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

                        {/* Edit Tickets Modal */}
                        <ReusableModal
                          show={showEditModal}
                          handleClose={() => {
                            setShowEditModal(false);
                          }}
                          title={`Edit Prizes for ${
                            selectedMarket?.marketName || ""
                          }`}
                          size="xl"
                          footerButtons={[
                            {
                              text: "Cancel",
                              className: "btn btn-secondary me-2",
                              onClick: () => setShowEditModal(false),
                            },
                            {
                              text: "Save Changes",
                              className: "btn btn-primary",
                              onClick: handleSaveChanges,
                            },
                          ]}
                          body={
                            loadingModal ? (
                              <p className="text-center text-muted">
                                Loading tickets...
                              </p>
                            ) : editableTickets ? (
                              <div className="ticket-edit-container">
                                <Accordion defaultActiveKey="0">
                                  {/* Matched Tickets */}
                                  {editableTickets.matchedEnteries?.map(
                                    (prizeGroup, prizeIndex) => (
                                      <Accordion.Item
                                        key={`matched-${prizeIndex}`}
                                        eventKey={`matched-${prizeIndex}`}
                                      >
                                        <Accordion.Header
                                          style={{ backgroundColor: "#d4edda" }}
                                        >
                                          {prizeGroup.prizeName}
                                        </Accordion.Header>
                                        <Accordion.Body>
                                          {/* Prize Amount */}
                                          <Form.Label
                                            style={{
                                              color: "#555",
                                              fontSize: "0.9rem",
                                            }}
                                          >
                                            Prize Amount:
                                          </Form.Label>
                                          <Form.Control
                                            type="text"
                                            value={
                                              Object.values(
                                                prizeGroup.DeclaredPrizes
                                              )[0] || ""
                                            }
                                            onChange={(e) =>
                                              handlePrizeAmountChange(
                                                "matched",
                                                prizeIndex,
                                                e.target.value
                                              )
                                            }
                                            style={{
                                              borderRadius: "8px",
                                              fontSize: "0.95rem",
                                              marginBottom: "15px",
                                              borderColor: "#28a745",
                                            }}
                                          />

                                          {/* Ticket Numbers */}
                                          <Form.Label
                                            style={{
                                              color: "#555",
                                              fontSize: "0.9rem",
                                            }}
                                          >
                                            Ticket Numbers:
                                          </Form.Label>
                                          <div className="d-flex flex-wrap gap-2 mt-1">
                                            {prizeGroup.Tickets?.map(
                                              (ticketNumber, ticketIndex) => (
                                                <Form.Group
                                                  key={`matched-ticket-${ticketIndex}`}
                                                  style={{
                                                    width: "calc(20% - 10px)",
                                                  }}
                                                >
                                                  <Form.Control
                                                    type="text"
                                                    value={ticketNumber}
                                                    onChange={(e) =>
                                                      handleTicketChange(
                                                        "matched",
                                                        prizeIndex,
                                                        ticketIndex,
                                                        e.target.value
                                                      )
                                                    }
                                                    style={{
                                                      borderColor: "#28a745",
                                                      backgroundColor:
                                                        "transparent",
                                                    }}
                                                  />
                                                </Form.Group>
                                              )
                                            )}
                                          </div>

                                          {/* Complementary Amount for First Prize */}
                                          {prizeGroup.prizeName ===
                                            "First Prize" && (
                                            <>
                                              <Form.Label
                                                style={{
                                                  color: "#555",
                                                  fontSize: "0.9rem",
                                                }}
                                              >
                                                Complementary Amount:
                                              </Form.Label>
                                              <Form.Control
                                                type="text"
                                                value={
                                                  prizeGroup.complementaryAmount ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  handleComplementaryChange(
                                                    prizeIndex,
                                                    e.target.value
                                                  )
                                                }
                                                style={{
                                                  borderRadius: "8px",
                                                  fontSize: "0.95rem",
                                                  marginBottom: "15px",
                                                  borderColor: "#28a745",
                                                }}
                                              />
                                            </>
                                          )}
                                        </Accordion.Body>
                                      </Accordion.Item>
                                    )
                                  )}

                                  {/* Unmatched Tickets */}
                                  {editableTickets.UnmatchedEntries?.map(
                                    (prizeGroup, prizeIndex) => (
                                      <Accordion.Item
                                        key={`unmatched-${prizeIndex}`}
                                        eventKey={`unmatched-${prizeIndex}`}
                                      >
                                        <Accordion.Header
                                          style={{ backgroundColor: "#f8d7da" }}
                                        >
                                          {prizeGroup.prizeName}
                                          <span className="ms-2 badge bg-danger">
                                            Unmatched
                                          </span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                          {/* Prize Amount */}
                                          <Form.Label
                                            style={{
                                              color: "#555",
                                              fontSize: "0.9rem",
                                            }}
                                          >
                                            Prize Amount:
                                          </Form.Label>
                                          <Form.Control
                                            type="text"
                                            value={
                                              prizeGroup.Tickets?.[0]?.amount ||
                                              ""
                                            }
                                            onChange={(e) =>
                                              handlePrizeAmountChange(
                                                "unmatched",
                                                prizeIndex,
                                                e.target.value
                                              )
                                            }
                                            style={{
                                              borderRadius: "8px",
                                              fontSize: "0.95rem",
                                              marginBottom: "15px",
                                              borderColor: "#dc3545",
                                              backgroundColor: "#fff0f0",
                                            }}
                                          />

                                          {/* Ticket Numbers */}
                                          <Form.Label
                                            style={{
                                              color: "#555",
                                              fontSize: "0.9rem",
                                            }}
                                          >
                                            Ticket Numbers:
                                          </Form.Label>
                                          <div className="d-flex flex-wrap gap-2 mt-1">
                                            {prizeGroup.Tickets?.map(
                                              (ticket, ticketIndex) => (
                                                <Form.Group
                                                  key={`unmatched-ticket-${ticketIndex}`}
                                                  style={{
                                                    width: "calc(20% - 10px)",
                                                  }}
                                                >
                                                  <Form.Control
                                                    type="text"
                                                    value={
                                                      ticket
                                                        .ticketNumber?.[0] || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleTicketChange(
                                                        "unmatched",
                                                        prizeIndex,
                                                        ticketIndex,
                                                        e.target.value
                                                      )
                                                    }
                                                    style={{
                                                      borderColor: "#dc3545",
                                                      backgroundColor:
                                                        "#fff0f0",
                                                    }}
                                                  />
                                                  <small className="text-danger d-block">
                                                    Unmatched
                                                  </small>
                                                </Form.Group>
                                              )
                                            )}
                                          </div>
                                        </Accordion.Body>
                                      </Accordion.Item>
                                    )
                                  )}
                                </Accordion>

                                {!editableTickets.matchedEnteries?.length &&
                                  !editableTickets.UnmatchedEntries?.length && (
                                    <p className="text-center text-muted">
                                      No tickets found for this market
                                    </p>
                                  )}
                              </div>
                            ) : (
                              <p className="text-center text-muted">
                                No tickets data available
                              </p>
                            )
                          }
                        />
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
