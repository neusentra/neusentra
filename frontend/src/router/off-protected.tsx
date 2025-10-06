import { useAuth } from "@/providers";
import { Navigate, Outlet } from "react-router";

export default function OffProtectedRoute() {
    const { isAuthenticated, isInitialized } = useAuth();

    if (!isInitialized) {
        return <>Loading...</>;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}