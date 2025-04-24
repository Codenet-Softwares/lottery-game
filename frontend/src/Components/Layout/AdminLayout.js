import React from "react";
import Footer from "./Footer";
import Layout from "./Layout";
import NavTop from "./NavTop";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";
import TopNavbar from "./TopNavbar";

const AdminLayout = () => {
  return (
    <div className="container-fluid vh-100 d-flex flex-column p-0">
      {/* Main row: Sidebar + Right section */}
      <div className="row flex-grow-1 m-0">
        {/* Sidebar */}
        <div className="col-2 p-0 bg-dark">
          <Sidebar />
        </div>

        {/* Main content: NavTop + Layout */}
        <div className="col-10 p-0 d-flex flex-column">
          {/* Top Navigation Bar */}
          <div className="navtop-wrapper">
            {/* <NavTop /> */}
            <TopNavbar/>
          </div>

          {/* Main Layout Content */}
          <div className="flex-grow-1 overflow-auto">
            <Layout />
          </div>
        </div>
      </div>

      {/* Optional Footer */}
      {/* 
      <div className="sticky-bottom mt-auto">
        <Footer />
      </div> 
      */}
    </div>
  );
};

export default AdminLayout;
