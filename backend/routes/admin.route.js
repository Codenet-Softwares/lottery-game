import { string } from '../constructor/string.js';
import {
  adminPurchaseHistory,
  adminSearchTickets,
  createAdmin,
  createSubAdmin,
  dateWiseMarkets,
  getAllMarkets,
  getInactiveMarket,
  getMarkets,
  getResult,
  getTicketNumbersByMarket,
  getTicketRange,
  liveLotteries,
  liveMarkets,
  login,
  resetPassword,
  updateMarketStatus,
} from '../controllers/admin.controller.js';
import { authorize } from '../middlewares/auth.js';
import { validateAdminLogin, validateAdminPurchaseHistory, validateSearchTickets, validateCreateAdmin, validateDateQuery, validateGetResult, validateMarketId, validateLiveLottery, validateLiveMarkets, validateResetPassword, createSubAdminSchema, } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';

export const adminRoutes = (app) => {
  app.post('/api/create-admin', validateCreateAdmin, customErrorHandler, createAdmin);
  app.post('/api/login', validateAdminLogin, customErrorHandler, login);
  app.post(
    '/api/admin/search-ticket',
    validateSearchTickets,
    customErrorHandler,
    authorize([string.Admin]),
    async (req, res) => {
      try {
        const tickets = await adminSearchTickets(req.body);

        return apiResponseSuccess(tickets, true, statusCode.success, 'Success.', res);
      } catch (error) {
        console.error('Error saving ticket range:', error);
        return apiResponseErr(
          null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message,
          res,
        );
      }
    },
  );

  app.get('/api/admin/purchase-history/:marketId', validateAdminPurchaseHistory, customErrorHandler, authorize([string.Admin]), adminPurchaseHistory);

  app.get('/api/admin/prize-results', validateGetResult, customErrorHandler, authorize([string.Admin]), getResult);

  app.get("/api/tickets/purchases/:marketId", validateMarketId, customErrorHandler, authorize([string.Admin]), getTicketNumbersByMarket)

  app.get('/api/admin/getAll-markets', authorize([string.Admin, string.SubAdmin], [string.WinLottery]), getAllMarkets)

  app.get('/api/admin/dateWise-markets',authorize([string.Admin]), dateWiseMarkets)

  app.get('/api/admin/get-markets', authorize([string.Admin]), getMarkets)//worked in date filter

  app.get('/api/get-inactive-markets', authorize([string.Admin]), getInactiveMarket)

  app.post('/api/update-market-status', updateMarketStatus)

  app.get("/api/admin/prize-results", authorize([string.Admin]), getResult);

  app.get("/api/admin/ticketRange", getTicketRange)

  app.get('/api/live-markets', validateLiveMarkets, customErrorHandler, authorize([string.Admin]), liveMarkets)

  app.get('/api/live-lotteries/:marketId', validateLiveLottery, customErrorHandler, authorize([string.Admin]), liveLotteries);

  app.post('/api/admin/reset-password',validateResetPassword,customErrorHandler,authorize([string.Admin]), resetPassword);

  app.post('/api/admin/create-subAdmin', createSubAdminSchema, customErrorHandler,  authorize([string.Admin]), createSubAdmin);
};
