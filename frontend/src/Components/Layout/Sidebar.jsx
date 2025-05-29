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
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setActiveItem(location.pathname);

    const matchingDropdown = dropdownItems.find((dropdown) =>
      dropdown.items.some((item) => location.pathname.startsWith(item.to))
    );

    if (matchingDropdown) {
      setOpenDropdown(matchingDropdown.label);
    } else {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: "fas fa-tachometer-alt",
      label: "Dashboard",
      permission: "",
    },
    {
      to: "/win",
      icon: "fas fa-money-bill-wave",
      label: "Win Request",
      permission: "win-Lottery-Result",
    },
  ];

  const dropdownItems = [
    {
      label: "Lottery Overview",
      icon: "fas fa-layer-group",
      items: [
        { to: "/lottery-markets", label: "Create Lottery", permission: "" },
        { to: "/Market-overview", label: "Market Overview", permission: "" },
        { to: "/live-markets", label: "Live Markets", permission: "" },
        { to: "/search-lotto", label: "Search Lottery", permission: "" },
      ],
    },
    {
      label: "Action",
      icon: "fas fa-cogs",
      items: [
        { to: "/get-void-market", label: "Void", permission: "" },
        { to: "/inactive", label: "Revoke", permission: "" },
        {
          to: "/bet-tracker",
          icon: "fas fa-balance-scale",
          label: "Win Tracker",
          permission: "",
        },
      ],
    },
    {
      label: "Result",
      icon: "fas fa-trophy",
      items: [
        { to: "/results", label: "Results", permission: "" },
        { to: "/prize-validation", label: "Prize Approval", permission: "" },
      ],
    },
    {
      label: "Subadmin Tools",
      icon: "fas fa-user-cog",
      items: [
        { to: "/create-subadmin", label: "Create Sub-Admin", permission: "" },
        { to: "/view-all-subadmin", label: "Sub-Admins", permission: "" },
        {
          to: "/subAdminData",
          label: "SubAdmin Data",
          permission: "win-Analytics",
        },
        {
          to: "/subAdmin-win-result",
          label: "SubAdmin Result",
          permission: "result-View",
        },
      ],
    },
  ];
  const singleNavLink = [
    {
      to: "/purchase-history",
      icon: "fas fa-history",
      label: "Purchase History",
      permission: "",
    },
    { to: "/trash", icon: "fas fa-trash-alt", label: "Trash", permission: "" },
  ];
  const userRoles =
    store?.admin?.roles?.split(",").map((role) => role.trim()) || [];
  const userPermissions =
    store?.admin?.permissions?.split(",").map((perm) => perm.trim()) || [];
  const subAdminOnlyItems = [
    "Dashboard",
    "win-Lottery-Result",
    "win-Analytics",
    "result-View",
  ];

  const hasPermission = (item) => {
    if (item.label === "Dashboard") return true;
    if (subAdminOnlyItems.includes(item.permission))
      return userRoles.includes("subAdmin");
    return (
      userPermissions.length === 0 || userPermissions.includes(item.permission)
    );
  };

  return (
    <div className="sidebar-container ">
      <div className="sidebar_role">
        <h3 className="fw-bold text-uppercase text-white text-center ">
          <Link
            to={"/dashboard"}
            className="admin_text text-decoration-none text-white "
          >
            {store.admin.roles}
          </Link>
        </h3>
      </div>

      <div className="sidebar-nav px-4 mt-4">
        {navItems.filter(hasPermission).map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link  ${
              location.pathname === to || location.pathname.startsWith(to)
                ? "active"
                : ""
            }`}
          >
            <i className={`${icon} sidebar-icon`}></i>
            <span>{label}</span>
          </Link>
        ))}

        {dropdownItems.map(({ label, icon, items }) => {
          const filteredItems = items.filter(hasPermission);
          if (filteredItems.length === 0) return null;

          return (
            <div key={label} className="sidebar-dropdown">
              <div
                className="sidebar-link dropdown-toggle"
                onClick={() => toggleDropdown(label)}
              >
                <i className={`${icon} sidebar-icon`}></i>
                <span>{label}</span>
                <i className={`dropdown-arrow`} />
              </div>
              {openDropdown === label && (
                <div className="dropdown-items">
                  {filteredItems.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`sidebar-link sub-item ${
                        location.pathname === to ? "active" : ""
                      }`}
                    >
                      <h6>{label}</h6>
                    </Link>
                  ))}
                </div>
              )}
              {/* Insert Purchase History below Lottery Overview */}
              {label === "Lottery Overview" &&
                hasPermission(singleNavLink[0]) && (
                  <Link
                    to={singleNavLink[0].to}
                    className={`sidebar-link ${
                      location.pathname === singleNavLink[0].to ? "active" : ""
                    }`}
                  >
                    <i className={`${singleNavLink[0].icon} sidebar-icon`}></i>
                    <span>{singleNavLink[0].label}</span>
                  </Link>
                )}

              {/* Insert Trash below Subadmin Tools */}
              {label === "Subadmin Tools" &&
                hasPermission(singleNavLink[1]) && (
                  <Link
                    to={singleNavLink[1].to}
                    className={`sidebar-link ${
                      location.pathname === singleNavLink[1].to ? "active" : ""
                    }`}
                  >
                    <i className={`${singleNavLink[1].icon} sidebar-icon`}></i>
                    <span>{singleNavLink[1].label}</span>
                  </Link>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
