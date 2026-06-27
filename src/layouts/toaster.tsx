import { Outlet } from "react-router";
import { Toaster } from "../components/ui/toaster";

export const ToasterLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};
