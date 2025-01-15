import { string } from '../constructor/string.js';
import { geTicketRange, getIsactiveMarket, saveTicketRange } from '../controllers/ticket.controller.js';
import { authorize } from '../middlewares/auth.js';
import { validateTicketRange } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const ticketRoute = (app) => {
  app.post('/api/generate-ticket', validateTicketRange, customErrorHandler, authorize([string.Admin]), saveTicketRange);
  app.get('/api/get-range', geTicketRange);
  app.get('/api/get-active-market', getIsactiveMarket);
};
