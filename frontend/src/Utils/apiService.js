import { toast } from "react-toastify";
import strings from "./constant/stringConstant";
import { getAuthCallParams, getNoAuthCallParams, makeCall } from "./service";
import urls from "./UrlConstant";

// Admin login
export async function adminLogin(body, isToast = true) {
  try {
    const callParams = getNoAuthCallParams(strings.POST, body);
    const response = await makeCall(urls.login, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function generateTicketNumber(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.generateTicketId, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function generateLotteryTicket(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.generateLottery, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLotteryTickets(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.GET, null, isToast);
    const response = await makeCall(
      `${urls.getLotteryTicket}?page=${body.page}&limitPerPage=${body.limit}&totalPages=${body.totalPages}&totalData=${body.totalItems}&Sem=${body.sem}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getPurchasedLotteryTickets(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.GET, null, isToast);
    const response = await makeCall(
      `${urls.getPurchasedLotteryTicket}?page=${body.page}&limitPerPage=${body.limit}&totalPages=${body.totalPages}&totalData=${body.totalItems}&Sem=${body.searchBySem}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
    // console.log(error)
  }
}

export async function CreatedLotteryTicketsDelete(isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, null, isToast);
    const response = await makeCall(
      urls.removeCreatedLottery,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

// not in use anymore
export async function PurchasedLotteryTicketsDelete(isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, null, isToast);
    const response = await makeCall(
      urls.deletePurchasedLottery,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function unPurchasedLotteryTicketsDelete(isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, null, isToast);
    const response = await makeCall(
      urls.UnPurchasedLotteryDelete,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getSelectSemInModal(sem, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.GET, null, isToast);
    const response = await makeCall(
      `${urls.getSelectSem}/${sem}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function singleLotteryDelete(lotteryId, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, null, isToast);
    const response = await makeCall(
      `${urls.SingleDeleteCard}/${lotteryId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function singleLotteryEdit(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.PUT, body);
    const response = await makeCall(
      `${urls.SingleEditCard}/${body.lotteryId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function generateLotteryNumber(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.generateNumber, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function SearchLotteryTicket(body) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body);
    const response = await makeCall(urls.searchTicket, callParams);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function PurchasedTicketsHistory(body, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, null, isToast);
    let url = `${urls.PurchasedLotteryHistory}/${body.marketId}?page=${body.page}&limitPerPage=${body.limit}`;
    if (body.searchBySem) {
      url = url + `&search=${body.searchBySem}`;
    }
    // console.log("search lottery", url);
    const response = await makeCall(url, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

// export async function lotteryPurchaseHIstoryUserNew(body = {}, isToast = false) {
//   try {
//     const callParams = await getAuthCallParams(strings.GET, body, isToast); // Using POST method with `body`
//     const response = await makeCall(
//       `${urls.userPurchaseHIstory}?page=${body.page}&limitPerPage=${body.limit}&searchTerm=${body.searchTerm}`, // Constructing URL with pagination and search term
//       callParams,
//       isToast
//     );
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

export async function CreateDrawTime(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.lotteryClock, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetDrawTime(body, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(urls.GetScheduleTime, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function CustomWiningAdmin(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(
      strings.POST,
      body.resultArray,
      isToast
    );
    const response = await makeCall(
      `${urls.CustomWinningPrizeadmin}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function CustomWining(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(
      strings.POST,
      body.resultArray,
      isToast
    );
    const response = await makeCall(
      `${urls.CustomWinningPrizeSubadmin}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetWiningResult(body) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body);
    const response = await makeCall(
      `${urls.GetResult}/${body.marketId}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function LotteryRange(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.lotteryRange}?search=${body.search}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function AllActiveLotteryMarkets(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      ` ${urls.allActiveLotteryMarket}?search=${body.search}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetMarketTimings(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      ` ${urls.getMarketTime}?search=${body.search}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetPurchaseOverview(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.getPurchaseDetails}/${body.marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetResultMarket(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.getResultMarkets}?date=${body.date}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function GetPurchaseHistoryMarketTimings(
  body = {},
  isToast = false
) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.getPurchaseMarketTime}?date=${body.date}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function isActiveLottery(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.isActive, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getIsActiveLottery(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.getIsActive}?page=${body.page}&limitPerPage=${body.limit}&search=${body.search}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function isRevokeLottery(body = {}, isToast = false) {
  console.log("first", body);
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.isRevoke, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function voidMarket(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.getVoidMarket, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function GetVoidMarketData(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.allVoidMarketData}?page=${body.page}&limit=${body.limit}&search=${body.search}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetliveMarketBroadcast(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.allLiveMarketBroadcast}?page=${body.page}&limit=${body.limit}&search=${body.search}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetMarketStats(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.allLiveMarketstats}/${body.marketId}?page=${body.page}&limit=${body.limit}&search=${body.search}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function DeleteLiveBets(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.DeleteLiveBets, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function DeletedLiveBetsMarkets(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.DeletedLiveBetsMarkets}?search=${body.search}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function DeletedLiveBetsMarketsDetails(
  body = {},
  isToast = false
) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.LiveBetsMarketsDetailsDeleted}/${body.marketId}?page=${body.page}&limit=${body.limit}&search=${body.search}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function TrashMarketsDelete(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, body, isToast);
    const response = await makeCall(
      `${urls.TrashMarketDetailsDelete}/${body.purchaseId}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function RevokeMarketsDelete(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      urls.RevokeDelete,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function ResetAdminPassword(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      urls.resetPasswordAdmin,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function UpdateMarketDetails(body = {}, marketId, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.PUT, body, isToast);
    const response = await makeCall(
      `${urls.UpdateDetails}/${marketId}`,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function createSubAdmin(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.subAdminCreate, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

// MARKETNAMES API FOR PRIZE VALIDATION
export async function PrizeValidationMarkets(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      ` ${urls.compareValidationMarkets}?page=${body.page}&limit=${body.limit}&search=${body.search}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

// SUBADMINS NAMES WITH  RESPECT TO MARKETNAMES API FOR PRIZE VALIDATION  TO APPROVE
export async function ViewSubAdminsPrizeValidationMarkets(
  body = {},
  marketId,
  isToast = false
) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      ` ${urls.ViewSubAdminsValidationMarkets}/${marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

// COMPARE CHECK DATA WITH SUBADMINS NAMES COMPARISON LIST  WITH  RESPECT TO MARKETNAMES API FOR PRIZE VALIDATION  TO APPROVE
export async function ViewSubAdminsPrizeValidationMarketsCompareCheck(
  body = {},
  marketId,
  isToast = false
) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      ` ${urls.SubAdminsValidationMarketsCompareCheck}/${marketId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

// COMPARE CHECK DATA WITH SUBADMINS NAMES COMPARISON LIST  WITH  RESPECT TO MARKETNAMES API FOR  APPROVE   AND REJECT
export async function ApproveReject(
  body = {},
  marketId,
  type,
  isToast = false
) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      ` ${urls.ApproveReject}/${marketId}?type=${body.type}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

// VIEW ALL SUBADMIN LIST
export async function ViewAllSubAdmins(
  body = {},

  isToast = false
) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.AllSubAdmins}?page=${body.page}&limit=${body.limit}&search=${body.search}`, 
      
      callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function GetliveMarketBet(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams("GET", body, isToast);
    const response = await makeCall(
      `${urls.allLiveMarketBet}?page=${body.page}&limit=${body.limit}&search=${body.search}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetBetMarketStats(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.allLiveBetMarket}/${body.marketId}?page=${body.page}&limit=${body.limit}&search=${body.search}`,
      callParams
    );
    console.log("Body===================", body);

    return response;
  } catch (error) {
    throw error;
  }
}

export async function DeleteLiveBetMarket(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      urls.DeleteLiveMarketBets,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function voidBetMarket(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(urls.getVoidBetMarket, callParams, isToast);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getUpdateMarket(body, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      urls.getUpdateInactive,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function subAdminWinResult(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.getSubAdminWinResult}?page=${body.page}&limit=${body.limit}&search=${body.search}&status=${body.status || ""}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetWiningResultSubAdmin(body) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body);
    const response = await makeCall(
      `${urls.GetResultSubAdmin}/${body.marketId}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export async function ResetSubAdminPassword(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      urls.SubPasswordReset,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}


export async function SubAdminDelete(AdminId, isToast = true) {
  try {
    const callParams = await getAuthCallParams(strings.DELETE, null, isToast);
    const response = await makeCall(
      `${urls.SubAdmninDelete}/${AdminId}`,
      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function SubAdminResetPassword(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.POST, body, isToast);
    const response = await makeCall(
      urls.subAdminResetPassword,

      callParams,
      isToast
    );
    return response;
  } catch (error) {
    throw error;
  }
}


export async function ViewSubAdminsTickets(body = {}, marketId, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.ViewSubAdminsTicket}/${marketId}?status=${body.status || ""}`,
      callParams,
      isToast
    );
    
    
    return response;
  } catch (error) {
    throw error;
  }
}

export async function GetResultMarketSub(body = {}, isToast = false) {
  try {
    const callParams = await getAuthCallParams(strings.GET, body, isToast);
    const response = await makeCall(
      `${urls.SubMarkets}?date=${body.date}`,
      callParams
    );
    return response;
  } catch (error) {
    throw error;
  }
}

