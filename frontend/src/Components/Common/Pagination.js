import React from "react";
import "./Pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  handlePageChange,
  startIndex,
  endIndex,
  totalData,
}) => {

  const renderPageNumbers = () => {
    const pageNumbers = [];

    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(currentPage + 1, totalPages);

    if (endPage - startPage < 2) {
      startPage = Math.max(endPage - 2, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "disabled" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };
  return (
    <div className="col-lg-12 ">
      <div className="white_box mb_30 shadow rounded-8px p-3 mt-2 ">
        <nav aria-label="Page navigation example">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-3 mb-md-0 entries-info">
              <span className="entries-highlight">Showing {startIndex}</span> to{" "}
              <span className="entries-highlight">{endIndex}</span> of{" "}
              <span className="entries-highlight">{totalData}</span> entries
            </p>
            <ul className="pagination pagination-custom mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link btn-gradient"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
              </li>
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link btn-gradient"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {renderPageNumbers()}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link btn-gradient"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link btn-gradient"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
