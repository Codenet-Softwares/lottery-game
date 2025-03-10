import React, { useState, useEffect } from "react";
import { subAdminWinResult } from "../../Utils/apiService";
import Pagination from "../Common/Pagination";

const WinResult = () => {
  const [loading, setLoading] = useState(true);
  const [subAdminResult, setSubAdminResult] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Added status filter state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0,
  });

  const fetchSubAdminResult = async () => {
    try {
      setLoading(true);
      const response = await subAdminWinResult({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter, // Added status filter to API call
      });

      if (response?.success) {
        setSubAdminResult(response.data || []);
        setPagination((prev) => ({
          page: response.pagination?.page || prev.page,
          limit: response.pagination?.limit || prev.limit,
          totalPages: response.pagination?.totalPages || 0,
          totalItems: response.pagination?.totalItems || 0,
        }));
      } else {
        setSubAdminResult([]);
      }
    } catch (error) {
      console.error("Error fetching sub-admin result:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdminResult();
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]); // Added statusFilter dependency

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on status change
  };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );

  return (
    <div className="container d-flex justify-content-center mt-4">
      <div className="col-md-9 bg-light p-4 rounded shadow">
        <h2 className="text-center text-primary mb-3 fw-bold">Win Result</h2>

        {/* Search Bar & Dropdown in One Row */}
        <div className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by market name"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {/* Status Dropdown */}
          <select className="form-select" value={statusFilter} onChange={handleStatusChange}>
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
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {subAdminResult.length > 0 ? (
                    subAdminResult.map((item) => (
                      <tr key={item.marketId}>
                        <td>{item.marketName}</td>
                        <td>{item.status}</td>
                        <td>{item.remarks || "No Remark"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-danger">
                        No Data Available
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
