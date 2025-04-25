import React from "react";
import Footer from "./Footer";
import Layout from "./Layout";
import NavTop from "./NavTop";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";
import TopNavbar from "./TopNavbar";

const AdminLayout = () => {
  return (
    <div className="admin-layout-container">
      <div className="sidebar-fixed">
        <Sidebar />
      </div>

      <div className="main-content-area">
        <div className="top-navbar-fixed">
          <TopNavbar />
        </div>

        <div className="layout-scrollable">
          <Layout />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
