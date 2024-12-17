import React, { useState, useEffect } from "react";
import { useAppContext } from "../../contextApi/context";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./navTop.css";

const NavTop = () => {
  const { store, dispatch } = useAppContext();
  const [activeLink, setActiveLink] = useState(
    store.activeLink || "/dashboard"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update active link when location changes
    setActiveLink(location.pathname);
  }, [location]);

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

  const handleClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="container-fluid g-0 navtop-container">
      <div className="row">
        <div className="col-lg-12 p-0">
          <div className="nav-wrapper d-flex justify-content-between align-items-center">
            <div className="nav-options d-flex justify-content-center">
              <Link
                to="/dashboard"
                className={`nav-link dashboard ${
                  activeLink === "/dashboard" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/dashboard")}
              >
                <i className="fas fa-tachometer-alt nav-icon" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/lottery-markets"
                className={`nav-link create-lottery ${
                  activeLink === "/lottery-markets" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/lottery-markets")}
              >
                <i className="fas fa-ticket-alt nav-icon" />
                <span>Create Lottery</span>
              </Link>
              {/* New LuckyHour link */}
              <Link
                to="/Market-overview"
                className={`nav-link market-overview ${
                  activeLink === "/Market-overview" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/Market-overview")}
              >
                <i className="fas fa-chart-line nav-icon" />
                <span>Market Overview</span>
              </Link>

              {/* <Link
                to="/lucky-hour"
                className={`nav-link lucky-hour ${
                  activeLink === "/lucky-hour" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/lucky-hour")}
              >
                <i className="fas fa-clock nav-icon" />
                <span>Lucky Hour</span>
              </Link> */}

              <Link
                to="/results"
                className={`nav-link results ${
                  activeLink.startsWith("/results") ? "active-link" : ""
                }`}
                onClick={() => handleClick("/results")}
              >
                <i className="fas fa-trophy nav-icon" />
                <span>Results</span>
              </Link>

              <Link
                to="/win"
                className={`nav-link win ${
                  activeLink === "/win" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/win")}
              >
                <i className="fas fa-money-bill-wave nav-icon" />
                <span>Win</span>
              </Link>

              <Link
                to="/purchase-history"
                className={`nav-link purchase-history ${
                  activeLink.startsWith("/purchase-history")
                    ? "active-link"
                    : ""
                }`}
                onClick={() => handleClick("/purchase-history")}
              >
                <i className="fas fa-history nav-icon" />
                <span>Purchase History</span>
              </Link>

              <Link
                to="/search-lottery"
                className={`nav-link search-lottery ${
                  activeLink === "/search-lottery" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/search-lottery")}
              >
                <i className="fas fa-search nav-icon" />
                <span>Search Lottery</span>
              </Link>

              <Link
                to="/get-void-market"
                className={`nav-link void-icon ${
                  activeLink === "/get-void-market" ? "active-link" : ""
                }`}
                onClick={() => handleClick("/get-void-market")}
              >
              <i class="fas fa-minus-circle nav-icon"></i>
                <span>Void</span>
              </Link>
              <Link
                to="/inactive"
                className={`nav-link active-icon ${
                  activeLink === "" ? "active-link" : ""
                }`}
                onClick={() => handleClick("")}
              >
             <i class="fas fa-check-circle nav-icon"></i>
                <span>InActive</span>
              </Link>
            </div>

            <div className="profile_info d-flex align-items-center mx-4">
              <i
                className="fas fa-user-circle"
                style={{ fontSize: "30px", color: "#4682B4" }}
                aria-hidden="true"
              />
              <div className="profile_info_iner">
                <div className="profile_author_name">
                  <p>Role: {store.admin.roles}</p>
                  <h5>{store.admin.userName}</h5>
                </div>
                <div className="profile_info_details">
                  <a href="#" onClick={handleLogout}>
                    Log Out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavTop;
