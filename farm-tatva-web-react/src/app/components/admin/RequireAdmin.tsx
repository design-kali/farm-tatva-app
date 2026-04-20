import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { readStoredSession, isAdminSession } from "@/app/lib/auth";

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation();
  const session = readStoredSession();

  if (!isAdminSession(session)) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
