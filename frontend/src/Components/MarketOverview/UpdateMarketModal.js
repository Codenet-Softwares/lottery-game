import React, { useMemo } from "react";
import { useFormik } from "formik";
import moment from "moment";
import {
  FromToInputEdit,
  ReusableInputEdit,
} from "../ReusableInput/ReusableInput";
import {
  convertTimeToISO,
  generateFilterData,
  generateTimerOptions,
} from "../../Utils/helper";
import { UpdateMarketDetails } from "../../Utils/apiService";
import { initialUpdateMarketFormStates } from "../../Utils/initialState";
import { validationUpdateSchema } from "../../Utils/validationSchema";
import { useAppContext } from "../../contextApi/context";
import "./UpdateMarketModal.css";

const UpdateMarketModal = ({ showModal, closeModal, market, onUpdate }) => {
  const { showLoader, hideLoader } = useAppContext();

  const formik = useFormik({
    initialValues: market
      ? {
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
            ? moment.utc(market.start_time).format("HH:mm A")
            : "",
          timerTo: market?.end_time
            ? moment.utc(market.end_time).format("HH:mm A")
            : "",
        }
      : initialUpdateMarketFormStates, // Fallback initial values if market is null
    validationSchema: validationUpdateSchema,
    onSubmit: async (values) => {
      const unchangedValues = market
        ? {
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
              ? moment.utc(market.start_time).format("HH:mm A")
              : "",
            timerTo: market?.end_time
              ? moment.utc(market.end_time).format("HH:mm A")
              : "",
          }
        : initialUpdateMarketFormStates;

      if (JSON.stringify(values) === JSON.stringify(unchangedValues)) {
        const confirmClose = window.confirm(
          "You have not edited any fields. Are you sure you want to proceed?"
        );
        if (confirmClose) {
          closeModal(); // Close the modal if user confirms
        }
        return;
      }

      showLoader();
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

      // API call to update market details
      const response = await UpdateMarketDetails(requestBody, market?.marketId);

      if (response.success) {
        console.log("Market updated successfully!");
        formik.resetForm(); // not working still there just as in case of fallback
        onUpdate(response.data);
        closeModal(); // Close the modal
      } else {
        console.error("Error updating market:", response.message);
      }

      hideLoader();
    },
  });

  // Generate dropdown options for various fields
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

  const inputConfig = [
    { placeholder: "Select Date", type: "date", name: "date", label: "Date" },
    { placeholder: "Market Name", name: "marketName", label: "Market Name" },
    {
      placeholder: "Price For Each SEM",
      type: "number",
      name: "priceForEach",
      label: "Price For Each SEM",
    },
  ];

  const fromToInputConfig = [
    {
      placeholder: "Group (From - To)",
      fromName: "groupFrom",
      toName: "groupTo",
      options: groupOptions,
      inputType: "number",
      label: "Group Range",
    },
    {
      placeholder: "Series (From - To)",
      fromName: "seriesFrom",
      toName: "seriesTo",
      options: seriesOptions,
      inputType: "text",
      label: "Series Range",
    },
    {
      placeholder: "Number (From - To)",
      fromName: "numberFrom",
      toName: "numberTo",
      options: numberOptions,
      inputType: "number",
      label: "Number Range",
    },
    {
      placeholder: "Enter Timer (hh:mm AM/PM)",
      fromName: "timerFrom",
      toName: "timerTo",
      options: timerOptions,
      inputType: "text",
      label: "Timer Range",
    },
  ];

  return (
    <div>
      {market ? (
        <div
          className={`modal fade update-market-modal ${
            showModal ? "show" : ""
          }`}
          tabIndex="-1"
          aria-labelledby="updateMarketModalLabel"
          aria-hidden={!showModal}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title text-uppercase"
                  id="updateMarketModalLabel"
                >
                  UPDATE <span>{market?.marketName}</span> STATS
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    formik.resetForm(); //  force Reseting form on modal close
                    closeModal();
                  }}
                  title="CLOSE"
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={formik.handleSubmit}>
                  {inputConfig.map((input) => (
                    <ReusableInputEdit
                      key={input.name}
                      label={input.label}
                      placeholder={input.placeholder}
                      type={input.type || "text"}
                      name={input.name}
                      value={formik.values[input.name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched[input.name] && formik.errors[input.name]
                      }
                    />
                  ))}

                  {fromToInputConfig.map((input) => (
                    <FromToInputEdit
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
                        formik.touched[input.fromName] &&
                        formik.errors[input.fromName]
                      } // Show error if touched
                      toError={
                        formik.touched[input.toName] &&
                        formik.errors[input.toName]
                      } // Show error if touched
                      label={input.label}
                      options={input.options}
                    />
                  ))}

                  <div className="text-center mt-3">
                    <button
                      type="submit"
                      className="btn update-button text-white"
                    >
                      UPDATE
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        showModal && (
          <div className="modal fade show loading-modal">Loading...</div>
        )
      )}
    </div>
  );
};

export default UpdateMarketModal;
