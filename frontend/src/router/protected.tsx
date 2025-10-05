import type { Role, User } from "@/types";
import { useAuth } from "@/providers";
import { Outlet } from "react-router";

interface ProtectedRoute {
    allowedRoles?: User['role'][];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRoute) {
    const { userData } = useAuth(); 

    if(userData === undefined) {
        return <>Loading...</>
    }

    const userRole = userData?.user?.role as Role

    if (userData === null || (allowedRoles && !allowedRoles.includes(userRole))) {
        return <>Permission Denied</>
    }

    return <Outlet />
}