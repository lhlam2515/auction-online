import { Outlet } from "react-router";

import Navbar from "@/components/layout/navbar";

export default function RootLayout() {
  return (
    <div className="root-layout">
      <Navbar />

      <div className="container mx-auto min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
