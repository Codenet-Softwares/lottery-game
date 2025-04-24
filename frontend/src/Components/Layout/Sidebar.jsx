import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../contextApi/context";
import { toast } from "react-toastify";
import "./Sidebar.css";

const Sidebar = () => {
  const { dispatch, store } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      dispatch({ type: "LOG_OUT" });
      toast.success("Logged out successfully!");
      navigate("/");
    } else {
      toast.info("Logout cancelled.");
    }
  };

  const navItems = [
    { to: "/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard", permission: "" },
    { to: "/lottery-markets", icon: "fas fa-ticket-alt", label: "Create Lottery", permission: "" },
    { to: "/Market-overview", icon: "fas fa-chart-line", label: "Market Overview", permission: "" },
    { to: "/results", icon: "fas fa-trophy", label: "Results", permission: "" },
    { to: "/win", icon: "fas fa-money-bill-wave", label: "Win", permission: "win-Lottery-Result" },
    { to: "/purchase-history", icon: "fas fa-history", label: "Purchase History", permission: "" },
    { to: "/search-lotto", icon: "fas fa-search", label: "Search Lottery", permission: "" },
    { to: "/get-void-market", icon: "fas fa-file-excel", label: "Void", permission: "" },
    { to: "/inactive", icon: "fas fa-ban", label: "Revoke", permission: "" },
    { to: "/live-markets", icon: "fas fa-broadcast-tower", label: "Live Markets", permission: "" },
    { to: "/trash", icon: "fas fa-trash-alt", label: "Trash", permission: "" },
    { to: "/prize-validation", icon: "fas fa-clipboard-check", label: "Prize Approval", permission: "" },
    { to: "/bet-tracker", icon: "fas fa-balance-scale", label: "Win Tracker", permission: "" },
    { to: "/create-subadmin", icon: "fas fa-user-shield", label: "Create Sub-Admin", permission: "" },
    { to: "/view-all-subadmin", icon: "fas fa-users-cog", label: "Sub-Admins", permission: "" },
    { to: "/subAdminData", icon: "fas fa-database", label: "SubAdmin Data", permission: "win-Analytics" },
    { to: "/subAdmin-win-result", icon: "fas fa-trophy", label: "SubAdmin Result", permission: "result-View" },
  ];

  const userRoles = store?.admin?.roles?.split(",").map(role => role.trim()) || [];
  const userPermissions = store?.admin?.permissions?.split(",").map(perm => perm.trim()) || [];

  const subAdminOnlyItems = ["Dashboard", "win-Lottery-Result", "win-Analytics", "result-View"];

  const filteredNavItems = navItems.filter(item => {
    if (item.label === "Dashboard") return true;
    if (subAdminOnlyItems.includes(item.permission)) return userRoles.includes("subAdmin");
    return userPermissions.length === 0 || userPermissions.includes(item.permission);
  });

  return (
    <div className="sidebar-container">
      <div className="sidebar-nav">
        {filteredNavItems.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to || location.pathname.startsWith(to) ? "active" : ""}`}
          >
            <i className={`${icon} sidebar-icon`}></i>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      {/* <div className="sidebar-logout" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt text-danger fs-4" title="Logout" />
        <span>Logout</span>
      </div> */}
    </div>
  );
};

export default Sidebar;
