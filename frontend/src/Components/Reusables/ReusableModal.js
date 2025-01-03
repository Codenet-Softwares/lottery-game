import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const ReusableModal = ({ show, handleClose, title, body }) => {
  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-lg" role="document">
      <div className="modal-content">
        <div className="modal-header border-0" style={{ position: 'relative' }}>
          <h5 className="modal-title w-100 text-center text-primary fw-bold" style={{ fontSize: '1.5rem' }}>{title}</h5>
          <button 
            type="button" 
            className="btn-close" 
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={handleClose} 
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '20px' }}>
          {body}
        </div>
      </div>
    </div>
  </div>
  );
};

export default ReusableModal;
