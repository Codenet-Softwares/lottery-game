import React from "react";
import "./comparisonTable.css";

const prizeOrder = [
  "First Prize",
  "Second Prize",
  "Third Prize",
  "Fourth Prize",
  "Fifth Prize",
];

const ComparisonTable = ({ modalContent }) => {
  const { matchedEnteries = [], UnmatchedEntries = [] } = modalContent;

    const isPendingStatus = modalContent && Array.isArray(modalContent.Tickets);
     if (isPendingStatus) {
    return (
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Prize Name</th>
              <th>Prize Amount</th>
              <th>Tickets</th>
              <th>Sub Prizes</th>
            </tr>
          </thead>
          <tbody>
            {modalContent.Tickets.sort(
              (a, b) => prizeOrder.indexOf(a.prizeName) - prizeOrder.indexOf(b.prizeName)
            ).map((prize, index) => (
              <tr key={`prize-${index}`}>
                <td className="fw-bold text-primary">{prize.prizeName}</td>
                <td>{prize.prizeAmount}</td>
                <td>
                  {prize.tickets && prize.tickets.length > 0 ? (
                    <select className="form-select">
                      {prize.tickets.map((ticket, i) => (
                        <option key={i} value={ticket}>
                          {ticket}
                        </option>
                      ))}
                    </select>
                  ) : (
                    "No tickets"
                  )}
                </td>
                <td>
                  {prize.subPrizes && prize.subPrizes.length > 0 ? (
                    prize.subPrizes.map((subPrize, subIndex) => (
                      <div key={subIndex} className="mb-2">
                        <div className="fw-bold text-success">
                          {subPrize.prizeName}: {subPrize.prizeAmount}
                        </div>
                      </div>
                    ))
                  ) : (
                    "No sub prizes"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Sorting prizes based on the predefined order
  const sortedPrizeNames = [
    ...new Set(
      [...matchedEnteries, ...UnmatchedEntries].map((e) => e.prizeName)
    ),
  ].sort((a, b) => prizeOrder.indexOf(a) - prizeOrder.indexOf(b));

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Prize Name</th>
            <th>Type</th>
            <th>Declared Prizes</th>
            <th>Unmatched Tickets</th>
            <th>Matched Tickets</th>
          </tr>
        </thead>
        <tbody>
          {sortedPrizeNames.map((prizeName, index) => {
            const matchedEntry = matchedEnteries.find(
              (e) => e.prizeName === prizeName
            );
            const unmatchedEntries = UnmatchedEntries.filter(
              (e) => e.prizeName === prizeName
            );

            const totalRows = (matchedEntry ? 1 : 0) + unmatchedEntries.length;

            return (
              <React.Fragment key={`prize-${index}`}>
                {matchedEntry && (
                  <tr>
                    <td
                      rowSpan={totalRows}
                      className="fw-bold text-primary align-middle"
                    >
                      {matchedEntry.prizeName}
                    </td>
                    <td className="fw-bold text-success">Matched</td>
                    <td>
                      {Object.entries(matchedEntry.DeclaredPrizes ?? {}).map(
                        ([declarer, amount]) => (
                          <div key={declarer}>
                            {declarer}: {amount}
                          </div>
                        )
                      )}
                    </td>
                    <td>Not Available</td>
                    <td>
                      {matchedEntry.MatchedTickets?.length > 0 ||
                      matchedEntry.Tickets?.length > 0 ? (
                        <select className="form-select">
                          {(
                            matchedEntry.MatchedTickets || matchedEntry.Tickets
                          ).map((ticket, i) => (
                            <option key={i} value={ticket}>
                              {ticket}
                            </option>
                          ))}
                        </select>
                      ) : (
                        "Not Available"
                      )}
                    </td>
                  </tr>
                )}

                {unmatchedEntries.map((unmatched, uIndex) => (
                  <tr key={`unmatched-${uIndex}`}>
                    {!matchedEntry && uIndex === 0 && (
                      <td
                        rowSpan={totalRows}
                        className="fw-bold text-primary align-middle"
                      >
                        {unmatched.prizeName}
                      </td>
                    )}
                    <td className="fw-bold text-danger align-middle ">
                      Unmatched
                    </td>
                    <td>
                      {unmatched.DeclaredPrizes
                        ? Object.entries(unmatched.DeclaredPrizes ?? {}).map(
                            ([declarer, amount]) => (
                              <div key={declarer}>
                                {declarer}: {amount}
                              </div>
                            )
                          )
                        : "Not Available"}
                    </td>
                    <td>
                      {unmatched.Tickets.map((ticket, i) => (
                        <div key={i} className="mb-2">
                          <div className="fw-bold text-dark">
                            {ticket.declaredBy}
                          </div>
                          <select className="form-select">
                            {ticket.ticketNumber.map((num, j) => (
                              <option key={j} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </td>
                    <td>Not Available</td>
                  </tr>
                ))}

                {/* Display SubPrizes for Matched Entries */}
                {matchedEntry?.SubPrizes?.map((subPrize, subIndex) => (
                  <tr
                    key={`matched-sub-${subIndex}`}
                    className="bg-success text-white"
                  >
                    <td className="fw-bold text-success">
                      ↳ {subPrize.prizeName}
                    </td>
                    <td className="text-success">Matched</td>
                    <td>
                      {Object.entries(subPrize.DeclaredPrizes ?? {}).map(
                        ([declarer, amount]) => (
                          <div key={declarer}>
                            {declarer}: {amount}
                          </div>
                        )
                      )}
                    </td>
                    <td colSpan="2">Not Available</td>
                  </tr>
                ))}

                {/* Display SubPrizes for Unmatched Entries */}
                {unmatchedEntries.flatMap((unmatched) =>
                  unmatched.SubPrizes?.map((subPrize, subIndex) => (
                    <tr
                      key={`unmatched-sub-${subIndex}`}
                      className="bg-danger text-white"
                    >
                      <td className="fw-bold  text-danger">
                        ↳ {subPrize.prizeName}
                      </td>
                      <td className="text-danger">Unmatched</td>
                      <td>
                        {Object.entries(subPrize.DeclaredPrizes ?? {}).map(
                          ([declarer, amount]) => (
                            <div key={declarer}>
                              {declarer}: {amount}
                            </div>
                          )
                        )}
                      </td>
                      <td colSpan="2">Not Available</td>
                    </tr>
                  ))
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
