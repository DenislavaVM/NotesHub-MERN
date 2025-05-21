import React from "react";
import "./NoteSkeleton.css";

const NoteSkeleton = () => {
    return (
        <div className="note-card skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-content"></div>
            <div className="skeleton-tags"></div>
        </div>
    );
};

export default NoteSkeleton;