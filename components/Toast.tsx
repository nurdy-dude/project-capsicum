import React, { useEffect } from 'react';

interface ToastProps {
    message: string | null;
    onClear: () => void;
}

export const Toast = ({ message, onClear }: ToastProps) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClear();
            }, 3000); // Display toast for 3 seconds

            return () => clearTimeout(timer);
        }
    }, [message, onClear]);

    if (!message) {
        return null;
    }

    return (
        <div className="toast-notification">
            {message}
        </div>
    );
};