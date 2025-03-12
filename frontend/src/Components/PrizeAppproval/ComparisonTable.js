import React from "react";
import './comparisonTable.css';

const prizeOrder = ["First Prize", "Second Prize", "Third Prize", "Fourth Prize", "Fifth Prize"];

const ComparisonTable = ({ modalContent }) => {
  if (!modalContent || !modalContent.prizes) {
    return <p className="text-danger">No prize data available</p>;
  }

  const hasPrizes = modalContent.prizes.length > 0;

  const sortPrizes = (prizes) => {
    return [...prizes].sort((a, b) => prizeOrder.indexOf(a.prizeName) - prizeOrder.indexOf(b.prizeName));
  };

  return (
    <div className="comparison-table">
      {/* Prize Entries */}
      <h5 className="fw-bold text-success">Prize Details</h5>
      {hasPrizes ? (
        <div className="table-responsive">
          <table className="table table-bordered text-uppercase fs-6">
            <thead>
              <tr>
                <th>Prize Category</th>
                <th>Declared By 1</th>
                <th>Declared By 2</th>
                <th>Ticket Numbers</th>
                <th>Prize Amount</th>
                <th>Complimentary</th>
              </tr>
            </thead>
            <tbody>
              {sortPrizes(modalContent.prizes).map((prize, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td rowSpan={prize.SubPrizes ? prize.SubPrizes.length + 1 : 1} className="align-middle">
                      {prize.prizeName}
                    </td>
                    <td>{modalContent.declarers?.[0] || "-"}</td>
                    <td>{modalContent.declarers?.[1] || "-"}</td>
                    <td>
                      <select className="form-select small-dropdown">
                        {prize.MatchedTickets?.map((ticket, idx) => (
                          <option key={idx}>{ticket}</option>
                        )) || "-"}
                      </select>
                    </td>
                    <td>
                      ₹{prize.DeclaredPrizes?.[modalContent.declarers?.[0]] ?? "-"} /
                      ₹{prize.DeclaredPrizes?.[modalContent.declarers?.[1]] ?? "-"}
                    </td>
                    <td>-</td>
                  </tr>
                  {prize.SubPrizes?.map((subPrize, subIndex) => (
                    <tr key={`sub-${index}-${subIndex}`}>
                      <td colSpan={4}>{subPrize.prizeName}</td>
                      <td>
                        ₹{subPrize.DeclaredPrizes?.[modalContent.declarers?.[0]] ?? "-"} /
                        ₹{subPrize.DeclaredPrizes?.[modalContent.declarers?.[1]] ?? "-"}
                      </td>
                      <td>-</td>
                    </tr>
                  )) || null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-danger">No prize data available</p>
      )}
    </div>
  );
};

export default ComparisonTable;
