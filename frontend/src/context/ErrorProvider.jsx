import React, { createContext, useState, useCallback, useMemo } from "react";

export const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);

    const showError = useCallback((message) => {
        setError(message);
        setTimeout(() => setError(null), 4000);
    }, []);

    const value = useMemo(() => ({
        error,
        showError
    }), [error, showError]);

    return (
        <ErrorContext.Provider value={value}>
            {children}
        </ErrorContext.Provider>
    );
};