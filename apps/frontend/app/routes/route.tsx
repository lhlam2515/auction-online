import { Navigate } from "react-router";

import { APP_ROUTES } from "@/constants/routes";

export default function CatchAll() {
  return <Navigate to={APP_ROUTES.NOT_FOUND} replace />;
}
