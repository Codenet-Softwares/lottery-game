import React from "react";

const ViewTicketsModal = ({ isOpen, onClose, ticketNumbers }) => {
  console.log('====>> line 3 modal',isOpen, onClose, ticketNumbers)
  return (
    <div
      className={`modal fade ${isOpen ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ backdropFilter: "blur(0.7px)" }} 
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content border-0 shadow-lg rounded">
          {/* Header */}
          <div className="modal-header bg-dark text-white d-flex justify-content-center position-relative">
            <div className="w-100 text-center">
              <h5 className="modal-title fw-bold"> Purchased Tickets</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white position-absolute end-0 me-3"
              onClick={onClose}
            ></button>
          </div>

          {/* Modal Body  */}
          <div className="modal-body p-4 bg-light">
            {ticketNumbers && ticketNumbers.length > 0 ? (
              <div className="container">
                <div
                  className="border rounded shadow-sm p-3 bg-white"
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#343a40 #e9ecef",
                  }}
                >
                  <div className="row row-cols-3 g-3">
                    {ticketNumbers.map((ticket, index) => (
                      <div key={index} className="col">
                        <div className="card border-1 shadow-sm text-center p-1">
                          <div className="card-body py-1 fw-bold text-dark">
                            {ticket}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning text-center">
                <h6 className="fw-bold">No tickets found!</h6>
                {/* <p className="mb-0">You haven’t purchased any tickets yet.</p> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTicketsModal;
