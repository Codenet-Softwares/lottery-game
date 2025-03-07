import React from "react";

const ComparisonTable = ({ modalContent, loadingModal }) => {
  if (loadingModal) {
    return <p>Loading...</p>;
  }

  if (!modalContent || (!modalContent.Matched?.length && !modalContent.Unmatched?.length)) {
    return <p>No data available</p>;
  }

  return (
    <div className="comparison-table">
      {modalContent.Matched?.length > 0 && (
        <>
          <h5 className="text-success fw-bold">Matched Entries</h5>
          {modalContent.Matched.map((market, index) => (
            <div key={index} className="mb-3 border p-2 rounded">
              <h6 className="fw-bold">{market.marketName}</h6>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Declared By</th>
                    <th>Prize Category</th>
                    <th>Ticket Numbers</th>
                  </tr>
                </thead>
                <tbody>
                  {market.MatchData.map((entry, i) =>
                    Object.entries(entry.ticketNumber).map(([category, numbers], j) => (
                      <tr key={`${i}-${j}`}>
                        {j === 0 && (
                          <td rowSpan={Object.keys(entry.ticketNumber).length} className="align-middle">
                            {entry.declearBy}
                          </td>
                        )}
                        <td>{category}</td>
                        <td>{numbers.join(", ")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      {modalContent.Unmatched?.length > 0 && (
        <>
          <h5 className="text-danger fw-bold mt-4">Unmatched Entries</h5>
          {modalContent.Unmatched.map((market, index) => (
            <div key={index} className="mb-3 border p-2 rounded">
              <h6 className="fw-bold">{market.marketName}</h6>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Declared By</th>
                    <th>Prize Category</th>
                    <th>Ticket Numbers</th>
                  </tr>
                </thead>
                <tbody>
                  {market.MatchData.map((entry, i) =>
                    Object.entries(entry.ticketNumber).map(([category, numbers], j) => (
                      <tr key={`${i}-${j}`}>
                        {j === 0 && (
                          <td rowSpan={Object.keys(entry.ticketNumber).length} className="align-middle">
                            {entry.declearBy}
                          </td>
                        )}
                        <td>{category}</td>
                        <td>{numbers.join(", ")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ComparisonTable;
