import React from "react";

const ComparisonTable = ({ modalContent, loadingModal }) => {
  if (loadingModal) {
    return <p>Loading...</p>;
  }

  const hasMatchedData = modalContent?.Matched?.length > 0;
  const hasUnmatchedData = modalContent?.Unmatched?.length > 0;

  return (
    <div className="comparison-table">
      {/* Matched Entries */}
      <h5 className="fw-bold text-success">Matched Entries</h5>
      {hasMatchedData ? (
        modalContent.Matched.map((market, index) => (
          <div key={index} className="mb-3 border p-2 rounded">
            <h6 className="fw-bold">{market.marketName}</h6>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Declared By 1</th>
                  <th>Declared By 2</th>
                  <th>Prize Category</th>
                  <th>Ticket Numbers</th>
                  <th>Prize Amount</th>
                </tr>
              </thead>
              <tbody>
                {market.MatchData.length > 1 ? (
                  Object.keys(market.MatchData[0].ticketNumber).map((category, j) => {
                    const entry1 = market.MatchData[0];
                    const entry2 = market.MatchData[1] || {};
                    return (
                      <tr key={j}>
                        {j === 0 && (
                          <>
                            <td rowSpan={Object.keys(market.MatchData[0].ticketNumber).length} className="align-middle">
                              {entry1.declearBy}
                            </td>
                            <td rowSpan={Object.keys(market.MatchData[0].ticketNumber).length} className="align-middle">
                              {entry2.declearBy || "-"}
                            </td>
                          </>
                        )}
                        <td>{category}</td>
                        <td>{entry1.ticketNumber[category]?.tickets.join(", ") || "-"}</td>
                        <td>₹{entry1.ticketNumber[category]?.prizeAmount || "-"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td>{market.MatchData[0]?.declearBy}</td>
                    <td>-</td>
                    <td colSpan="3" className="text-center">No additional data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="text-danger">No matched data available</p>
      )}

      {/* Unmatched Entries */}
      <h5 className="fw-bold text-danger mt-4">Unmatched Entries</h5>
      {hasUnmatchedData ? (
        modalContent.Unmatched.map((market, index) => (
          <div key={index} className="mb-3 border p-2 rounded">
            <h6 className="fw-bold">{market.marketName}</h6>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Declared By</th>
                  <th>Prize Category</th>
                  <th>Ticket Numbers</th>
                  <th>Prize Amount</th>
                </tr>
              </thead>
              <tbody>
                {market.MatchData.map((entry, i) =>
                  Object.entries(entry.ticketNumber).map(([category, details], j) => (
                    <tr key={`${i}-${j}`}>
                      {j === 0 && (
                        <td rowSpan={Object.keys(entry.ticketNumber).length} className="align-middle">
                          {entry.declearBy}
                        </td>
                      )}
                      <td>{category}</td>
                      <td>{details.tickets.join(", ")}</td>
                      <td>₹{details.prizeAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="text-danger">No unmatched data available</p>
      )}
    </div>
  );
};

export default ComparisonTable;