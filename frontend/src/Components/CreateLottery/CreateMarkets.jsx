import React, { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { validationSchema } from "../../Utils/validationSchema";
import { initialCreateMarketFormStates } from "../../Utils/initialState";
import { FromToInput, ReusableInput } from "../ReusableInput/ReusableInput";
import {
  convertTimeToISO,
  generateFilterData,
  generateTimerOptions,
} from "../../Utils/helper";
import { generateLotteryNumber } from "../../Utils/apiService";
import { useAppContext } from "../../contextApi/context";

const CreateMarkets = () => {
  const { showLoader, hideLoader } = useAppContext();

  const formik = useFormik({
    initialValues: initialCreateMarketFormStates,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      showLoader(); // Show loader before the request
      const startTimeISO = convertTimeToISO(values.timerFrom, values.date);
      const endTimeISO = convertTimeToISO(values.timerTo, values.date);

      const requestBody = {
        date: new Date(values.date).toISOString(),
        marketName: values.marketName,
        group: {
          min: parseInt(values.groupFrom, 10),
          max: parseInt(values.groupTo, 10),
        },
        series: { start: values.seriesFrom, end: values.seriesTo },
        number: { min: values.numberFrom, max: values.numberTo },
        start_time: startTimeISO,
        end_time: endTimeISO,
        price: parseFloat(values.priceForEach),
      };
      try {
        const response = await generateLotteryNumber(requestBody);
        if (response.success) {
          console.log("Market created successfully!");
          formik.resetForm();
        } else {
          console.error("Error creating market:", response.message);
        }
      } catch (error) {
        console.error("Error during the API request:", error);
      } finally {
        hideLoader(); // Hide loader after the request completes
      }
    },
  });

  const groupOptions = useMemo(
    () => generateFilterData({ type: "group", rangeStart: 1, rangeEnd: 99 }),
    []
  );
  const seriesOptions = useMemo(
    () => generateFilterData({ type: "series", excludedChars: "I , F , O" }),
    []
  );
  const numberOptions = useMemo(
    () =>
      generateFilterData({ type: "number", rangeStart: 1, rangeEnd: 99999 }),
    []
  );
  const timerOptions = useMemo(() => generateTimerOptions(), []);

  useEffect(() => {
    formik.setFieldValue("groupOptions", groupOptions);
    formik.setFieldValue("seriesOptions", seriesOptions);
    formik.setFieldValue("numberOptions", numberOptions);
  }, [groupOptions, seriesOptions, numberOptions]);

  const inputConfig = [
    { placeholder: "SELECT DATE", type: "date", name: "date" },
    { placeholder: "MARKET NAME", name: "marketName" },
    { placeholder: "PRICE FOR EACH SEM", type: "number", name: "priceForEach" },
  ];

  const fromToInputConfig = [
    {
      placeholder: "GROUP (FROM - TO)",
      fromName: "groupFrom",
      toName: "groupTo",
      options: groupOptions,
      inputType: "number",
    },
    {
      placeholder: "SERIES (FROM - TO)",
      fromName: "seriesFrom",
      toName: "seriesTo",
      options: seriesOptions,
      inputType: "text",
    },
    {
      placeholder: "NUMBER (FROM - TO)",
      fromName: "numberFrom",
      toName: "numberTo",
      options: numberOptions,
      inputType: "number",
    },
    {
      placeholder: "ENTER TIMER (HH:MM AM/PM)",
      fromName: "timerFrom",
      toName: "timerTo",
      options: timerOptions,
      inputType: "text",
    },
  ];

  return (
    <div className="d-flex align-items-center justify-content-center mt-5 ">
      <div
        className="container mt-3 p-4 shadow rounded border"
        style={{
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
          maxWidth: "900px",
          position: "relative",
          // background:"linear-gradient(135deg, #f0f9ff, #cce7f6)"
        }}
      >
        <h3 className="text-center mb-4 fw-bold">CREATE LOTTERY MARKETS</h3>
        <form onSubmit={formik.handleSubmit}>
          {inputConfig.map((input) => (
            <ReusableInput
              key={input.name}
              placeholder={input.placeholder}
              type={input.type || "text"}
              name={input.name}
              value={formik.values[input.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[input.name] && formik.errors[input.name]}
            />
          ))}

          {fromToInputConfig.map((input) => (
            <FromToInput
              key={input.fromName}
              placeholder={input.placeholder}
              inputType={input.inputType}
              fromName={input.fromName}
              toName={input.toName}
              fromValue={formik.values[input.fromName]}
              toValue={formik.values[input.toName]}
              onChangeFrom={formik.handleChange}
              onChangeTo={formik.handleChange}
              onBlur={formik.handleBlur}
              fromError={
                formik.touched[input.fromName] && formik.errors[input.fromName]
              } // Show error if touched
              toError={
                formik.touched[input.toName] && formik.errors[input.toName]
              } // Show error if touched
              options={input.options}
            />
          ))}

          <div
            className="text-center mt-3"
            style={
              {
                // position: "relative",
              }
            }
          >
            <button
              type="submit"
              className="btn btn-primary px-4"
              style={{
                background: "#284B63",
                position: "absolute",
                bottom: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              Create Market
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMarkets;
