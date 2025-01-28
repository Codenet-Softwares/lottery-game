const handleShowTickets = (details) => {
  const ticketsBody = details.map((detail) => (
    <div key={detail.sem} className="mb-4 ticket-section">
      <div>
        <div className="ticket-header d-flex justify-content-between align-items-center">
          <h6 className="text-primary fw-bold mb-0">
            SEM: {detail.sem} | Amount: ₹{detail.lotteryPrice}
          </h6>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteTicket(detail.purchaseId)}
          >
            <i className="bi bi-trash"></i> Delete
          </button>
        </div>
        <div className="ticket-scroll-container">
          <ul className="list-group">
            {detail.tickets.slice(0, 10).map((ticket, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{ticket}</span>
              </li>
            ))}
          </ul>
          {detail.tickets.length > 10 && (
            <button className="btn btn-link btn-sm load-more-btn">
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  ));

  setModalContent({
    title: "Purchased Tickets",
    body: (
      <div className="modal-body-container">
        {ticketsBody}
      </div>
    ),
  });
  setModalShow(true);
};
