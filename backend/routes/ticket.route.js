import { string } from '../constructor/string.js';
import { geTicketRange, geTicketRangeExternal, getIsactiveMarket, saveTicketRange, updateMarket } from '../controllers/ticket.controller.js';
import { authorize } from '../middlewares/auth.js';
import { updateMarketValidation, validateTicketRange } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const ticketRoute = (app) => {
  app.post('/api/generate-ticket', validateTicketRange, customErrorHandler, authorize([string.Admin]), saveTicketRange);
  app.put('/api/admin/update-market/:marketId',updateMarketValidation,customErrorHandler,authorize([string.Admin]), updateMarket);
  app.get('/api/get-range', geTicketRange);
  app.get('/api/get-range-external', geTicketRangeExternal);
  app.get('/api/get-active-market', getIsactiveMarket);
};
