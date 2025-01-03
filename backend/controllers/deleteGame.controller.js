import axios from "axios";
import PurchaseLottery from "../models/purchase.model.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import sequelize from "../config/db.js";
import { v4 as UUIDV4 } from "uuid";
import jwt from "jsonwebtoken";
import LotteryTrash from "../models/trash.model.js";

export const deleteliveBet = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const token = jwt.sign(
          { role: req.user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    const { purchaseId } = req.body;
    const livePurchaseId = await PurchaseLottery.findOne({
      where: { purchaseId }
    });
    if (!livePurchaseId) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "PurchaseId Not Found",
        res
      );
    }
    const baseURL = process.env.COLOR_GAME_URL;

    const response = await axios.post(
      `${baseURL}/api/external/delete-liveMarket-lottery`,
      {
        marketId: livePurchaseId.marketId,
        userId: livePurchaseId.userId,
        price: livePurchaseId.lotteryPrice,
        
      },
      { headers }
    );

    if (!response.data.success) {
      return res
        .status(statusCode.badRequest) 
        .json(response.data);
    }
    
    await LotteryTrash.create(
      {
        trashMarkets: [livePurchaseId.dataValues],
        trashMarketId: UUIDV4(),
      },
      { transaction }
    );

    await PurchaseLottery.destroy({
      where: { purchaseId },
    });

    await transaction.commit();

    return apiResponseSuccess(
      livePurchaseId,
      true,
      statusCode.success,
      "Balances updated successfully and market Deleted",
      res
    );
  } catch (error) {
    await transaction.rollback();
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};
