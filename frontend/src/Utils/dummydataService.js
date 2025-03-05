import marketNamesData from "../Components/DummyData/MarketNamesData.json";
import ApprovalSubadminData from "../Components/DummyData/ApprovalSubadminData.json"


export const getData = (type) => {
  switch (type) {
    case "markets":
      return marketNamesData;

      case "Approvals":
        return ApprovalSubadminData;

    default:
      return [];
  }
};
