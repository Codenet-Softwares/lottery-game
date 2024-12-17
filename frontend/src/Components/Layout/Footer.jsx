import React from 'react';
import './Footer.css'; // Custom CSS for Footer

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Company Name */}
        <div className="company-info">
          <h5 className="company-name">Codenet Softwares Pvt. Ltd.</h5>
        </div>

        {/* Copyright Text */}
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Codenet Softwares Pvt. Ltd. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
