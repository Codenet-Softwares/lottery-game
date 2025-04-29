import React, { useState, useEffect } from "react";
import {
  subAdminWinResult,
  ViewSubAdminsTickets,
} from "../../Utils/apiService";
import Pagination from "../Common/Pagination";
import ReusableModal from "../Reusables/ReusableModal";
import ComparisonTable from "../PrizeAppproval/ComparisonTable";
const WinResult = () => {
  const [loading, setLoading] = useState(true);
  const [subAdminResult, setSubAdminResult] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedMarketTicket, setSelectedMarketTicket] = useState(null);

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
        status: statusFilter, // Add status filter here
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

  return (
    <div className="container d-flex justify-content-center mt-4">
      <div
        className="col-md-10 p-4 rounded shadow"
        style={{  background: "linear-gradient(135deg, #f0f9ff, #cce7f6)"
        }}
      >
        <h2 className="text-center mb-3 fw-bold fw-bold text-uppercase" style={{color:"#284B63"}}>
          SubAdmin History
        </h2>

        {/* Search Bar */}
        <div className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by market name"
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
                        <td className="text-center align-top">{item.status}</td>
                        <td className="text-start align-top text-wrap">
                          {item.remarks ||
                            "Your submission is not yet approved."}
                        </td>

                        <td>
                          <button
                            className={`btn fw-bold ${
                              item.status === "Pending"
                                ? "btn-danger opacity-50"
                                : "btn-primary"
                            }`}
                            onClick={() =>
                              fetchSubAdminTicketData(
                                item.marketId,
                                item.status
                              )
                            }
                            disabled={item.status === "Pending"}
                          >
                            Show Prize
                          </button>
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
