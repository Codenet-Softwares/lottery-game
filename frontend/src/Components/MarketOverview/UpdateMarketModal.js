import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import moment from "moment";
import { FromToInput, ReusableInput } from "../ReusableInput/ReusableInput";
import {
  convertTimeToISO,
  generateFilterData,
  generateTimerOptions,
} from "../../Utils/helper";
import { UpdateMarketDetails } from "../../Utils/apiService";
import { initialUpdateMarketFormStates } from "../../Utils/initialState";
import { validationUpdateSchema } from "../../Utils/validationSchema";
import { useAppContext } from "../../contextApi/context";

const UpdateMarketModal = ({ showModal, closeModal, market }) => {
  const { showLoader, hideLoader } = useAppContext();

  const formik = useFormik({
    initialValues: initialUpdateMarketFormStates,
    validationSchema: validationUpdateSchema,
    onSubmit: async (values) => {
      showLoader();
      const startTimeISO = convertTimeToISO(values.timerFrom, values.date);
      const endTimeISO = convertTimeToISO(values.timerTo, values.date);

      const requestBody = {
        marketId: market?.marketId, // Market ID added in API request
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
        const response = await UpdateMarketDetails(requestBody);
        if (response.success) {
          console.log("Market updated successfully!");
        //   formik.resetForm();
        } else {
          console.error("Error updating market:", response.message);
        }
      } catch (error) {
        console.error("Error during API request:", error);
      } finally {
        hideLoader();
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
    { placeholder: "Select Date", type: "date", name: "date" },
    { placeholder: "Market Name", name: "marketName" },
    { placeholder: "Price For Each SEM", type: "number", name: "priceForEach" },
  ];

  const fromToInputConfig = [
    {
      placeholder: "Group (From - To)",
      fromName: "groupFrom",
      toName: "groupTo",
      options: groupOptions,
    },
    {
      placeholder: "Series (From - To)",
      fromName: "seriesFrom",
      toName: "seriesTo",
      options: seriesOptions,
    },
    {
      placeholder: "Number (From - To)",
      fromName: "numberFrom",
      toName: "numberTo",
      options: numberOptions,
    },
    {
      placeholder: "Enter Timer (hh:mm AM/PM)",
      fromName: "timerFrom",
      toName: "timerTo",
      options: timerOptions,
    },
  ];
  useEffect(() => {
    if (market) {
      formik.setValues({
        marketName: market?.marketName || "",
        date: market?.date ? moment(market.date).format("YYYY-MM-DD") : "",
        priceForEach: market?.price || "",
        groupFrom: market?.group_start || "",
        groupTo: market?.group_end || "",
        seriesFrom: market?.series_start || "",
        seriesTo: market?.series_end || "",
        numberFrom: market?.number_start || "",
        numberTo: market?.number_end || "",
        timerFrom: market?.start_time
          ? moment.utc(market.start_time).format("HH:mm")
          : "",
        timerTo: market?.end_time
          ? moment.utc(market.end_time).format("HH:mm")
          : "",
      });
    }
  }, [market]);

  return (
    <div>
      {market ? (
        <div
          className={`modal fade ${showModal ? "show" : ""}`}
          style={{ display: showModal ? "block" : "none" }}
          tabIndex="-1"
          aria-labelledby="updateMarketModalLabel"
          aria-hidden={!showModal}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="updateMarketModalLabel">
                  Update Market Stats for {market?.marketName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
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
                        error={
                          formik.touched[input.name] &&
                          formik.errors[input.name]
                        }
                      />
                    ))}

                    {fromToInputConfig.map((input) => (
                      <FromToInput
                        key={input.fromName}
                        placeholder={input.placeholder}
                        fromName={input.fromName}
                        toName={input.toName}
                        fromValue={formik.values[input.fromName]}
                        toValue={formik.values[input.toName]}
                        onChangeFrom={formik.handleChange}
                        onChangeTo={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fromError={
                          formik.touched[input.fromName] &&
                          formik.errors[input.fromName]
                        } // Show error if touched
                        toError={
                          formik.touched[input.toName] &&
                          formik.errors[input.toName]
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
                          background: "#4682B4",
                          position: "absolute",
                          bottom: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        update
                      </button>
                    </div>
                  </form>
             
              </div>
            </div>
          </div>
        </div>
      ) : (
        showModal && (
          <div className="modal fade show" style={{ display: "block" }}>
            Loading...
          </div>
        )
      )}
    </div>
  );
};

export default UpdateMarketModal;
