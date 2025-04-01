import { Op } from "sequelize";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import TicketRange from "../models/ticketRange.model.js";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/firebase.js";

export const saveTicketRange = async (req, res) => {
  try {
    const {
      group,
      series,
      number,
      start_time,
      end_time,
      marketName,
      date,
      price,
    } = req.body;

    const currentDate = new Date();
    const providedDate = new Date(date);

    if (providedDate < currentDate.setHours(0, 0, 0, 0)) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "The date must be today or in the future.",
        res
      );
    }

    const existingMarket = await TicketRange.findOne({
      where: {
        marketName,
        date: providedDate,
      },
    });

    if (existingMarket) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "A market with this name already exists for the selected date.",
        res
      );
    }

    const ticket = await TicketRange.create({
      marketId: uuidv4(),
      group_start: group.min,
      group_end: group.max,
      series_start: series.start,
      series_end: series.end,
      number_start: number.min,
      number_end: number.max,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      marketName,
      date: providedDate,
      price,
      hideMarketUser: false,
      isActive: false,
    });

    const formatDateTime = (date) =>
      date.toISOString().slice(0, 19).replace("T", " ");

    // Save data to Firestore
    await db
      .collection("lottery")
      .doc(ticket.marketId)
      .set({
        start_time: formatDateTime(ticket.start_time),
        end_time: formatDateTime(ticket.end_time),
        marketName: ticket.marketName,
        date: formatDateTime(ticket.end_time),
        hideMarketUser: ticket.hideMarketUser,
        isActive: ticket.isActive,
        price: ticket.price,
        group_start: ticket.group_start,
        group_end: ticket.group_end,
        series_start: ticket.series_start,
        series_end: ticket.series_end,
        number_start: ticket.number_start,
        number_end: ticket.number_end,
      });

    return apiResponseSuccess(
      ticket,
      true,
      statusCode.create,
      "Ticket range generated successfully",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const updateMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const updatedFields = req.body;

    const ticketRange = await TicketRange.findOne({ where: { marketId } });

    if (!ticketRange) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Market not found with the provided marketId.",
        res
      );
    }

    const allowedFields = [
      "group",
      "series",
      "number",
      "start_time",
      "end_time",
      "marketName",
      "date",
      "price",
    ];
    const updates = { isUpdate: true }; // Set isUpdate to true when API is hit
    // const firestoreUpdates = {};

    for (const [key, value] of Object.entries(updatedFields)) {
      if (!allowedFields.includes(key)) continue;

      if (["group", "number"].includes(key)) {
        const { min, max } = value || {};
        if (min === undefined || max === undefined) {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            `${key} must have both min and max values.`,
            res
          );
        }
        updates[`${key}_start`] = min;
        updates[`${key}_end`] = max;
        // firestoreUpdates[`${key}_start`] = min;
        // firestoreUpdates[`${key}_end`] = max;
      } else if (key === "series") {
        const { start, end } = value || {};
        if (start === undefined || end === undefined) {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Series must have both start and end values.",
            res
          );
        }
        updates[`${key}_start`] = start;
        updates[`${key}_end`] = end;
        // firestoreUpdates[`${key}_start`] = start;
        // firestoreUpdates[`${key}_end`] = end;
      } else {
        updates[key] = value;
        // firestoreUpdates[key] = value;
      }
    }

    if (Object.keys(updates).length === 1) {
      // Only contains isUpdate if no valid fields are provided
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "No valid fields provided for update.",
        res
      );
    }

    await ticketRange.update(updates);

    const firestoreRef = db.collection("lottery").doc(marketId);
    await firestoreRef.set({updatedAt: new Date()});

    return apiResponseSuccess(
      { ...ticketRange.toJSON(), isUpdate: true }, // Send updated data
      true,
      statusCode.success,
      "Lottery market updated successfully.",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const geTicketRange = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { search = "" } = req.query;
    const whereCondition = {
      date: {
        [Op.gte]: today,
      },
      isWin: false,
      isVoid: false,
    };

    if (search) {
      whereCondition.marketName = {
        [Op.like]: `%${search}%`,
      };
    }
    const ticketData = await TicketRange.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    return apiResponseSuccess(
      ticketData,
      true,
      statusCode.success,
      "Success",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const geTicketRangeExternal = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { search = "" } = req.query;
    const whereCondition = {
      date: {
        [Op.gte]: today,
      },
      isWin: false,
      isVoid: false,
      inactiveGame: true,
    };

    if (search) {
      whereCondition.marketName = {
        [Op.like]: `%${search}%`,
      };
    }
    const ticketData = await TicketRange.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    return apiResponseSuccess(
      ticketData,
      true,
      statusCode.success,
      "Success",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const getIsactiveMarket = async (req, res) => {
  try {
    const ticketData = await TicketRange.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
    });
    if (!ticketData) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Ticket not Found",
        res
      );
    }

    return apiResponseSuccess(
      ticketData,
      true,
      statusCode.success,
      "Success",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};
