import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import { toast } from "react-toastify";
import Pagination from "../Common/Pagination";
import { useAppContext } from "../../contextApi/context";
import { getIsActiveLottery, isRevokeLottery } from "../../Utils/apiService";
import SingleCard from "../Common/SingleCard";

const Inactive = () => {
  const { store, showLoader, hideLoader } = useAppContext();
  const [inactiveGames, setInactiveGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [totalData, setTotalData] = useState("");
  const [refresh, setRefresh] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchInactiveGames();
  }, [refresh, currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchInactiveGames = async () => {
    try {
      const res = await getIsActiveLottery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
      });
      const gamesData = res?.data || [];

      setInactiveGames(gamesData);
      setTotalData(res?.pagination?.totalItems);
      setTotalPages(res?.pagination?.totalPages);
    } catch (err) {
      console.error("Error fetching inactive games:", err);
    }
  };

  const handleSearchMarketChange = (e) => {
    setSearchTerm(e.target.value); // Update the market list search term
  };

  const handleRevokeAnnouncement = async (marketId) => {
    try {
      showLoader(); // Show the loader before the API call starts
      const res = await isRevokeLottery({ marketId: marketId });
      if (res) {
        toast.success(res.message);
        setRefresh((prev) => !prev);
      }
    } catch (err) {
      console.error("Error fetching inactive games:", err);
    } finally {
      hideLoader(); // Hide the loader after the API call finishes
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  let startIndex = Math.min(
    (Number(currentPage) - 1) * Number(itemsPerPage) + 1
  );
  let endIndex = Math.min(
    Number(currentPage) * Number(itemsPerPage),
    Number(totalData)
  );

  return (
    <div className="container my-5">
      <div className="card shadow-sm">
        <div
          className="card-header d-flex align-items-center justify-content-between p-3"
          style={{ backgroundColor: "#0E1A35", color: "#FFFFFF" }}
        >
          <h3 className="mb-0 fw-bold fs-5">ANNOUNCED GAME LIST</h3>
          <input
            type="text"
            className="search-bar-shrink-1"
            placeholder="Search Revoke marketnames..."
            value={searchTerm}
            onChange={handleSearchMarketChange}
            style={{
              width: "50%",
              padding: "10px 20px",
              borderRadius: "50px",
              border: "1px solid #4682B4",
              backgroundColor: "#f1f7ff",
              color: "#4682B4",
              fontSize: "16px",
              outline: "none",
              boxShadow: "none",
              transition: "all 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1e5c8a")}
            onBlur={(e) => (e.target.style.borderColor = "#4682B4")}
          />
        </div>
        <div className="card-body">
          {/* Table */}
          <SingleCard
            className=" mb-5 "
            style={{
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 1)",
            }}
          >
            <div className="table-responsive">
              <table
                className="table table-striped table-hover rounded-table"
                style={{
                  border: "2px solid #6c757d",
                  borderRadius: "10px",
                }}
              >
                <thead
                  className="table-primary"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <tr>
                    <th>Serial Number</th>
                    {/* <th>Game Name</th> */}
                    <th>Market Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveGames.length > 0 ? (
                    inactiveGames.map((game, index) => {
                      return (
                        <tr>
                          <td>{index + 1}</td>
                          {/* <td>{game.gameName}</td> */}
                          <td>{game.marketName}</td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleRevokeAnnouncement(game.marketId)
                              }
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No inactive games found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SingleCard>

          {/* Pagination */}
          {inactiveGames.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              startIndex={startIndex}
              endIndex={endIndex}
              totalData={totalData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inactive;
