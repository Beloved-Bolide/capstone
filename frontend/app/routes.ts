import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'


export default [

  layout('layouts/root-layout.tsx', [

    // Home at "/"
    index('routes/home/home.tsx'),

    // Sign up at "/sign-up"
    route('sign-up', 'routes/sign-up/sign-up.tsx'),

    // Sign in at "/sign-in"
    route('sign-in', 'routes/sign-in/sign-in.tsx'),

    // Sign out at "sign-out"
    route('sign-out', 'routes/sign-out/sign-out.tsx'),

    // Dashboard at "/dashboard"
    route('dashboard', 'routes/dashboard/dashboard.tsx', [
      route(':folderId/record/:recordId', 'routes/dashboard/folder/record/record-detail.tsx'),
      route('*', 'routes/dashboard/folder/folder.tsx')
    ]),

    // New file at "/new-file-record"
    route('new-file-record', 'routes/new-file-record/new-file-record.tsx'),

    // Expenses at "/expenses"
    route('expenses', 'routes/expenses/expenses.tsx'),

    // Search API at "/api/search"
    route('api/search', 'routes/api/search.tsx'),

    // Delete Item API at "/api/delete-item"
    route('api/delete-item', 'routes/api/delete-item.tsx')

  ])

] satisfies RouteConfig