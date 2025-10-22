import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

  layout("./layouts/root-layout.tsx", [

    // Home at "/"
    index("./routes/home/home.tsx"),

    // Dashboard at "/dashboard"
    route("dashboard", "./routes/dashboard/dashboard.tsx"),

    // Login at "/login"
    route("login", "./routes/login/login.tsx"),

    // New File at "/new-file"
    route("new-file", "./routes/new-file/new-file.tsx"),

  ])

] satisfies RouteConfig;