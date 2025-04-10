import { db } from "../config/firebase.js";
import TicketRange from "../models/ticketRange.model.js";
import { getISTTime } from "./commonMethods.js";


export async function updateLottery() {
    const currentTime = getISTTime(); 

    try {
        const snapshot = await db.collection("lottery-db").get();

        const updatePromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();

            let startTime = data.start_time;
            let endTime = data.end_time;

            if (!startTime || !endTime) {
                console.warn(`Missing start_time or end_time for document: ${doc.id}`);
                return;
            }

            startTime = parseDate(startTime);
            endTime = parseDate(endTime);

            if (!startTime || !endTime || isNaN(startTime) || isNaN(endTime)) {
                console.error(`Invalid date format for document: ${doc.id}`);
                return;
            }

            let updates = {};
            let shouldUpdate = false;

            if (currentTime >= startTime && currentTime <= endTime && !data.isActive) {
                updates.isActive = true;
                updates.hideMarketUser = true;
                updates.inactiveGame = true;
                updates.updatedAt = new Date().toISOString();
                shouldUpdate = true;
            } else if (currentTime > endTime && data.isActive) {
                updates.isActive = false;
                updates.updatedAt = new Date().toISOString();
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                await db.collection("lottery-db").doc(doc.id).update(updates);
            }

            await TicketRange.update(
                {
                    isActive: updates.isActive ?? data.isActive,
                    hideMarketUser: updates.hideMarketUser ?? data.hideMarketUser,
                    inactiveGame: updates.inactiveGame ?? data.inactiveGame,
                    updatedAt: shouldUpdate ? new Date() : data.updatedAt
                },
                {
                    where: { marketId: doc.id },
                }
            );
        });

        await Promise.all(updatePromises);
    } catch (error) {
        console.error("Error updating lottery:", error);
    }
}

function parseDate(dateInput) {
    if (!dateInput) return null;
    if (typeof dateInput === "string") {
        const [datePart, timePart] = dateInput.split(" ");
        if (!datePart || !timePart) return null;
        return new Date(`${datePart}T${timePart}Z`);
    } else if (typeof dateInput === "number") {
        return new Date(dateInput);
    } else if (dateInput instanceof Date) {
        return dateInput;
    } else {
        console.error("Unknown date format:", dateInput);
        return null;
    }
}
