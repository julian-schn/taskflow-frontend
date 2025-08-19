// src/components/TaskModal.js
import React from "react";
import './TaskModal.css';
import { ReactComponent as CloseIcon } from '../assets/close.svg';

const TaskModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close details"
        >
          <CloseIcon className="modal-close-icon" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default TaskModal;