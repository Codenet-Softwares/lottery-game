import React, { useEffect, useState } from 'react';
import { DeleteLiveBets, GetMarketStats } from '../../Utils/apiService';
import ReusableModal from '../Reusables/ReusableModal';

const LiveMarketStats = ({ marketId }) => {
  const [stats, setStats] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  useEffect(() => {
    const fetchMarketStats = async () => {
      const response = await GetMarketStats({ marketId });
      if (response.success) {
        setStats(response.data);
      } else {
        console.error("Failed to fetch market stats:", response.message);
      }
    };

    if (marketId) {
      fetchMarketStats();
    }
  }, [marketId]);

  const handleShowTickets = (details) => {

    const ticketsBody = details.map((detail) => (
      <div key={detail.sem} className="mb-4">
        <h6 className="text-primary fw-bold">SEM: {detail.sem} | Amount: ₹{detail.lotteryPrice}</h6>
        <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteTicket(detail.purchaseId)}
          >
            <i className="bi bi-trash"></i> Delete
          </button>
        <ul className="list-group">
          {detail.tickets.map((ticket, idx) => (
            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{ticket}</span>
              {/* <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteTicket(detail.purchaseId)}
              >
                <i className="bi bi-trash"></i> Delete
              </button> */}
            </li>
          ))}
        </ul>
      </div>
    ));

    setModalContent({
      title: 'Purchased Tickets',
      body: <div>{ticketsBody}</div>,
    });
    setModalShow(true);
  };


// const handleShowTickets = (details) => {
//     const ticketsBody = details.map((detail) => (
//       <div key={detail.sem} className="mb-4 d-flex justify-content-between align-items-center">
//         <div>
//           <h6 className="text-primary fw-bold">SEM: {detail.sem} | Amount: ₹{detail.lotteryPrice}</h6>
//         </div>
//         <div>
//           <button
//             className="btn btn-danger btn-sm"
//             onClick={() => handleDeleteTicket(detail.purchaseId)}
//           >
//             <i className="bi bi-trash"></i> Delete
//           </button>
//         </div>
//         <li className="list-group-item d-flex justify-content-between align-items-center">
//           {detail.tickets.map((ticket, idx) => (
//             <li key={idx} className="list-group-item">{ticket}</li>
//           ))}
//         </li>
//       </div>
//     ));

//     setModalContent({
//       title: 'Purchased Tickets',
//       body: <div>{ticketsBody}</div>,
//     });
//     setModalShow(true);
//   };

  const handleDeleteTicket = async (purchaseId) => {
    // Confirm the deletion action
    const confirmDeletion = window.confirm('Are you sure you want to delete this live bet? This action is irreversible.');
    if (confirmDeletion) {
      try {
        // Call the API to delete the specific live bet
        const response = await DeleteLiveBets({ purchaseId}, false);
        if (response.success) {
          alert('Live bet deleted successfully!');
          // Update stats by removing the deleted ticket from the list
          setStats((prevStats) =>
            prevStats.map((user) => ({
              ...user,
              details: user.details.map((detail) => ({
                ...detail,
                tickets: detail.tickets.filter((ticket) => ticket.purchaseId !== purchaseId),
              })),
            }))
          );
        } else {
          alert('Failed to delete live bet. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting live bet:', error);
        alert('An error occurred while deleting live bet.');
      }
    }
  };

  return (
    <div className="container py-4">
      {stats ? (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-primary fw-bold">Market Stats for {stats[0]?.marketName}</h3>
          </div>

          <marquee className="bg-light text-dark py-2 rounded shadow-sm mb-3" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
            {stats
              .flatMap((user) =>
                user.details.flatMap((detail) =>
                  detail.tickets.map((ticket) => `${user.userName}: ${ticket}`)
                )
              )
              .join(' | ')}
          </marquee>

          <table className="table table-striped table-bordered table-hover shadow">
            <thead className="bg-primary text-white">
              <tr>
                <th>Username</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((user, idx) => (
                <tr key={idx}>
                  <td className="fw-bold text-secondary">{user.userName}</td>
                  <td className="fw-bold text-success">₹{user.amount}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      onClick={() => handleShowTickets(user.details)}
                    >
                      <i className="bi bi-ticket-detailed"></i> Show Tickets
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ReusableModal
            show={modalShow}
            handleClose={() => setModalShow(false)}
            title={modalContent.title}
            body={modalContent.body}
          />
        </div>
      ) : (
        <p className="text-center text-muted">Loading stats...</p>
      )}
    </div>
  );
};

export default LiveMarketStats;
