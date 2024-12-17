import React from 'react';
import Footer from './Footer';
import Layout from './Layout';
import NavTop from './NavTop';


const AdminLayout = () => {
  return (
    <div className="d-flex flex-column vh-100">
      {/* Sticky Top Navigation */}
      <div
        className="sticky-top" 
        style={{
          zIndex: 1030,
          backgroundColor: '#fff', 
          boxShadow: '0px 1px 5px rgba(0,0,0,0.1)', 
        }}
      >
        <NavTop />
      </div>

      {/* Main Content Area */}

      <div
        className="flex-grow-1 overflow-auto"
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="p-4" style={{ flex: 1, minHeight: 0 }}>

          <Layout />
        </div>
      </div>

      {/* Sticky Footer */}
      <div
        className="sticky-bottom mt-auto"
        style={{
          backgroundColor: '#f8f9fa',
          boxShadow: '0px -1px 5px rgba(0,0,0,0.1)',
          padding: '20px',
        }}
      >
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
