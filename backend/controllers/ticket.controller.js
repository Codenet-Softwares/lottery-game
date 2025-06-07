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
      inactiveGame: false,
      hotGame: false,
    });

    const formatDateTime = (date) =>
      date.toISOString().slice(0, 19).replace("T", " ");

    // Save data to Firestore
    await db.collection("lottery-db").doc(ticket.marketId).set({
        start_time: formatDateTime(ticket.start_time),
        end_time: formatDateTime(ticket.end_time),
        marketName: ticket.marketName,
        date: formatDateTime(ticket.end_time),
        hideMarketUser: ticket.hideMarketUser,
        isActive: ticket.isActive,
        inactiveGame: ticket.inactiveGame,
        hotGame: ticket.hotGame,
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
};
}

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

    const firestoreRef = db.collection("lottery-db").doc(marketId);
    const firestoreDoc = await firestoreRef.get();
    const firestoreData = firestoreDoc.exists ? firestoreDoc.data() : {};

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
    const firestoreUpdates = {};

    const formatDateTime = (date) => {
      // Handle case where date is already in SQL format
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
        return date;
      }
      // Handle Date object or ISO string
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date value');
      }
      return dateObj.toISOString().slice(0, 19).replace("T", " ");
    };

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
      } else if (key === "start_time" || key === "end_time") {
        // Only update time fields in both databases
        const formattedValue = formatDateTime(value);
        updates[key] = value;
        firestoreUpdates[key] = formattedValue;
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

    // if (!firestoreUpdates.start_time) {
    //   firestoreUpdates.start_time =
    //     firestoreData.start_time || formatDateTime(new Date());
    // }
    // if (!firestoreUpdates.end_time) {
    //   firestoreUpdates.end_time =
    //     firestoreData.end_time || formatDateTime(new Date());
    // }

    if (Object.keys(firestoreUpdates).length > 0) {
      await firestoreRef.set(
        { 
          updatedAt: new Date().toISOString(), 
          ...firestoreUpdates 
        },
        { merge: true } // Merge with existing document
      );
    }

    return apiResponseSuccess(
      { ...ticketRange.toJSON(), isUpdate: true },
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const ticketData = await TicketRange.findAll({
      where: {
        date: {
          [Op.gte]: today,
        },
        isVoid: false,
        isWin: false,
        // isActive: true,
        inactiveGame: true
      },
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

    ticketData.sort((a, b) => {
      return (b.hotGame === true) - (a.hotGame === true);
    });

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
