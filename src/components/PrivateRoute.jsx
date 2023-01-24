import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/ChatProvider"
import { Loading } from "./";

export const PrivateRoute = ({ children }) => {

  const { user, loading } = useAppContext();

  if (user) return <> { children } </>;
  else if (loading) return <> { <Loading />} </>;
  else return <Navigate to='/login' />;
}
