import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

  layout("./layouts/root-layout.tsx", [

    // Home at "/"
    index("./routes/home/home.tsx"),

    // Dashboard at "/dashboard"
    route("Dashboard", "./routes/dashboard/dashboard.tsx")

  ])

] satisfies RouteConfig;
