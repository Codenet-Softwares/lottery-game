import React, { useEffect, useState } from "react";
import { ViewAllSubAdmins } from "../../Utils/apiService";
import ReusableTable from "../Reusables/ReusableTable";
import ReusableModal from "../Reusables/ReusableModal";
import ResetPassword from "../ResetPassword/ResetPassword";
import ReusableMiniModal from "../Reusables/ReusableMiniModal";
import ResetPasswordSubAdmin from "../ResetPasswordSubAdmin/ResetPasswordSubAdmin";
import { toast } from "react-toastify";

const ViewAllSubadmin = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMiniModal, setShowMiniModal] = useState(false);
  const [error, setError] = useState(null);

  console.log("selectedUser", selectedUser);

  useEffect(() => {
    const fetchSubAdmins = async () => {
      const response = await ViewAllSubAdmins();
      if (response.success) {
        setSubAdmins(response.data);
      } else {
        setError("Failed to fetch sub-admins");
      }
    };
    fetchSubAdmins();
  }, []);

  const handleAction = (userName) => {
    if (!userName) {
      toast.error("Invalid user selection");
      return;
    }
    setSelectedUser(userName);
    setShowModal(true);
  };

  const columns = [
    { key: "userName", label: "Sub-Admin Names" },
    { key: "role", label: "Role" },
    { key: "permissions", label: "Permissions" },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <button
          className="btn btn-primary btn-sm mx-2"
          onClick={() => handleAction(row.userName)}
          title="Reset Password"
        >
          <i className="fas fa-key"></i>
        </button>
      ),
    },
  ];

  return (
    <>
      <div>
        <ReusableModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
          }}
          title="Reset Sub-Admin Password"
          body={
            <ResetPasswordSubAdmin
              userName={selectedUser}
              onClose={() => {
                setShowModal(false);
              }}
            />
          }
        />
      </div>
      {/* Sub-Admin Delete Modal Start*/}
      {/* <div>
        <ReusableMiniModal
          show={showMiniModal}
          handleClose={() => {
            console.log("Closing Modal...");
            setShowMiniModal(false);
          }}
          title="Reset Sub-Admin Password"
        />
      </div> */}
      {/* Sub-Admin Delete Modal End*/}

      <div
        className="p-4 rounded-4 text-center shadow-lg m-5 border"
        style={{   background: "linear-gradient(135deg, #f0f9ff, #cce7f6)",
         }}
      >
        <ReusableTable
          data={subAdmins}
          columns={columns}
          itemsPerPage={5}
          tableHeading="SUB ADMIN LIST"
          showSearch={true}
          paginationVisible={true}
          handleAction={handleAction}
        />
      </div>
    </>
  );
};

export default ViewAllSubadmin;
