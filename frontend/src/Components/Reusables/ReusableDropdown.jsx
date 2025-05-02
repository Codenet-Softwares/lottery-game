import React, { useState, useCallback, useRef } from "react";
import { Form, InputGroup, Dropdown } from "react-bootstrap";
import { FixedSizeGrid as Grid } from "react-window";
import "./ReusableDropdown.css";
import useDebounce from "./useDebounce";


const COLUMN_COUNT = 3;

const ReusableDropdown = ({
  label,
  options = [],
  name,
  onSelect,
  error,
  touched,
}) => {
  const [state, setState] = useState({
    search: "",
    selected: "",
    showDropdown: false,
  });

  const inputRef = useRef(null);
  const debouncedSearch = useDebounce(state.search, 300);

  const filteredOptions =
    typeof debouncedSearch === "string"
      ? options.filter((option) =>
          option
            .toString()
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        )
      : options;

  const handleSelect = useCallback(
    (option) => {
      setState((prev) => ({
        ...prev,
        search: option,
        selected: option,
        showDropdown: false,
      }));
      onSelect(option);
    },
    [onSelect]
  );

  const columnWidth = inputRef.current
    ? inputRef.current.offsetWidth / COLUMN_COUNT
    : 80;
  const rowCount = Math.ceil(filteredOptions.length / COLUMN_COUNT);

  return (
    <div className="dropdown-container">
      <InputGroup>
        <Form.Control
          ref={inputRef}
          type="text"
          className={`dropdown-input ${touched && error ? "is-invalid" : ""}`} // Red border on error
          placeholder={`Select ${name}`} // Placeholder instead of label
          value={state.search}
          onChange={(e) => {
            const value = e.target.value;
            setState((prev) => ({
              ...prev,
              search: value,
              selected: value ? prev.selected : "", // Clear selection if empty
              showDropdown: true,
            }));

            // Remove validation error when user types
            if (value) {
              onSelect(value);
            } else {
              onSelect(null); // Notify parent of empty value
            }
          }}
          onFocus={() => setState((prev) => ({ ...prev, showDropdown: true }))}
          onBlur={() =>
            setTimeout(
              () => setState((prev) => ({ ...prev, showDropdown: false })),
              200
            )
          }
        />
      </InputGroup>

      {state?.showDropdown && (
        <Dropdown.Menu show className="dropdown-menu text-center">
          <div className="dropdown-grid-container">
            {filteredOptions?.length > 0 ? (
              <Grid
                columnCount={COLUMN_COUNT}
                columnWidth={columnWidth}
                height={150}
                rowCount={rowCount}
                rowHeight={35}
                width={inputRef.current ? inputRef.current.offsetWidth : 250}
                className="grid-list"
              >
                {({ rowIndex, columnIndex, style }) => {
                  const itemIndex = rowIndex * COLUMN_COUNT + columnIndex;
                  if (itemIndex >= filteredOptions.length) return null;

                  return (
                    <Dropdown.Item
                      style={style}
                      onMouseDown={() =>
                        handleSelect(filteredOptions[itemIndex])
                      }
                      className="dropdown-item"
                    >
                      {filteredOptions[itemIndex]}
                    </Dropdown.Item>
                  );
                }}
              </Grid>
            ) : (
              <div className="no-matched-data">No Matched Data Found</div>
            )}
          </div>
        </Dropdown.Menu>
      )}
      {/* Error Message with Fixed Space */}
      <div className="dropdown-error fw-bold">
        {touched && error && (
          <div className="d-flex align-items-center gap-1 ">
            <i className="bi bi-info-circle"></i>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusableDropdown;
