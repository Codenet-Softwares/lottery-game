import * as Yup from "yup";

export const validationSchema = Yup.object({
  marketName: Yup.string()
    .matches(
      /^[a-zA-Z0-9.:\s]+$/,
      "Market name can only contain letters, numbers,  spaces and dot (.,:)"
    )
    .max(30, "Market name cannot exceed 20 characters") // Maximum 30 characters
    .required("Market Name Is Required"),

  groupFrom: Yup.number()
    .required("Group From Is Required")
    .test(
      "max-digits",
      "Group From cannot have more than 2 digits",
      (value) => !value || value.toString().length <= 2
    ),
  groupTo: Yup.number()
    .required("Group To Is Required")
    .test(
      "max-digits",
      "Group To cannot have more than 2 digits",
      (value) => !value || value.toString().length <= 2
    )
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
    .required("Series From Is Required")
    .matches(/^[A-Za-z]$/, "Series From must be exactly one letter(A-Z)") // Ensure only one letter
    .test("valid-series", "Invalid series selection", function (value) {
      return /^[A-Za-z]$/.test(value);
    }),
  seriesTo: Yup.string()
    .required("Series To Is Required")
    .matches(/^[A-Za-z]$/, "Series To must be exactly one letter(A-z)")
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

  numberFrom: Yup.number()
    .required("Number From Is Required")
    .test(
      "max-digits",
      "Number From cannot have more than 5 digits",
      (value) => !value || value.toString().length <= 5 // Check for maximum 5 digits
    ),
  numberTo: Yup.number()
    .required("Number To Is Required")
    .test(
      "max-digits",
      "Number To cannot have more than 5 digits",
      (value) => !value || value.toString().length <= 5 // Check for maximum 5 digits
    )
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

  timerFrom: Yup.string()
    .required("Timer From is required")
    .test(
      "future-timer-from",
      "Timer From cannot be in the past",
      function (value) {
        if (!value) return true;
        const now = new Date();
        const selected = new Date(value);
        return selected > now;
      }
    ),

  timerTo: Yup.string()
    .required("Timer To is required")
    .test(
      "future-timer-to",
      "Timer To cannot be in the past",
      function (value) {
        if (!value) return true;
        const now = new Date();
        const selected = new Date(value);
        return selected > now;
      }
    )
    .test(
      "valid-timer-range",
      "Timer To must be greater than Timer From",
      function (value) {
        const { timerFrom } = this.parent;
        if (!timerFrom || !value) return true;
        const from = new Date(timerFrom);
        const to = new Date(value);
        return to > from;
      }
    ),

  priceForEach: Yup.number()
    .required("Price Is Required")
    .moreThan(0, "Price Must Be Greater Than 0")
    .test(
      "Max-Value",
      "Price Cannot Exceed 1 Lakh (100,000)",
      (value) => value <= 100000
    ),
});
export const validationUpdateSchema = Yup.object({
  date: Yup.string()
    .required("Date Is Required")
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
    .max(20, "Market name cannot exceed 20 characters")
    .required("Market name Is Required"),

  groupFrom: Yup.number()
    .required("Group From Is Required")
    .test(
      "max-digits",
      "Group From cannot have more than 2 digits",
      (value) => !value || value.toString().length <= 2
    ),
  groupTo: Yup.number()
    .required("Group To Is Required")
    .test(
      "max-digits",
      "Group To cannot have more than 2 digits",
      (value) => !value || value.toString().length <= 2
    )
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
    .required("Series From Is Required")
    .matches(/^[A-Za-z]$/, "Series From must be exactly one letter(A-Z)")
    .test("valid-series", "Invalid series selection", function (value) {
      return /^[A-Za-z]$/.test(value);
    }),
  seriesTo: Yup.string()
    .required("Series To Is Required")
    .matches(/^[A-Za-z]$/, "Series To must be exactly one letter(A-z)")
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

  numberFrom: Yup.number()
    .required("Number From Is Required")
    .test(
      "max-digits",
      "Number From cannot have more than 5 digits",
      (value) => !value || value.toString().length <= 5 // Check for maximum 5 digits
    ),
  numberTo: Yup.number()
    .required("Number To Is Required")
    .test(
      "max-digits",
      "Number To cannot have more than 5 digits",
      (value) => !value || value.toString().length <= 5 // Check for maximum 5 digits
    )
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

  timerFrom: Yup.string().required("Timer From Is Required"),

  timerTo: Yup.string()
    .required("Timer To Is Required")

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

  priceForEach: Yup.number()
    .required("Price Is Required")
    .test(
      "max-value",
      "Price cannot exceed 1 lakh (100,000)",
      (value) => value <= 100000 // Maximum value of 1 lakh
    ),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password Is Required")
    .min(8, "New password must be at least 8 characters")
    .notOneOf(
      [Yup.ref("oldPassword"), null],
      "New password cannot be the same as the old password"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password Is Required"),
});

export const createSubadminSchema = Yup.object({
  userName: Yup.string()
    .required("Username Is Required")
    .min(4, "Must be at least 4 characters"),
  password: Yup.string()
    .required("Password Is Required")
    .min(8, "Password must be at least 8 characters"),
  permissions: Yup.array()
    .min(3, "You Need To Select All Permission")
    .required("Permissions Are Required"),
});
export const resetPasswordSchemaSubAdmin = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password Is Required")
    .notOneOf(
      [Yup.ref("oldPassword"), null],
      "New password cannot be the same as the old password"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password Is Required"),
});
