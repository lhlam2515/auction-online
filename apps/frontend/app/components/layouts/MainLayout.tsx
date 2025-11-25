import { Outlet } from "react-router";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      {/* Add Header/Footer specific to this layout */}
      {children || <Outlet />}
    </div>
  );
}
