import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import { useAppContext } from "../../contextApi/context";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "react-horizontal-scrolling-menu/dist/styles.css";
import "simplebar-react/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";
import { toast } from "react-toastify";
import "./NavTop.css";

const NavTop = () => {
  const { dispatch, store } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ start: true, end: false });

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

  // Navigation items with permissions
  const navItems = [
    {
      to: "/dashboard",
      icon: "fas fa-tachometer-alt",
      label: "Dashboard",
      permission: "",
    },
    {
      to: "/lottery-markets",
      icon: "fas fa-ticket-alt",
      label: "Create Lottery",
      permission: "",
    },
    {
      to: "/Market-overview",
      icon: "fas fa-chart-line",
      label: "Market Overview",
      permission: "",
    },
    { to: "/results", icon: "fas fa-trophy", label: "Results", permission: "" },
    {
      to: "/win",
      icon: "fas fa-money-bill-wave",
      label: "Win",
      permission: "win-Lottery-Result",
    },
    {
      to: "/purchase-history",
      icon: "fas fa-history",
      label: "Purchase History",
      permission: "",
    },
    {
      to: "/search-lottery",
      icon: "fas fa-search",
      label: "Search Lottery",
      permission: "",
    },
    {
      to: "/get-void-market",
      icon: "fas fa-file-excel",
      label: "Void",
      permission: "",
    },
    { to: "/inactive", icon: "fas fa-ban", label: "Revoke", permission: "" },
    {
      to: "/live-markets",
      icon: "fas fa-broadcast-tower",
      label: "Live Markets",
      permission: "",
    },
    { to: "/trash", icon: "fas fa-trash-alt", label: "Trash", permission: "" },
    {
      to: "/reset-password",
      icon: "fas fa-key",
      label: "Reset Password",
      permission: "",
    },
    {
      to: "/create-subadmin",
      icon: "fas fa-user-shield",
      label: "Create Sub-Admin",
      permission: "",
    },
    {
      to: "/prize-validation",
      icon: "fas fa-clipboard-check",
      label: "Prize Approval",
      permission: "",
    },
    {
      to: "/bet-tracker",
      icon: "fas fa-balance-scale",
      label: "Win Tracker",
      permission: "",
    },
    {
      to: "/view-all-subadmin",
      icon: "fas fa-users-cog",
      label: "Sub-Admins",
      permission: "",
    },
    {
      to: "/subAdminData",
      icon: "fas fa-database",
      label: "SubAdmin Data",
      permission: "win-Analytics",
    },
    {
      to: "/subAdmin-win-result",
      icon: "fas fa-trophy",
      label: "SubAdmin Result",
      permission: "result-View",
    },
  ];

  // Get roles and permissions as arrays
  const userRoles = store?.admin?.roles
    ? store.admin.roles.split(",").map((role) => role.trim())
    : [];
  const userPermissions = store?.admin?.permissions
    ? store.admin.permissions.split(",").map((perm) => perm.trim())
    : [];

  // Define items that should only be visible to sub-admins
  const subAdminOnlyItems = [
    "win-Lottery-Result",
    "win-Analytics",
    "result-View",
  ];

  // Filter navigation items based on permissions and roles
  const filteredNavItems = navItems.filter((item) => {
    if (subAdminOnlyItems.includes(item.permission)) {
      return userRoles.includes("subAdmin");
    }
    return (
      userPermissions.length === 0 || userPermissions.includes(item.permission)
    );
  });

  // Handle scroll update
  const handleUpdate = ({ getItemById }) => {
    setScrollState({
      start: getItemById(navItems[0]?.to)?.visible ?? true,
      end: getItemById(navItems[navItems.length - 1]?.to)?.visible ?? false,
    });
  };

  return (
    <SimpleBar className="navtop-container-Y">
      <div className="d-flex gap-5 justify-content-center align-items-center position-relative navtop-wrapper">
        {/* Left Scroll Button */}
        <button
          className={`btn-light ${
            scrollState.start ? "disabled-arrow" : "enabled-arrow"
          }`}
          onClick={() => scrollRef.current?.scrollPrev()}
          disabled={scrollState.start}
        >
          <FaChevronLeft />
        </button>

        {/* Scroll Menu */}
        <div className="overflow-hidden navtop-scroll-container">
          <ScrollMenu
            apiRef={scrollRef}
            onUpdate={handleUpdate}
            wrapperClassName="custom-scroll-wrapper"
            scrollContainerClassName="custom-scroll-container d-flex align-items-center gap-5"
          >
            {filteredNavItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`btn mx-5 text-white ${
                  location.pathname === to || location.pathname.startsWith(to)
                    ? "btn-dark text-white"
                    : "btn-outline-dark"
                }`}
              >
                <i className={`${icon} me-2`}></i>
                {label}
              </Link>
            ))}
          </ScrollMenu>
        </div>

        {/* Right Scroll Button */}
        <button
          className={`btn-light ${
            scrollState.end ? "disabled-arrow" : "enabled-arrow"
          }`}
          onClick={() => scrollRef.current?.scrollNext()}
          disabled={scrollState.end}
        >
          <FaChevronRight />
        </button>

        {/* Logout Button */}
        <i
          className="fas fa-sign-out-alt text-danger fs-2 logout-icon"
          onClick={handleLogout}
          title="Logout"
        />
      </div>
    </SimpleBar>
  );
};

export default NavTop;
