// test comment to see branching

import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

  layout("./layouts/root-layout.tsx", [

    // Home at "/"
    index("./routes/home/home.tsx"),

    // Dashboard at "/dashboard"
    route("dashboard", "./routes/dashboard/dashboard.tsx"),

    // New File at "/new-file"
    route("new-file", "./routes/new-file/new-file.tsx")
  ])

] satisfies RouteConfig;