import React, { useEffect, useState } from "react";
import { ViewAllSubAdmins } from "../../Utils/apiService";
import ReusableTable from "../Reusables/ReusableTable";

const ViewAllSubadmin = () => {
  const [subAdmins, setSubAdmins] = useState([]);

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
    { key: "userName", label: "subadmin names" },
    { key: "role", label: "Role" },
    { key: "permissions", label: "Permissions" },
  ];



  return (
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
  );
};

export default ViewAllSubadmin;
