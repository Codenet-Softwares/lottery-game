import React from "react";
import "./ReusablePermissionBox.css";

export const ReusablePermissionBox = ({ permissions, onChange, error, permissionsList = [] }) => {
  const togglePermission = (permission) => {
    if (permissions.includes(permission)) {
      onChange(permissions.filter((p) => p !== permission));
    } else {
      onChange([...permissions, permission]);
    }
  };

  return (
    <div className="permission-box-container p-3">
      <label className="permission-label text-center text-uppercase">Select Permissions:</label>
      <div className="permission-grid">
        {permissionsList.length > 0 ? (
          permissionsList.map((perm) => (
            <div key={perm} className="permission-item">
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
              />
              <span className="text-uppercase">{perm}</span>
            </div>
          ))
        ) : (
          <p className="no-permissions">No permissions available</p>
        )}
      </div>
    <h6 className="fw-bold text-center">{error && <div className="error-message">{error}</div>}</h6>  
    </div>
    
  );
};
