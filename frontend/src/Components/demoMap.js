import React, { useState } from "react";
import ApprovalData from "../Components/DummyData/ApprovalData.json";
import "bootstrap/dist/css/bootstrap.min.css";
import ReusableModal from "./Reusables/ReusableModal";

const DemoMap = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  if (!ApprovalData) {
    return <div>No data available</div>;
  }

  const {
    marketName,
    matchedEntries = [],
    UnmatchedEntries = [],
  } = ApprovalData;
console.log('======>>> line 21',ApprovalData)
  return (
    <div className="container mt-4">
      <h2 className="text-primary">{marketName} - Prize Details</h2>
      <button className="btn btn-primary mb-3" onClick={handleOpenModal}>
        View All Prizes
      </button>

      {showModal && (
        <ReusableModal
          show={showModal}
          handleClose={handleCloseModal}
          title="All Prize Details"
          body={
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
                  {[
                    ...new Set(
                      [...matchedEntries, ...UnmatchedEntries].map(
                        (e) => e.prizeName
                      )
                    ),
                  ].map((prizeName, index) => {
                    const matchedEntry = matchedEntries.find(
                      (e) => e.prizeName === prizeName
                    );
                    const unmatchedEntries = UnmatchedEntries.filter(
                      (e) => e.prizeName === prizeName
                    );

                    const totalRows =
                      (matchedEntry ? 1 : 0) + unmatchedEntries.length;

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
                              {Object.entries(matchedEntry.DeclaredPrizes).map(
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
                                    matchedEntry.MatchedTickets ||
                                    matchedEntry.Tickets
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
                            <td>Not Available</td>
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
                              {Object.entries(subPrize.DeclaredPrizes).map(
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
                                {Object.entries(subPrize.DeclaredPrizes).map(
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
          }
        />
      )}
    </div>
  );
};

export default DemoMap;
