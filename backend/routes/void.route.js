import { getVoidMarkets, voidAfterWinMarket, voidMarket } from "../controllers/voidGame.controller.js";
import { validateVoidAfyerWin, validateVoidMarket } from "../utils/commonSchema.js";
import customErrorHandler from '../utils/customErrorHandler.js';
import { authorize } from '../middlewares/auth.js';
import { string } from "../constructor/string.js";


export const voidGameRoute = (app) => {
  app.post("/api/void-market-lottery",validateVoidMarket,customErrorHandler, authorize([string.Admin]),voidMarket);

   app.get("/api/get-void-market",getVoidMarkets) 

  app.post("/api/void-market-afterWin-lottery",validateVoidAfyerWin,customErrorHandler, authorize([string.Admin]),voidAfterWinMarket);

};