import { string } from "../constructor/string.js";
import { getRevokeMarkets, RevokeLiveMarkets, revokeMarket } from "../controllers/revokeGame.controller.js";
import { authorize } from "../middlewares/auth.js";
import {  validateRevokeLiveBet, validateVoidMarket } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";



export const revokeGameRoute = (app) => {
    app.post("/api/revoke-market-lottery",validateVoidMarket,customErrorHandler, authorize([string.Admin]),revokeMarket);

    app.get("/api/get-revoke-market",getRevokeMarkets)

    app.post("/api/revoke-live-market",validateRevokeLiveBet, customErrorHandler, authorize([string.Admin]), RevokeLiveMarkets)

  };   