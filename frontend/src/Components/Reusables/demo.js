import React, { useState } from "react";
import Pagination from "../Common/Pagination";

const ReusableTable = ({ data, columns, itemsPerPage, tableHeading }) => {
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="container">
      {/* Table Heading */}
      {tableHeading && <h2 className="mb-3">{tableHeading}</h2>}
      
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        className="form-control mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table Wrapper */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center table-hover" style={{ tableLayout: "fixed" }}>
          <thead className="table-dark">
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
        </table>

        {/* Scrollable Table Body */}
        <div className="d-block overflow-auto w-100" style={{ maxHeight: "300px" }}>
          <table className="table table-bordered table-striped text-center table-hover w-100">
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key}>
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
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage}
          startIndex={startIndex + 1}
          endIndex={endIndex}
          totalData={filteredData.length}
        />
      )}
    </div>
  );
};

export default ReusableTable;
