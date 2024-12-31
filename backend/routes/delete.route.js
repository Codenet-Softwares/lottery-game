import { string } from "../constructor/string.js";
import { deleteliveBet } from "../controllers/deleteGame.controller.js";
import { authorize } from "../middlewares/auth.js";


export const deleteGameRoute = (app) => {
    app.post(
      "/api/delete-liveBet-lottery",authorize([string.Admin]),deleteliveBet);
  };