import { string } from "../constructor/string.js";
import { deleteliveBet } from "../controllers/deleteGame.controller.js";
import { authorize } from "../middlewares/auth.js";
import { validatedeleteliveBet } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";


export const deleteGameRoute = (app) => {
    app.post(
      "/api/delete-liveBet-lottery",validatedeleteliveBet, customErrorHandler, authorize([string.Admin]), deleteliveBet);
  };