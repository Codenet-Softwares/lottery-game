import React from "react";
import Pagination from "../Common/Pagination";

const ReusableTable = ({
  data,
  columns,
  itemsPerPage,
  tableHeading,
  showSearch,
  paginationVisible,
  currentPage,
  totalData,
  onSearch,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalData / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalData);

  return (
    <div className="table-container-reusable">
      {tableHeading && <h2 className="table-heading fw-bold">{tableHeading}</h2>}

      {showSearch && (
        <input
          type="text"
          placeholder="Search..."
          className="form-control mb-3"
          onChange={(e) => onSearch(e.target.value)}
        />
      )}

      <table className="table table-bordered table-striped text-center table-hover">
        <thead className="table-dark">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="text-uppercase">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="text-uppercase">
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center fw-bold text-danger">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {paginationVisible  && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={onPageChange}
          startIndex={startIndex}
          endIndex={endIndex}
          totalData={totalData}
        />
      )}
    </div>
  );
};

export default ReusableTable;
