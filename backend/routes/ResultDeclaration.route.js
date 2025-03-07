import { string } from '../constructor/string.js';
import { getAllMarkets } from '../controllers/admin.controller.js';
import { getLotteryResults, getMultipleLotteryResults, ResultDeclare, subadminResultRequest } from '../controllers/ResultDeclaration.js';
import { authorize } from '../middlewares/auth.js';
import { validateMarketId, validationRules } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const ResultDeclarationModule = (app) => {
  app.post(
    '/api/admin/results-declaration/:marketId',
    validationRules,
    customErrorHandler,
    authorize([string.Admin]),
    ResultDeclare
  );

  app.post('/api/subadmin/win-result-request/:marketId', 
    validationRules,
    customErrorHandler, 
    authorize([string.SubAdmin], [string.WinLottery]), 
    subadminResultRequest)


  app.get('/api/lottery-results/:marketId', validateMarketId, customErrorHandler, getLotteryResults);

  app.get('/api/lottery-results', getMultipleLotteryResults);
};
