import { string } from "../constructor/string.js";
import {
  adminApproveReject,
  adminPurchaseHistory,
  adminSearchTickets,
  afterWinLotteries,
  afteWinMarkets,
  createAdmin,
  createSubAdmin,
  createTitleTextNotification,
  dateWiseMarkets,
  deleteSubAdmin,
  getAllMarkets,
  getAllSubAdmin,
  getInactiveMarket,
  getMarkets,
  getMatchData,
  getResult,
  getSubAdminHistory,
  getSubadminResult,
  getTicketNumbersByMarket,
  getTicketRange,
  inactiveMarketStatus,
  // inactiveMarketStatus,
  liveLotteries,
  liveMarkets,
  login,
  marketWiseSubadmin,
  resetPassword,
  subAdmindateWiseMarkets,
  subAdminResetPassword,
  subAdminResultStatus,
  subAdminsResetPassword,
  updateHotGameStatus,
  updateMarketStatus,
  winResultMarket,
} from "../controllers/admin.controller.js";
import { authorize } from "../middlewares/auth.js";
import {
  validateAdminLogin,
  validateAdminPurchaseHistory,
  validateSearchTickets,
  validateCreateAdmin,
  validateDateQuery,
  validateGetResult,
  validateMarketId,
  validateLiveLottery,
  validateLiveMarkets,
  validateResetPassword,
  validateAfterWinMarkets,
  validateAfterWinLottery,
  createSubAdminSchema,
  validateMarketWiseSubadmin,
  validateAdminApproveReject,
  resetPasswordSchema,
  validateDeleteSubAdmin,
  validateTitleText,
  validateHotGame,
} from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const adminRoutes = (app) => {
  app.post(
    "/api/create-admin",
    validateCreateAdmin,
    customErrorHandler,
    createAdmin
  );
  app.post("/api/login", validateAdminLogin, customErrorHandler, login);
  app.post(
    "/api/subAdmin/reset-password",
    resetPasswordSchema,
    customErrorHandler,
    subAdminResetPassword
  );
  app.post('/api/subAdmin-reset-password',resetPasswordSchema, customErrorHandler,authorize([string.Admin]), subAdminsResetPassword);
  app.post(
    "/api/admin/search-ticket",
    validateSearchTickets,
    customErrorHandler,
    authorize([string.Admin]),
    async (req, res) => {
      try {
        const tickets = await adminSearchTickets(req.body);

        return apiResponseSuccess(
          tickets,
          true,
          statusCode.success,
          "Success.",
          res
        );
      } catch (error) {
        console.error("Error saving ticket range:", error);
        return apiResponseErr(
          null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message,
          res
        );
      }
    }
  );

  app.get(
    "/api/admin/purchase-history/:marketId",
    validateAdminPurchaseHistory,
    customErrorHandler,
    authorize([string.Admin]),
    adminPurchaseHistory
  );

  app.get(
    "/api/admin/prize-results",
    validateGetResult,
    customErrorHandler,
    authorize([string.Admin]),
    getResult
  );

  app.get(
    "/api/tickets/purchases/:marketId",
    validateMarketId,
    customErrorHandler,
    authorize([string.Admin]),
    getTicketNumbersByMarket
  );

  app.get(
    "/api/admin/getAll-markets",
    authorize([string.Admin, string.SubAdmin], [string.WinLottery]),
    getAllMarkets
  );

  app.get(
    "/api/admin/dateWise-markets",
    authorize([string.Admin, string.SubAdmin], [string.resultView]),
    dateWiseMarkets
  );

  app.get("/api/admin/get-markets", authorize([string.Admin]), getMarkets); //worked in date filter

  app.get(
    "/api/get-inactive-markets",
    authorize([string.Admin]),
    getInactiveMarket
  );

  app.post("/api/update-market-status", updateMarketStatus);

  app.post("/api/update-inactive-market-status", inactiveMarketStatus);

  app.get("/api/admin/prize-results", authorize([string.Admin]), getResult);

  app.get("/api/admin/ticketRange", getTicketRange);

  app.get(
    "/api/live-markets",
    validateLiveMarkets,
    customErrorHandler,
    authorize([string.Admin]),
    liveMarkets
  );

  app.get(
    "/api/live-lotteries/:marketId",
    validateLiveLottery,
    customErrorHandler,
    authorize([string.Admin]),
    liveLotteries
  );

  app.post(
    "/api/admin/reset-password",
    validateResetPassword,
    customErrorHandler,
    authorize([string.Admin]),
    resetPassword
  );

  app.get(
    "/api/afterWin-markets",
    validateAfterWinMarkets,
    customErrorHandler,
    authorize([string.Admin]),
    afteWinMarkets
  );

  app.get(
    "/api/afterWin-lotteries/:marketId",
    validateAfterWinLottery,
    customErrorHandler,
    authorize([string.Admin]),
    afterWinLotteries
  );

  app.post(
    "/api/admin/create-subAdmin",
    createSubAdminSchema,
    customErrorHandler,
    authorize([string.Admin]),
    createSubAdmin
  );

  app.get(
    "/api/subadmin/win-request-market",
    authorize([string.Admin]),
    winResultMarket
  );

  app.get(
    "/api/market-wise-subadmin/:marketId",
    validateMarketWiseSubadmin,
    customErrorHandler,
    authorize([string.Admin]),
    marketWiseSubadmin
  );

  app.get(
    "/api/subAdmin/matching-data/:marketId",
    validateMarketWiseSubadmin,
    customErrorHandler,
    authorize([string.Admin]),
    getMatchData
  );

  app.get(
    "/api/admin/get-all-subAdmin",
    authorize([string.Admin]),
    getAllSubAdmin
  );

  app.delete('/api/subAdmin-delete/:adminId',validateDeleteSubAdmin,customErrorHandler,authorize([string.Admin]), deleteSubAdmin);

  app.post(
    "/api/admin/approved-reject/:marketId",
    validateAdminApproveReject,
    customErrorHandler,
    authorize([string.Admin]),
    adminApproveReject
  );

  app.get(
    "/api/subAdmin/get-subAdmin-history",
    authorize([string.SubAdmin], [string.winAnalytics]),
    getSubAdminHistory
  );

  app.get(
    "/api/subAdmin/get-result/:marketId",
    authorize([string.SubAdmin], [string.resultView]),
    getSubadminResult
  );

  app.get(
    "/api/subadmin/dateWise-markets",
    authorize([string.SubAdmin], [string.resultView]),
    subAdmindateWiseMarkets
  );

  app.get(
    "/api/subadmin/result-status/:marketId",
    authorize([string.SubAdmin], [string.resultView]),
    subAdminResultStatus
  );

  app.post('/api/create-notification-lottery', validateTitleText, customErrorHandler, authorize([string.Admin]), createTitleTextNotification);

  app.put('/api/update-hotGame-status', validateHotGame, customErrorHandler, authorize([string.Admin]), updateHotGameStatus);

}