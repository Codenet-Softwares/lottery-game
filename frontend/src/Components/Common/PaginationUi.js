import React from "react";
import "./PaginationUi.css";

const PaginationUi = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <button
        className={`tv-button ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
         Prev
      </button>
      <div className="entries-info">
        Showing {startEntry} to {endEntry} of {totalItems} entries
      </div>
      <button
        className={`tv-button ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next 
      </button>
    </div>
  );
};

export default PaginationUi;
