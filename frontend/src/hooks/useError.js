import { useContext } from "react";
import { ErrorContext } from "../context/ErrorProvider";

export const useError = () => {
    return useContext(ErrorContext);
};