class UrlConstant {
  constructor() {}
  //url was commented

  url_dev = process.env.REACT_APP_API_URL;

  admin = "admin";
  login = `${this.url_dev}/login`;
  subadmin = "subadmin"
  generateTicketId = `${this.url_dev}/ticket-create`;
  generateLottery = `${this.url_dev}/create-lottery`;
  getLotteryTicket = `${this.url_dev}/getAllLotteries`;
  getPurchasedLotteryTicket = `${this.url_dev}/allPurchase-Lotteries`; // not in use as of now
  removeCreatedLottery = `${this.url_dev}/deleteAll-lotteries`;
  deletePurchasedLottery = `${this.url_dev}/deleteAll-purchaseLotteries`; // not in use as of now
  UnPurchasedLotteryDelete = `${this.url_dev}/lotteries/delete-non-purchased`;
  getSelectSem = `${this.url_dev}/generate-tickets`;
  SingleDeleteCard = `${this.url_dev}/delete-particularLottery`;
  SingleEditCard = `${this.url_dev}/edit-particularLottery`;
  generateNumber = `${this.url_dev}/generate-ticket`;
  searchTicket = `${this.url_dev}/admin/search-ticket`;
  PurchasedLotteryHistory = `${this.url_dev}/admin/purchase-history`;
  lotteryClock = `${this.url_dev}/admin/draw-dates`;
  GetScheduleTime = `${this.url_dev}/draw-dates`;
  CustomWinningPrizeadmin = `${this.url_dev}/${this.admin}/results-declaration`;
  CustomWinningPrizeSubadmin = `${this.url_dev}/${this.subadmin}/win-result-request`; 
  GetResult = `${this.url_dev}/lottery-results`;
  lotteryRange = `${this.url_dev}/get-range`;
  allActiveLotteryMarket = `${this.url_dev}/${this.admin}/getAll-markets`;
  getMarketTime = `${this.url_dev}/get-range`;
  getPurchaseDetails = `${this.url_dev}/tickets/purchases`;
  getResultMarkets = `${this.url_dev}/admin/dateWise-markets`;
  getPurchaseMarketTime = `${this.url_dev}/${this.admin}/get-markets`;
  getVoidMarket = `${this.url_dev}/void-market-lottery`;
  allVoidMarketData = `${this.url_dev}/get-void-market`;
  isActive = `${this.url_dev}/update-market-status`;
  getIsActive = `${this.url_dev}/get-inactive-markets`;
  isRevoke = `${this.url_dev}/revoke-market-lottery`;
  allLiveMarketBroadcast = `${this.url_dev}/live-markets`;
  allLiveMarketstats = `${this.url_dev}/live-lotteries`;
  DeleteLiveBets = `${this.url_dev}/delete-liveBet-lottery`;
  DeletedLiveBetsMarkets = `${this.url_dev}/get-trash-market`;
  LiveBetsMarketsDetailsDeleted = `${this.url_dev}/get-trash-bet`;
  TrashMarketDetailsDelete = `${this.url_dev}/delete-trash`;
  RevokeDelete = `${this.url_dev}/revoke-live-market`;;
  resetPasswordAdmin = `${this.url_dev}/${this.admin}/reset-password`;
  UpdateDetails = `${this.url_dev}/${this.admin}/update-market`;
  subAdminCreate = `${this.url_dev}/${this.admin}/create-subAdmin`;
  compareValidationMarkets = `${this.url_dev}/${this.subadmin}/win-request-market`;
  ViewSubAdminsValidationMarkets = `${this.url_dev}/market-wise-subadmin`;
  SubAdminsValidationMarketsCompareCheck = `${this.url_dev}/${this.subadmin}/matching-data`;
  ApproveReject = `${this.url_dev}/${this.admin}/approved-reject`
  allLiveMarketBet = `${this.url_dev}/afterWin-markets`;
  allLiveBetMarket = `${this.url_dev}/afterWin-lotteries`;
  DeleteLiveMarketBets = `${this.url_dev}/delete-Bet-afterWin-lottery`;
  getVoidBetMarket = `${this.url_dev}/void-market-afterWin-lottery`;
}

const urls = new UrlConstant();
export default urls;
