import {Outlet} from "react-router";
import {Navigation} from "~/components/navigation";

export default function RootLayout() {
  return (
    <>
      <Navigation/>
      <Outlet />
	</>
  )
}