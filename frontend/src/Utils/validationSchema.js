import * as Yup from "yup";

export const validationSchema = Yup.object({
  date: Yup.string()
    .required("Date is required")
    .test("future-date", "Date cannot be in the past", function (value) {
      if (!value) return true; // Skip validation if no date is provided
      const selectedDate = new Date(value); // Parse the user-selected date
      const today = new Date(); // Get the current date
      today.setHours(0, 0, 0, 0); // Set the current date to midnight for accurate comparison
      return selectedDate >= today; // Ensure the selected date is today or in the future
    }),

  marketName: Yup.string()
    .matches(
      /^[a-zA-Z0-9.:\s]+$/,
      "Market name can only contain letters, numbers,  spaces and dot (.,:)"
    )
    .required("Market name is required"),

  groupFrom: Yup.number().required("Group From is required"),
  groupTo: Yup.number()
    .required("Group To is required")
    .test(
      "greater-group",
      "Group From should be less than Group To",
      function (value) {
        const { groupFrom } = this.parent;
        if (!value || !groupFrom) return true;
        return groupFrom < value;
      }
    )
    .test(
      "no-same-group",
      "Group From and Group To cannot be the same",
      function (value) {
        const { groupFrom } = this.parent;
        if (!value || !groupFrom) return true;
        return groupFrom !== value;
      }
    ),

  seriesFrom: Yup.string()
    .required("Series From is required")
    .test("valid-series", "Invalid series selection", function (value) {
      return /^[A-Za-z]+$/.test(value);
    }),
  seriesTo: Yup.string()
    .required("Series To is required")
    .test(
      "valid-series-range",
      "Series To should be at least 10 letters greater than Series From",
      function (value) {
        const { seriesFrom } = this.parent;
        if (!value || !seriesFrom) return true;

        const diff = value.charCodeAt(0) - seriesFrom.charCodeAt(0);
        return diff >= 10; // Minimum 10 series difference
      }
    )
    .test(
      "no-same-series",
      "Series From and Series To cannot be the same",
      function (value) {
        const { seriesFrom } = this.parent;
        if (!value || !seriesFrom) return true;
        return seriesFrom !== value;
      }
    ),

  numberFrom: Yup.number().required("Number From is required"),
  numberTo: Yup.number()
    .required("Number To is required")
    .test(
      "greater-number",
      "Number To should be greater than Number From",
      function (value) {
        const { numberFrom } = this.parent;
        if (!numberFrom) {
          // If numberFrom is missing, don't run the greater-than validation
          return true;
        }
        return value > numberFrom;
      }
    )
    .test(
      "no-same-number",
      "Number From and Number To cannot be the same",
      function (value) {
        const { numberFrom } = this.parent;
        if (!value || !numberFrom) return true;
        return numberFrom !== value;
      }
    ),

  timerFrom: Yup.string().required("Timer From is required"),
  // timerTo: Yup.string()
  //   .required("Timer To is required")
  //   .test(
  //     "valid-timer-range",
  //     "Timer To should be greater than Timer From",
  //     function (value) {
  //       const { timerFrom } = this.parent;
  //       if (!value || !timerFrom) return true;

  //       return value > timerFrom; // Ensuring logical range
  //     }
  //   ),

  timerTo: Yup.string()
  .required("Timer To is required")
  .test(
    "valid-timer-range",
    "Timer To should be greater than Timer From",
    function (value) {
      const { timerFrom } = this.parent;

      if (!value || !timerFrom) return true; // Skip validation if either field is missing

      // Helper function to convert time strings to comparable Date objects
      const parseTime = (time) => {
        const match = time.match(/(\d+):(\d+)\s?(AM|PM)/i);
        if (!match) return null; // Return null if the time string is invalid
        const [hour, minute, meridian] = match.slice(1);
        let hours = parseInt(hour, 10);
        if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
        return new Date(0, 0, 0, hours, parseInt(minute, 10)); // Date set to a baseline date for comparison
      };

      const startTime = parseTime(timerFrom);
      const endTime = parseTime(value);
   // Ensure both times are valid before comparing
      if (!startTime || !endTime) return false;

      // Check if "Timer To" is logically after "Timer From"
      return endTime > startTime;
    }
  ),

  priceForEach: Yup.number().required("Price is required"),
});


export const resetPasswordSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required("Old password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .notOneOf([Yup.ref("oldPassword"), null], "New password cannot be the same as the old password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

