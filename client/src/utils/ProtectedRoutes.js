import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = ({ auth }) => {
    return auth.token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
