import React from "react";

interface SuccessMessageProps {
  onStartOver: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onStartOver }) => {
  return (
    <div className="success-message">
      <div className="success-icon">✓</div>

      <h2>Appointment Requested Successfully!</h2>

      <p>
        Your appointment request has been submitted. You will receive a
        confirmation email shortly with the details of your appointment.
      </p>

      <p>
        Fr. Youhanna Makin will review your request and confirm the appointment
        as soon as possible. If there are any issues, you will be contacted via
        the email address you provided.
      </p>

      <p className="note">
        <strong>Note:</strong> Please check your spam/junk folder if you don't
        see the confirmation email in your inbox.
      </p>

      <div className="success-actions">
        <button onClick={onStartOver}>Book Another Appointment</button>
      </div>
    </div>
  );
};

export default SuccessMessage;
