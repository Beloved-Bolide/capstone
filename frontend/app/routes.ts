import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'


export default [

  layout('layouts/root-layout.tsx', [

    // Home at "/"
    index('routes/home/home.tsx'),

    // Sign up at "/sign-up"
    route('sign-up', 'routes/sign-up/sign-up.tsx'),

    // Sign in at "/sign-in"
    route('sign-in', 'routes/sign-in/sign-in.tsx'),

    // Dashboard at "/dashboard"
    route('dashboard', 'routes/dashboard/dashboard.tsx', [
      route('folder', 'routes/dashboard/folder/folder.tsx'),
      route('folders', 'routes/dashboard/folder/folders.tsx')
    ]),

    // New file at "/new-file-record"
    route('new-file-record', 'routes/new-file-record/new-file-record.tsx'),

    // Expenses at "/expenses"
    route('expenses', 'routes/expenses/expenses.tsx')

  ])

] satisfies RouteConfig