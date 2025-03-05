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
  const { dispatch } = useAppContext();
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

  const navItems = [
    { to: "/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    {
      to: "/lottery-markets",
      icon: "fas fa-ticket-alt",
      label: "Create Lottery",
    },
    {
      to: "/Market-overview",
      icon: "fas fa-chart-line",
      label: "Market Overview",
    },
    { to: "/results", icon: "fas fa-trophy", label: "Results" },
    { to: "/win", icon: "fas fa-money-bill-wave", label: "Win" },
    {
      to: "/purchase-history",
      icon: "fas fa-history",
      label: "Purchase History",
    },
    { to: "/search-lottery", icon: "fas fa-search", label: "Search Lottery" },
    { to: "/get-void-market", icon: "fas fa-file-excel", label: "Void" },
    { to: "/inactive", icon: "fas fa-ban", label: "Revoke" },
    {
      to: "/live-markets",
      icon: "fas fa-broadcast-tower",
      label: "Live Markets",
    },
    { to: "/trash", icon: "fas fa-trash-alt", label: "Trash" },
    { to: "/reset-password", icon: "fas fa-key", label: "Reset Password" },
    { to: "/settle-unsettle", icon: "fas fa-balance-scale", label: "Settlement" },

  ];

  const handleUpdate = ({ getItemById }) => {
    setScrollState({
      start: getItemById(navItems[0]?.to)?.visible ?? true,
      end: getItemById(navItems[navItems.length - 1]?.to)?.visible ?? false,
    });
  };
  return (
    <SimpleBar className="navtop-container">
      <div className="d-flex gap-5 justify-content-center align-items-center position-relative navtop-wrapper">
        {/* Left Arrow */}
        <button
          className={` btn-light ${
            scrollState.start ? "disabled-arrow" : "enabled-arrow"
          } `}
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
            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`btn mx-5 text-white  ${
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

        {/* Right Arrow */}
        <button
          className={`btn-light ${
            scrollState.end ? "disabled-arrow" : "enabled-arrow"
          }`}
          onClick={() => scrollRef.current?.scrollNext()}
          disabled={scrollState.end}
        >
          <FaChevronRight />
        </button>

        {/* Logout Icon */}
        <i
          className="fas fa-sign-out-alt text-danger fs-2 logout-icon "
          onClick={handleLogout}
          title="Logout"
        />
      </div>
    </SimpleBar>
  );
};

export default NavTop;
