import {Outlet} from "react-router";
import {Navigation} from "~/components/navigation";
import {Dashboard} from "~/routes/dashboard/dashboard";

export default function RootLayout() {
  return (
    <>
      <Outlet/>
	  </>
  )
}