import { string } from "../constructor/string.js";
import { deleteBetAfterWin, deleteliveBet, deleteTrash, getTrashBetDetails, getTrashMarket } from "../controllers/deleteGame.controller.js";
import { authorize } from "../middlewares/auth.js";
import {  validateDeleteLiveBet, validateTrashMarket, validateTrashMarketId } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";


export const deleteGameRoute = (app) => {
      app.post("/api/delete-liveBet-lottery",validateDeleteLiveBet, customErrorHandler, authorize([string.Admin]), deleteliveBet);

      app.post("/api/delete-Bet-afterWin-lottery", deleteBetAfterWin);

      app.get('/api/get-trash-market', authorize([string.Admin]), getTrashMarket);

      app.get('/api/get-trash-bet/:marketId', validateTrashMarketId, customErrorHandler, authorize([string.Admin]), getTrashBetDetails);

      app.delete('/api/delete-trash/:trashMarketId', validateTrashMarket, customErrorHandler, authorize([string.Admin]), deleteTrash)

  };