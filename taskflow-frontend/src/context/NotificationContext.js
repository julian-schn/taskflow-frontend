import React, { createContext, useContext, useState, useCallback } from 'react';
import './NotificationContext.css';

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showNotification = useCallback((msg, duration = 4000) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {visible && (
        <div className="notification-banner">
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
