import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F5EE] flex">
      {/* Sidebar - Fixed Position */}
      <Sidebar />

      {/* Main Content Area - Shifted Right */}
      <div className="flex-1 flex flex-col pl-[240px] min-h-screen">
        <Header />

        {/* Generous Padding and Whitespace Page Area */}
        <main className="p-8 flex-1 flex flex-col space-y-8 max-w-[1600px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default MainLayout;
