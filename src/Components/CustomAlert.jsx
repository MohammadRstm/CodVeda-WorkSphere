import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa"; 
import "./CustomAlert.css";

export function CustomAlert({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`custom-alert custom-alert-${type}`}>
      <span className="alert-message">{message}</span>
      <button className="custom-alert-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
}
