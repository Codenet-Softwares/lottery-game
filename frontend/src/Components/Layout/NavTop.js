import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../contextApi/context";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./NavTop.css";

const NavTop = () => {
  const { store, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const menuItems = document.querySelectorAll(".nav-link");
      const centerIndex = Math.floor(menuItems.length / 2);
      menuItems.forEach((item, index) => {
        if (index === centerIndex) {
          item.classList.add("center-active");
        } else {
          item.classList.remove("center-active");
        }
      });
    };
    menuRef.current.addEventListener("scroll", handleScroll);
    return () => menuRef.current?.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollMenu = (direction) => {
    if (menuRef.current) {
      menuRef.current.scrollBy({
        left: direction === "right" ? 100 : -100,
        behavior: "smooth",
      });

      const isAtStart = menuRef.current.scrollLeft === 0;
      const isAtEnd =
        Math.ceil(menuRef.current.scrollLeft + menuRef.current.offsetWidth) >=
        menuRef.current.scrollWidth;

      document.querySelector(".left-arrow").style.display = isAtStart
        ? "none"
        : "block";

      document.querySelector(".right-arrow").style.display = isAtEnd
        ? "none"
        : "block";
    }
  };

  useEffect(() => {
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");

    if (leftArrow && rightArrow) {
      if (location.pathname === "/dashboard") {
        leftArrow.style.display = "none";
      } else if (location.pathname === "/reset-password") {
        rightArrow.style.display = "none";
      } else {
        leftArrow.style.display = "block";
        rightArrow.style.display = "block";
      }
    }
  }, [location]);

  const navItems = [
    { to: "/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { to: "/lottery-markets", icon: "fas fa-ticket-alt", label: "Create Lottery" },
    { to: "/Market-overview", icon: "fas fa-chart-line", label: "Market Overview" },
    { to: "/results", icon: "fas fa-trophy", label: "Results" },
    { to: "/win", icon: "fas fa-money-bill-wave", label: "Win" },
    { to: "/purchase-history", icon: "fas fa-history", label: "Purchase History" },
    { to: "/search-lottery", icon: "fas fa-search", label: "Search Lottery" },
    { to: "/get-void-market", icon: "fas fa-file-excel", label: "Void" },
    { to: "/inactive", icon: "fas fa-ban", label: "Revoke" },
    { to: "/live-markets", icon: "fas fa-broadcast-tower", label: "Live Markets" },
    { to: "/trash", icon: "fas fa-trash-alt", label: "Trash" },
    { to: "/reset-password", icon: "fas fa-key", label: "Reset Password" },
  ];

  return (
    <div className="container-fluid g-4 navtop-container">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="nav-wrapper justify-content-center align-items-center">
          <button
            className="scroll-arrow left-arrow"
            onClick={() => scrollMenu("left")}
          >
            &lt;
          </button>
          <div ref={menuRef} className="nav-options">
            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link mt-2 ${
                  location.pathname === to|| location.pathname.startsWith(to)  ? "active-link" : ""
                }`}
              >
                <i className={`nav-icon ${icon}`} />
                <span className="text-info text-nowrap">{label}</span>
              </Link>
            ))}
          </div>
          <button
            className="scroll-arrow right-arrow"
            onClick={() => scrollMenu("right")}
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="profile_info">
        <i
          className="fas fa-sign-out-alt"
          onClick={handleLogout}
          title="logout"
        />
      </div>
    </div>
  );
};

export default NavTop;



