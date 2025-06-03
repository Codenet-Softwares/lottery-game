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
import { useAppContext } from "../../contextApi/context";
import { toast } from "react-toastify";

const PrizeValidation = () => {
  const [marketData, setMarketData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const { store, showLoader, hideLoader } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1); // Just reset page on search
      setSearchTerm(searchInput); // Save input to actual searchTerm
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  console.log("searchInput", searchInput);
  // marketnames for the page of Prize Approval Market List
  const fetchMarketData = async (searchTerm = "") => {
    try {
      setLoading(true);
      const allMarket = await PrizeValidationMarkets({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      });
      console.log(allMarket);

      const formattedMarkets = allMarket.data.map((item, index) => ({
        id: item.marketId,
        marketName: item.marketName,
        serialNumber: index + 1 + (currentPage - 1) * itemsPerPage,
      }));

      setMarketData(formattedMarkets);
      setTotalData(allMarket.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  // rerender of the marketnames for the page of Prize Approval Market List
  useEffect(() => {
    if (searchTerm === "" || currentPage === 1 || totalData > 0) {
      fetchMarketData(searchTerm);
    }
  }, [currentPage, searchTerm]);

  // ViewSubAdmins for the page of Prize Approval with respect to Market List
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

  // comparelist for the page of Prize Approval with respect to Market List by 2 subadmins
  const fetchComparisonData = async (marketId) => {
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
    setShowModal(true); // Open the modal
  };

  // approve reject fetch and succeded here in this function
  const handleApproveReject = async (type) => {
    if (!selectedMarket) return;
    showLoader(); // Show the loader before the API call starts

    if (type === "Approve") {
      // Call the first API (ApproveReject)
      const response = await ApproveReject({ type }, selectedMarket.id);

      if (response?.success && response?.successCode === 200) {
        // Show toast only ONCE here
        toast.success(response.message); // server end message is not sent properly intimated
        // Pass the response from ApproveReject as the payload to CustomWining
        const customWiningResponse = await CustomWiningAdmin({
          resultArray: response.data,
          marketId: selectedMarket.id,
        });

        if (customWiningResponse?.success) {
          setApprovalData([]);
          setShowModal(false);
          setSelectedMarket(null); // Reset to go back to Prize Approval Market List
          fetchMarketData();
        }
      }
    }
    if (type === "Reject") {
      const response = await ApproveReject({ type }, selectedMarket.id);
      if (!response?.success) {
        toast.info(response.message);
        setApprovalData([]);
        setShowModal(false);
        setSelectedMarket(null); // Reset to go back to Prize Approval Market List
        fetchMarketData();
      }
    }
    hideLoader(); // Hide the loader after the API call finishes
  };

  const marketColumns = [
    { key: "serialNumber", label: "S.No." },
    { key: "marketName", label: "Market Name" },
    {
      key: "approveButton",
      label: "Approval List",
      render: (row) => (
        <button
          className="btn btn-primary text-uppercase fw-bold text-white"
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
            Back to Market List
          </button>
          <h3 className="text-uppercase">
            Approval List For {selectedMarket.marketName}
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
            <p className="loading-text">Loading Market Data...</p>
          ) : (
            <ReusableTable
              data={marketData}
              columns={marketColumns}
              itemsPerPage={itemsPerPage}
              showSearch={true}
              paginationVisible={true}
              currentPage={currentPage}
              totalData={totalData}
              onSearch={(term) => {
                setSearchInput(term);
              }}
              onPageChange={setCurrentPage}
              searchInput={searchInput}
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
            disabled:
              modalContent?.matchedEnteries?.length === 0 || // Disable if no matched entries
              (modalContent?.matchedEnteries?.length > 0 &&
                modalContent?.UnmatchedEntries?.length > 0), // Disable if both matched & unmatched exist
          },
          {
            text: "Reject",
            onClick: () => handleApproveReject("Reject"),
            className: "btn btn-danger",
          },
        ]}
      />
    </div>
  );
};

export default PrizeValidation;
