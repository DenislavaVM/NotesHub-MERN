import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

const Layout = () => {
    return (
        <>
            <Navbar />
            <main style={{ position: "relative", zIndex: 1 }}>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;