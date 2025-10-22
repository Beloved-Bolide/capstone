// test comment to see branching

import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

  layout("./layouts/root-layout.tsx", [

    // Home at "/"
    index("./routes/home/home.tsx"),

    // Dashboard at "/dashboard"
    route("dashboard", "./routes/dashboard/dashboard.tsx"),

    // Navbar at "./components"
    // route("navbar","../../components/Navbar/Navbar"),

  ])

] satisfies RouteConfig;