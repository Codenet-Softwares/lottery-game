import { db } from "../config/firebase.js";

// Helper function to delete a lottery by ID
export async function deleteLotteryFromFirebase(marketId) {
  try {
    const docRef = db.collection("lottery-db").doc(marketId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.log(`No document found with ID: ${marketId}`);
      return;
    }

    await docRef.delete();
    console.log(`Deleted Firebase lottery document with ID: ${marketId}`);
  } catch (error) {
    console.error(`Error deleting lottery from Firebase: ${error}`);
  }
}