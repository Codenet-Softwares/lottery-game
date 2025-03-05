import React, { useEffect, useState } from "react";
import "./PrizeValidation.css";
import ReusableTable from "../Reusables/ReusableTable";
import ReusableModal from "../Reusables/ReusableModal";
import { AllActiveLotteryMarkets } from "../../Utils/apiService"; // Assuming this is where the API function is imported

const PrizeValidation = () => {
  const [marketData, setMarketData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const allmarket = await AllActiveLotteryMarkets({ search: "" });
        console.log(allmarket); // Debugging: Check the structure of the response
  
        const formattedMarkets = allmarket.data.map((item, index) => ({
          id: item.marketId, // Corrected field name
          marketName: item.marketName, // Corrected field name
          serialNumber: index + 1,
        }));
  
        setMarketData(formattedMarkets);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMarketData();
  }, []);
  

  const marketColumns = [
    { key: "serialNumber", label: "S.No." },
    { key: "marketName", label: "Market Name" },
    {
      key: "approveButton",
      label: "Approval List",
      render: (row) => (
        <button
          className="btn btn-primary text-uppercase fw-bold"
          onClick={() => setSelectedMarket(row)}
        >
          View Approval
        </button>
      ),
    },
  ];

  const selectedMarketApprovals = Array.isArray(approvalData)
    ? approvalData.find((item) => item.marketId === selectedMarket?.id)
    : undefined;

  const filteredApprovalData = selectedMarketApprovals
    ? selectedMarketApprovals.subAdmins.map((subAdmin, index) => ({
        id: index + 1,
        subAdmin1: subAdmin.subAdmin1,
        subAdmin2: subAdmin.subAdmin2,
      }))
    : [];

  const handleApprovalCheck = () => {
    setModalContent("Approval check details go here...");
    setShowModal(true);
  };

  const approvalColumns = [
    { key: "subAdmin1", label: "Sub-Admin 1" },
    { key: "subAdmin2", label: "Sub-Admin 2" },
    {
      key: "compareCheck",
      label: "Compare Check",
      render: () => (
        <button className="btn btn-info" onClick={handleApprovalCheck}>
          Approval Check
        </button>
      ),
    },
  ];

  return (
    <div className="prize-validation-container">
      {selectedMarket ? (
        <div className="approval-view">
          <button
            className="btn btn-secondary mb-3 text-uppercase fw-bold"
            onClick={() => setSelectedMarket(null)}
          >
            Back to Market List
          </button>
          <h3 className="text-uppercase">
            Approval List for {selectedMarket.marketName}
          </h3>
          <ReusableTable
            data={filteredApprovalData}
            columns={approvalColumns}
            itemsPerPage={5}
            showSearch={false}
            paginationVisible={false}
          />
        </div>
      ) : (
        <>
          <h2 className="prize-validation-title text-uppercase">
            Prize Approval Market List
          </h2>
          {loading ? (
            <p className="loading-text">Loading market data...</p>
          ) : (
            <ReusableTable
              data={marketData}
              columns={marketColumns}
              itemsPerPage={10}
              showSearch={false}
              paginationVisible={true}
            />
          )}
        </>
      )}
      <ReusableModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Approval Check"
        body={modalContent}
      />
    </div>
  );
};

export default PrizeValidation;
