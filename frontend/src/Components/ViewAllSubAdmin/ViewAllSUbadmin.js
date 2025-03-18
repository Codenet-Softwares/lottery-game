import React, { useEffect, useState } from "react";
import { ViewAllSubAdmins } from "../../Utils/apiService";
import ReusableTable from "../Reusables/ReusableTable";
import ReusableModal from "../Reusables/ReusableModal";
import ResetPassword from "../ResetPassword/ResetPassword";
import ReusableMiniModal from "../Reusables/ReusableMiniModal";
import ResetPasswordSubAdmin from "../ResetPasswordSubAdmin/ResetPasswordSubAdmin";

const ViewAllSubadmin = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMiniModal, setShowMiniModal] = useState(false);
  const [error, setError] = useState(null);

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

  const columns = [
    { key: "userName", label: "subAdmin names" },
    { key: "role", label: "Role" },
    { key: "permissions", label: "Permissions" },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div>
          <button
            className="btn btn-primary btn-sm mx-2"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-key"></i>
          </button>
          {/* <button
            className="btn btn-danger btn-sm mx-2"
            onClick={() => setShowMiniModal(true)}
          >
            <i className="fas fa-trash-alt"></i>
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <ReusableModal
          show={showModal}
          handleClose={() => {
            console.log("Closing Modal...");
            setShowModal(false);
          }}
          title="Reset Sub-Admin Password"
          body={<ResetPasswordSubAdmin />}
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

      <div>
        <ReusableTable
          data={subAdmins}
          columns={columns}
          itemsPerPage={5}
          tableHeading="Sub Admin List"
          showSearch={true}
          paginationVisible={true}
        />
      </div>
    </>
  );
};

export default ViewAllSubadmin;
