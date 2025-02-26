import { string } from "../constructor/string.js";
import { deleteliveBet, deleteTrash, getTrashBetDetails, getTrashMarket } from "../controllers/deleteGame.controller.js";
import { authorize } from "../middlewares/auth.js";
import {  validateDeleteLiveBet, validateTrashMarket, validateTrashMarketId } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";


export const deleteGameRoute = (app) => {
      app.post("/api/delete-liveBet-lottery",validateDeleteLiveBet, customErrorHandler, authorize([string.Admin]), deleteliveBet);

      app.get('/api/get-trash-market', authorize([string.Admin]), getTrashMarket);

      app.get('/api/get-trash-bet/:marketId', validateTrashMarketId, customErrorHandler, authorize([string.Admin]), getTrashBetDetails);

      app.delete('/api/delete-trash/:trashMarketId', validateTrashMarket, customErrorHandler, authorize([string.Admin]), deleteTrash)

  };