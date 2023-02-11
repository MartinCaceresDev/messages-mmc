import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider"
import { Loading } from "./";

export const PrivateRoute = ({ children }) => {

  const { user, loading } = useAuthContext();

  if (user) return <> {children} </>;
  else if (loading) return <> {<Loading />} </>;
  else return <Navigate to='/login' />;
}
