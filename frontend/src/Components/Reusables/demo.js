import React, { useEffect, useState } from "react";
import "./PrizeValidation.css";
import ReusableTable from "../Reusables/ReusableTable";
import ReusableModal from "../Reusables/ReusableModal";
import {
  PrizeValidationMarkets,
  ViewSubAdminsPrizeValidationMarkets,
  ViewSubAdminsPrizeValidationMarketsCompareCheck,
  ApproveReject,
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

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const allMarket = await PrizeValidationMarkets({ search: "" });
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
    fetchMarketData();
  }, []);

  const fetchApprovalData = async (market) => {
    try {
      const response = await ViewSubAdminsPrizeValidationMarkets({}, market.id);
      if (response?.success) {
        setApprovalData(response.data || []);
      } else {
        setApprovalData([]);
      }
      setSelectedMarket(market);
    } catch (error) {
      console.error("Error fetching approval data:", error);
    }
  };

  const fetchComparisonData = async (marketId) => {
    try {
      setLoadingModal(true);
      const response = await ViewSubAdminsPrizeValidationMarketsCompareCheck(
        {},
        marketId
      );
      if (response?.success) {
        setModalContent(response.data || []);
      } else {
        setModalContent([]);
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setModalContent([]);
    } finally {
      setLoadingModal(false);
      setShowModal(true);
    }
  };

  const handleApproveReject = async (type) => {
    if (!selectedMarket || modalContent.length === 0) return;
    try {
      const response = await ApproveReject(modalContent, selectedMarket.id, type);
      if (response?.success) {
        alert(`${type} successful!`);
        setShowModal(false);
      }
    } catch (error) {
      console.error(`Error during ${type}:`, error);
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

  const approvalColumns = [
    { key: "subAdmin1", label: "Sub-Admin 1" },
    { key: "subAdmin2", label: "Sub-Admin 2" },
    {
      key: "compareCheck",
      label: "Compare Check",
      render: (row) => (
        <button
          className="btn btn-info"
          onClick={() => fetchComparisonData(selectedMarket?.id)}
          disabled={!row.subAdmin2}
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
            Back To Market List
          </button>
          <h3 className="text-uppercase">
            Approval List For {selectedMarket.marketName}
          </h3>
          <ReusableTable
            data={approvalData}
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
            <p className="loading-text">Loading Market Data...</p>
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
        body={<ComparisonTable modalContent={modalContent} loadingModal={loadingModal} />}
        footerButtons={[
          {
            text: "Approve",
            onClick: () => handleApproveReject("approve"),
            className: "btn btn-success",
          },
          {
            text: "Reject",
            onClick: () => handleApproveReject("reject"),
            className: "btn btn-danger",
          },
        ]}
      />
    </div>
  );
};

export default PrizeValidation;
