import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

  layout("./layouts/root-layout", [

    // Home at "/"
    index("./routes/home/home"),

    // Dashboard at "/dashboard"
    route("dashboard", "./routes/dashboard/dashboard"),

    // Login at "/login"
    route("login", "./routes/login/login"),

    // New File at "/new-file"
    route("new-file", "./routes/new-file/new-file"),

    // Expenses at "/expenses"
    route("expenses", "./routes/expenses/expenses"),

  ])

] satisfies RouteConfig;