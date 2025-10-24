import {Outlet} from "react-router";
import {Navbar} from "flowbite-react";

export default function RootLayout() {
  return (
    <>
      <Navbar/>
      <Outlet/>
    </>
  )
}