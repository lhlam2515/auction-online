import { Outlet } from "react-router";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export default function RootLayout() {
  return (
    <div className="root-layout">
      <Navbar />

      <main className="container mx-auto min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
