import React, { useEffect } from "react";

const ViewTicketsModal = ({ isOpen, onClose, ticketNumbers }) => {


  return (
    <div className={`modal fade ${isOpen ? "show d-block" : ""}`} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Purchased Tickets</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                {ticketNumbers.map((ticket, index) => (
                  <div key={index} className="col-4 p-2">
                    <div className="border rounded p-2 text-center">{ticket}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTicketsModal;
