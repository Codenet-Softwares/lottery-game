import React, { useEffect, useState } from "react";
import "./PrizeValidation.css";
import ReusableTable from "../Reusables/ReusableTable";
import ReusableModal from "../Reusables/ReusableModal";
import {
  PrizeValidationMarkets,
  ViewSubAdminsPrizeValidationMarkets,
  ViewSubAdminsPrizeValidationMarketsCompareCheck,
  ApproveReject,
  CustomWiningAdmin,
} from "../../Utils/apiService";
import ComparisonTable from "./ComparisonTable";

const PrizeValidation = () => {
  const [marketData, setMarketData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // marketnames for the page of Prize Approval Market List

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const allMarket = await PrizeValidationMarkets({ search: "" });
      console.log(allMarket);

      const formattedMarkets = allMarket.data.map((item, index) => ({
        id: item.marketId,
        marketName: item.marketName,
        serialNumber: index + 1,
      }));

      setMarketData(formattedMarkets);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  // rerender of the  marketnames for the page of Prize Approval Market List
  useEffect(() => {
    fetchMarketData();
  }, []);

  //  ViewSubAdmins for the page of Prize Approval with respect to  Market List
  const fetchApprovalData = async (market) => {
    const response = await ViewSubAdminsPrizeValidationMarkets({}, market.id);
    console.log("Approval Data Response:", response);

    if (response?.success) {
      setApprovalData(response.data || []);
    } else {
      setApprovalData([]);
    }
    setSelectedMarket(market);
  };
  //  comparelist  for the page of Prize Approval with respect to  Market List by 2 subadmins
  const fetchComparisonData = async (marketId) => {
    setLoadingModal(true);
    const response = await ViewSubAdminsPrizeValidationMarketsCompareCheck(
      {},
      marketId
    );
    console.log("Comparison Data Response:", response);

    if (response?.success) {
      setModalContent(response.data || []);
    } else {
      setModalContent([]);
    }
  };
  //  approve reject fetch and succeded here in this function
  const handleApproveReject = async (type) => {
    if (!selectedMarket) return;

    //  Call the first API (ApproveReject)
    const response = await ApproveReject({ type }, selectedMarket.id);

    if (response?.success) {
      // Pass the response from ApproveReject as the payload to CustomWining
      const customWiningResponse = await CustomWiningAdmin({
        resultArray: response.data,
        marketId: selectedMarket.id,
      });

      if (customWiningResponse?.success) {
        alert(`${type} successful!`);
        setApprovalData([]);
        setShowModal(false);
        setSelectedMarket(null); // Reset to go back to Prize Approval Market List

        fetchMarketData();
      }
    }
  };

  const marketColumns = [
    { key: "serialNumber", label: "S.No." },
    { key: "marketName", label: "Market Name" },
    {
      key: "approveButton",
      label: "Approval List",
      render: (row) => (
        <button
          className="btn btn-primary text-uppercase fw-bold"
          onClick={() => fetchApprovalData(row)}
        >
          View Approval
        </button>
      ),
    },
  ];

  const selectedMarketApprovals = approvalData.find(
    (item) => item.marketId === selectedMarket?.id
  );

  const filteredApprovalData = selectedMarketApprovals
    ? selectedMarketApprovals.subAdmins.reduce((acc, subAdmin, index) => {
        if (index % 2 === 0) {
          acc.push({
            id: acc.length + 1,
            subAdmin1: subAdmin.declearBy,
            subAdmin2: "",
          });
        } else {
          acc[acc.length - 1].subAdmin2 = subAdmin.declearBy;
        }
        return acc;
      }, [])
    : [];

  const approvalColumns = [
    { key: "subAdmin1", label: "Sub-Admin 1" },
    { key: "subAdmin2", label: "Sub-Admin 2" },
    {
      key: "compareCheck",
      label: "Compare Check",
      render: (row) => (
        <button
          className="btn btn-info fw-bold text-uppercase"
          onClick={() => fetchComparisonData(selectedMarket?.id)}
          disabled={!row.subAdmin2} // Disable button if only one sub-admin exists
        >
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
        handleClose={() => {
          console.log("Closing Modal...");
          setShowModal(false);
        }}
        title="Approval Check"
        body={
          <ComparisonTable
            modalContent={modalContent}
            loadingModal={loadingModal}
          />
        }
        footerButtons={[
          {
            text: "Approve",
            onClick: () => handleApproveReject("Approve"),
            className: "btn btn-success",
            disabled: !modalContent?.Matched?.length, // Disable if no Matched data
          },
          {
            text: "Reject",
            onClick: () => handleApproveReject("Reject"),
            className: "btn btn-danger",
            disabled: !modalContent?.Matched?.length,
          },
        ]}
      />
    </div>
  );
};

export default PrizeValidation;
