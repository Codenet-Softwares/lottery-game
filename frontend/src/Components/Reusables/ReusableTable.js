import React, { useState } from "react";
import Pagination from "../Common/Pagination";

// import "./ReusableTable.css";

const ReusableTable = ({ data, columns, itemsPerPage, tableHeading , showSearch, paginationVisible}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    columns.some((column) =>
      item[column.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(startIndex - 1, endIndex);

  return (
    <div className="table-container-reusable">
      {/* Table Heading */}
      {tableHeading && <h2 className="table-heading ">{tableHeading}</h2>}
      
      {/* Search Input (conditionally rendered) */}
      {showSearch && (
        <input
          type="text"
          placeholder="Search..."
          className="form-control mb-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}


      {/* Table */}
      <table className="table table-bordered table-striped text-center table-hover">
        <thead className="table-dark">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="text-uppercase">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody >
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="text-uppercase">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {paginationVisible &&totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalData={filteredData.length}
        />
      )}
    </div>
  );
};

export default ReusableTable;