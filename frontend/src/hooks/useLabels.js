import { useContext } from "react";
import { LabelsContext } from "../context/LabelsProvider";

export const useLabels = () => {
    return useContext(LabelsContext);
};