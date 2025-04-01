import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { generateLotteryOptions } from "../../Utils/helper";
import { LotteryRange, SearchLotteryTicket } from "../../Utils/apiService";
import { getInitialLotteryData } from "../../Utils/getInitialState";

const UseSearchData = (MarketId) => {
  const [lotteryData, setLotteryData] = useState(getInitialLotteryData());

  //all input boxes with dropdown defined here
  const DROPDOWN_FIELDS = [
    { label: "Sem Value", stateKey: "semValues", field: "selectedSem" },
    { label: "Group", stateKey: "groups", field: "selectedGroup" },
    { label: "Series", stateKey: "series", field: "selectedSeries" },
    { label: "Number", stateKey: "numbers", field: "selectedNumber" },
  ];

  // FETCHING ALL THE DROPDOWN DATA WITH RESPECT TO EACH MARKETID ONLY
  const fetchLotteryData = useCallback(async () => {
    const response = await LotteryRange();

    const marketData = response?.data?.find(
      (market) => market?.marketId === MarketId
    );

    if (marketData) {
      const {
        group_start,
        group_end,
        series_start,
        series_end,
        number_start,
        number_end,
        marketName,
        start_time,
        end_time,
        isActive,
        price,
      } = marketData;

      const { groupOptions, seriesOptions, numberOptions } =
        generateLotteryOptions(
          group_start,
          group_end,
          series_start,
          series_end,
          number_start,
          number_end
        );

      setLotteryData((prevData) => ({
        ...prevData,
        groups: groupOptions,
        series: seriesOptions,
        numbers: numberOptions,
        marketName: marketName || "Unknown Market",

        endTimeForShowCountdown: end_time,
        startTimeForShowCountdown: start_time,
        isSuspend: !isActive,
        price: price,
      }));
    }
  }, [MarketId]);

  useEffect(() => {
    setLotteryData(getInitialLotteryData());
    fetchLotteryData();
  }, [MarketId, lotteryData.isUpdate]);

  // API FETCHING FOR THE SEARCH BUTTON AFTER WHICH THE SEARCHRESULTSNEW PAGE IS EXECUTED
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      const requestBody = {
        marketId: MarketId,
        sem: values.selectedSem ? parseInt(values.selectedSem) : null,
        group: values.selectedGroup,
        series: values.selectedSeries,
        number: values.selectedNumber,
      };

      const response = await SearchLotteryTicket(requestBody);

      setLotteryData((prevData) => ({
        ...prevData,
        searchResult: response?.data || null, // Store search results
      }));

      resetForm();
      setSubmitting(false);
      setLotteryData((prevData) => ({
        ...prevData,
        refreshKey: prevData.refreshKey + 1, // Trigger refresh
      }));
    },
    [MarketId, setLotteryData]
  );

  //back button after search button clicked
  const handleBack = () => {
    setLotteryData((prevData) => ({
      ...prevData,
      searchResult: null,
    }));
  };

  return {
    lotteryData,
    fetchLotteryData,
    handleSubmit,
    handleBack,
    DROPDOWN_FIELDS,
  };
};

export default UseSearchData;
