import React from "react";
import './comparisonTable.css'

const ComparisonTable = ({ modalContent }) => {



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
            <table className="table table-bordered text-uppercase fs-6">
              <thead>
                <tr>
                  <th>Declared By 1</th>
                  <th>Declared By 2</th>
                  <th>Prize Category</th>
                  <th>Ticket Numbers</th>
                  <th>Prize Amount</th>
                  <th>complimentary</th>
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
                        <td>
                          <select className="form-select small-dropdown ">
                            {entry1.ticketNumber[category]?.tickets.map((ticket, idx) => (
                              <option key={idx}>{ticket}</option>
                            ))}
                          </select>
                        </td>
                        <td>₹{entry1.ticketNumber[category]?.prizeAmount || "-"}</td>
                        <td>₹{entry1.ticketNumber[category]?.complementaryPrize || "NA"}</td>
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
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Market</th>
                <th>Declared By</th>
                <th>Prize Category</th>
                <th>Ticket Numbers</th>
                <th>Prize Amount</th>
                <th>complimentary</th>
              </tr>
            </thead>
            <tbody>
              {modalContent.Unmatched.map((market, index) =>
                market.MatchData.map((entry, i) =>
                  Object.entries(entry.ticketNumber).map(([category, details], j) => (
                    <tr key={`${index}-${i}-${j}`}>
                      {i === 0 && j === 0 && (
                        <td rowSpan={Object.keys(market.MatchData[0].ticketNumber).length * market.MatchData.length} className="align-middle">
                          {market.marketName}
                        </td>
                      )}
                      {j === 0 && (
                        <td rowSpan={Object.keys(entry.ticketNumber).length} className="align-middle">
                          {entry.declearBy}
                        </td>
                      )}
                      <td>{category}</td>
                      <td>
                        <select className="form-select small-dropdown">
                          {details.tickets.map((ticket, idx) => (
                            <option key={idx}>{ticket}</option>
                          ))}
                        </select>
                      </td>
                      <td>₹{details.prizeAmount}</td>
                      <td>₹{details?.complementaryPrize || "NA"}</td>
                      {console.log("complementaryPrize", details?.complementaryPrize || "NA")}
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-danger">No unmatched data available</p>
      )}
    </div>
  );
};

export default ComparisonTable;
