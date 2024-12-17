import React, { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";

export const generateSeries = (seriesStart, seriesEnd) => {
    const allLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const letters = allLetters.filter(letter => !["I", "F", "O"].includes(letter));
    const startIndex = letters.indexOf(seriesStart);
    const endIndex = letters.indexOf(seriesEnd);

    console.log("start", startIndex, endIndex, seriesStart, seriesEnd);

    // Check if start or end index is invalid or if startIndex is greater than endIndex
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        console.error(
            "Invalid range: ensure the start and end are within the allowed range and in the correct order."
        );
        return null; // or return an empty array `[]` if preferred
    }

    // Return the sliced array based on the start and end indices
    return letters.slice(startIndex, endIndex + 1);
};



// Generate groups within a specified range
export const generateGroups = (start, end) => {
    return Array.from({ length: Math.abs(end - start) + 1 }, (_, i) =>
        (i + start).toString()
    );
};

export const generateNumbers = (start, end) => {
    const actualStart = Math.min(start, end);
    const actualEnd = Math.max(start, end);
    return Array.from(
        { length: actualEnd - actualStart + 1 },
        (_, i) => i + actualStart
    );
};



// ALL NUMBER SERIES & GROUP IS GENERATED FROM THIS SINGLE UNIFIED FUNCTION 

 export const generateFilterData = ({ type, rangeStart, rangeEnd, excludedChars = [] }) => {
    switch (type) {
      case "group":
        return Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => (i + rangeStart).toString().padStart(2, "0"));
  
      case "series":
        return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
          .filter((letter) => !excludedChars.includes(letter));
  
      case "number":
        return Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => (i + rangeStart).toString().padStart(5, "0"));
  
      default:
        return [];
    }
  };


// Helper function to convert time to ISO string
export const convertTimeToISO = (time, date) => {
  if (!time || !date) return null;

  const [hourMin, meridiem] = time.split(" ");
  const [hours, minutes] = hourMin.split(":").map(Number);

  // Convert 12-hour clock to 24-hour clock
  const adjustedHours =
    meridiem === "PM" && hours !== 12
      ? hours + 12
      : hours === 12 && meridiem === "AM"
        ? 0
        : hours;

  // Create a new Date object with the selected date
  const dateTime = new Date(date);
  dateTime.setHours(adjustedHours, minutes, 0, 0);

  dateTime.setHours(dateTime.getHours() + 5, dateTime.getMinutes() + 30);

  // Convert the date-time to UTC (Z) in ISO 8601 format
  return dateTime.toISOString();
};



// helper.js

export const generateTimerOptions = () => {
  const slots = [];
  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  for (let hour = 9; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const slotDate = new Date(istNow);
      slotDate.setHours(hour, minute, 0, 0);

      // Skip past times
      if (slotDate <= istNow) continue;

      const hours12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const meridiem = hour >= 12 ? "PM" : "AM";
      const formattedTime = `${hours12}:${minute < 10 ? "0" + minute : minute} ${meridiem}`;
      slots.push(formattedTime);
    }
  }
  return slots;
};



  

  
  

export function compareDigitsByPlace(num1, num2) {
    const digits1 = num1.toString().padStart(5, '0').split('').reverse(); 
    const digits2 = num2.toString().padStart(5, '0').split('').reverse();

    const result = [];

    for (let i = 0; i < digits1.length; i++) {
        const digit1 = parseInt(digits1[i], 10);
        const digit2 = parseInt(digits2[i], 10);

        // Push the greater digit to the result array
        result.push(Math.max(digit1, digit2));
    }

    return result.reverse(); // Reverse back to match original number order
}

