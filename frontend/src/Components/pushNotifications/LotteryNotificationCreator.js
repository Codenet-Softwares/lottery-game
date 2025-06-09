import React, { useState } from "react";

import "./LotteryNotificationCreator.css";
import { createLotteryNotification } from "../../Utils/apiService";
import { useAppContext } from "../../contextApi/context";

const LotteryNotificationCreator = () => {
  const { store } = useAppContext();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Both title and message are required");
      setResponse(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await createLotteryNotification({
        title: formData.title,
        message: formData.message,
      });

      if (res && res.success) {
        setResponse("Lottery notifications sent successfully!");
        setFormData({ title: "", message: "" });
      } else {
        setError("Failed to send notifications");
      }
    } catch (err) {
      setError("An error occurred while sending notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lottery-notification-container">
      <h2 className="lottery-notification-heading">
        <i className="fas fa-ticket-alt"></i> Lottery Notification
      </h2>

      <form onSubmit={handleSubmit} className="lottery-notification-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notification title"
            maxLength={50}
            className="form-control"
          />
          <div className="character-count">
            {formData.title.length}/50 characters
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter notification message"
            rows={4}
            maxLength={200}
            className="form-control"
          />
          <div className="character-count">
            {formData.message.length}/200 characters
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Sending...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i> Send Notification
            </>
          )}
        </button>
      </form>

      {response && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i> {response}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}
    </div>
  );
};

export default LotteryNotificationCreator;
