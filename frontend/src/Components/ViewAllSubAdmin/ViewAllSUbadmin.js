import React, { useEffect, useState } from "react";
import { ViewAllSubAdmins } from "../../Utils/apiService";
import ReusableTable from "../Reusables/ReusableTable";
import ResetPasswordSubAdmin from "../ResetPasswordSubAdmin/ResetPasswordSubAdmin";
import { toast } from "react-toastify";

const ViewAllSubadmin = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const itemsPerPage = 10;

  const fetchSubAdmins = async () => {
    try {
      const response = await ViewAllSubAdmins({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      if (response.success) {
        setSubAdmins(response.data || []);
        setTotalData(response.pagination?.totalItems || 0); // safe access with fallback
      } else {
        setSubAdmins([]);
        setTotalData(0);
        toast.error("Failed to fetch sub-admins");
      }
    } catch (error) {
      console.error("Error fetching sub-admins:", error);
      toast.error("An unexpected error occurred");
      setSubAdmins([]);
      setTotalData(0);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, [searchTerm, currentPage]);

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
      {showModal && selectedUser && (
        <ResetPasswordSubAdmin
          userName={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      <div
        className="p-4 rounded-4 text-center shadow-lg m-5 border"
        style={{ background: "linear-gradient(135deg, #f0f9ff, #cce7f6)" }}
      >
        <ReusableTable
          data={subAdmins}
          columns={columns}
          itemsPerPage={itemsPerPage}
          tableHeading="SUB ADMIN LIST"
          showSearch={true}
          paginationVisible={true}
          currentPage={currentPage}
          totalData={totalData}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1); 
          }}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
};

export default ViewAllSubadmin;
