import React from 'react';

const SingleCard = ({ children, style, className }) => {
  const defaultStyle = {
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '1rem',
    backgroundColor: '#fff',
  };

  return (
    <div style={{ ...defaultStyle, ...style }} className={className}>
      {children}
    </div>
  );
};

export default SingleCard;
