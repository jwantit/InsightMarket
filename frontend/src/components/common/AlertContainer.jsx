import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Alert from "./Alert";

let alertInstance = null;

export const showConfirm = (message) => {
  return new Promise((resolve) => {
    if (alertInstance) {
      alertInstance.showConfirm(message, resolve);
    }
  });
};

export const showAlert = (message, variant = "info") => {
  return new Promise((resolve) => {
    if (alertInstance) {
      alertInstance.showAlert(message, variant, resolve);
    }
  });
};

const AlertContainer = () => {
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    alertInstance = {
      showConfirm: (message, resolve) => {
        setAlertState({
          message,
          type: "confirm",
          variant: "warning",
          onConfirm: () => {
            setAlertState(null);
            resolve(true);
          },
          onCancel: () => {
            setAlertState(null);
            resolve(false);
          },
        });
      },
      showAlert: (message, variant, resolve) => {
        setAlertState({
          message,
          type: "alert",
          variant: variant || "info",
          onConfirm: () => {
            setAlertState(null);
            resolve();
          },
        });
      },
    };

    return () => {
      alertInstance = null;
    };
  }, []);

  if (!alertState) return null;

  return createPortal(
    <Alert
      message={alertState.message}
      type={alertState.type}
      variant={alertState.variant}
      onConfirm={alertState.onConfirm}
      onCancel={alertState.onCancel}
    />,
    document.body
  );
};

export default AlertContainer;

