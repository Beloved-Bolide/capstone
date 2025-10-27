# Project Guidelines

## Project Overview

This is a full-stack capstone project with a React frontend and backend services. The frontend is built with React Router v7, TypeScript, Tailwind CSS v4, and Flowbite React components.

---

## Project Structure

### Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── assets/          # Images and static files
│   ├── layouts/         # Layout components (e.g., root-layout.tsx)
│   ├── routes/          # Feature-based route modules
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── home/
│   │   ├── login/
│   │   └── new-file/
│   ├── app.css          # Global styles
│   ├── root.tsx         # Root component with Layout and ErrorBoundary
│   └── routes.ts        # Route configuration
├── public/              # Public static assets
├── index.html           # HTML entry point
├── vite.config.ts       # Vite bundler configuration
├── react-router.config.ts  # React Router SSR configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

---

## Technology Stack

### Core Framework

- **React 19.2.0** - UI library
- **React Router v7.9.4** - Routing with SSR support
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.1.12** - Build tool and dev server

### Styling & UI

- **Tailwind CSS v4.1.16** - Utility-first CSS framework
- **Flowbite React 0.12.9** - Component library
- **Lucide React** - Icon library
- **React Icons** - Additional icons

### Form Handling & Validation

- **React Hook Form 7.65.0** - Form state management
- **Zod 4.1.12** - Schema validation

---

## Design System

### Color Usage

#### Background Hierarchy

- `bg-gray-50` - App shell
- `bg-white` - Cards, content
- `bg-blue-50` - Selected/active emphasis

#### Text

- `text-gray-900` - Primary
- `text-gray-700` - Heading/strong secondary
- `text-gray-600` - Secondary
- `text-gray-500` - Tertiary/meta

#### Borders/Dividers

- `border-gray-200` - Containers
- `border-gray-100` - Subtle row dividers

#### Accent

- `text-blue-700` - Emphasized text
- `focus:ring-blue-500` - Focus rings
- `border-blue-200` - Selected states

### Spacing Scale

#### Inline and Control Padding

Mostly use `px-3`/`px-4` and `py-2` for compact density

#### Gaps

- `gap-2`, `gap-3`, `gap-4` for layout groupings

#### Section Padding

- `p-3 lg:p-6`
- `px-4 lg:px-6`
- `py-3 lg:py-4`

### Radius and Shadows

#### Radius

- `rounded-lg` - Clickable surfaces and cards
- `rounded` - Small glyph elements
- `rounded-full` - Avatars/pills

#### Shadows

- `shadow-sm` - Sparingly on elevated cards/modals; rely on borders otherwise

### Borders

- Use `border` with `border-gray-200` for card edges and panel separation
- Use `border-b` with `border-gray-200`/`border-gray-100` for headers and table rows

### Typography

#### Sizes

- `text-sm` - Default for table content and inputs
- `text-lg font-bold` - Section/card titles
- `text-xs` - Meta labels

#### Weights

- `font-medium` - Primary labels
- `font-semibold` - Group headings

---

## Interaction and States

- **Hover** - Light background emphasis like `hover:bg-gray-50`
- **Active/selected** - `bg-blue-50`, `text-blue-700`, and if bordered, `border-blue-200`
- **Focus** - Always show a visible ring: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- **Transitions** - `transition-colors` on interactive elements; optional `duration-300 ease-in-out` for slide/transform effects (e.g., mobile sidebar)

---

## Layout Patterns

### App Shell

```
flex h-screen bg-gray-50 overflow-hidden
```

### Sidebar

#### Container

```jsx
${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
```

#### Overlay for Mobile

```
fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden
```

### Header

```
bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4
```

### Content Split

```
flex-1 flex overflow-hidden bg-gray-50
```

### Scroll Regions

Use `overflow-y-auto` only on the panel that needs it to avoid double scrollbars

---

## Responsive Breakpoints

Mobile-first; progressively reveal at larger sizes

- `lg:hidden` - Mobile-only patterns
- `hidden lg:table` - Switch list/cards to table on desktop
- `xl:block` - Reveal wide-screen preview panes; keep core flows usable without them
- Inputs/buttons may add `lg:` size bumps (e.g., icon `w-4 h-4` → `lg:w-5 lg:h-5`)

---

## Icons

Use lucide-react icons sized to text density

- **Small controls** - `w-4 h-4`
- **Header/top-level** - `w-5 h-5`
- **Colors** - `text-gray-400` for secondary, `text-gray-600` for default, `text-blue-700` for emphasized

---

## Component Recipes

### Button (Neutral)

```jsx
<button className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
  Label
</button>
```

### Icon Button

```jsx
<button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
  <Icon className="w-5 h-5 text-gray-600" />
</button>
```

### Primary Selected Button/State

```jsx
<button className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
  Selected
</button>
```

### Input/Search Field

```jsx
<div className="relative max-w-2xl w-full">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Find name or place..."
    className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>
```

### Card Container

```jsx
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6">
  {/* content */}
</div>
```

### Table (Desktop Only)

```jsx
<table className="hidden lg:table w-full text-sm">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
      <td className="py-3 px-4 text-gray-900">Cell</td>
    </tr>
  </tbody>
</table>
```

### Mobile List Card

```jsx
<div className="p-4 border rounded-lg bg-white border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
  {/* content */}
</div>
```

### Modal/Drawer (Mobile Preview)

```jsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50">
  <div className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl">
    {/* sticky header */}
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">Title</h2>
      <button className="p-2 rounded-lg hover:bg-gray-100">
        {/* close icon */}
      </button>
    </div>
    {/* content */}
  </div>
</div>
```

---

## Lists, Groups, and Section Headings

- Use vertical rhythm with `space-y-1` for dense lists
- **Group labels** - `text-sm font-semibold text-blue-700` with an icon `w-4 h-4` when appropriate
- **Category chips** - `px-2 py-1 bg-gray-100 rounded text-xs text-gray-600`

---

## Class Naming and Ordering Conventions

Recommended order for readability:

1. **Display/layout** - `flex`, `grid`, `hidden`, `fixed`, `sticky`
2. **Positioning** - `inset-*`, `top-*`, `z-*`
3. **Size** - `w-*`, `h-*`, `max-w-*`, `max-h-*`
4. **Spacing** - `p-*`, `px-*`, `py-*`, `m-*`, `gap-*`
5. **Typography** - `text-*`, `font-*`
6. **Background/foreground** - `bg-*`, `text-*`
7. **Borders/radius** - `border*`, `rounded*`
8. **Effects** - `shadow*`, `ring*`, `opacity*`
9. **Transitions/transforms** - `transition*`, `duration*`, `ease-*`, `translate-*`
10. **State modifiers** - `hover:*`, `focus:*`, `disabled:*`

Keep responsive variants adjacent to their base class (e.g., `p-3 lg:p-6`)

---

## Accessibility

- Always ensure focus visibility using `focus:ring-2 focus:ring-blue-500`
- Hide purely decorative inputs using `sr-only` when needed
- Icon-only buttons must include accessible names (e.g., `aria-label` on the button)

---

## Do and Don't Examples

### ✅ Do: Consistent Selected State

```jsx
<button
  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    selected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50 border border-transparent'
  }`}
>
  Label
</button>
```

### ❌ Don't

Mix accent colors arbitrarily or use heavy shadow without purpose. Prefer borders and subtle elevation.

---

## Tables Specifics

- **Header row** - `border-b border-gray-200`, label with `text-sm font-semibold text-gray-700`
- **Body rows** - `border-b border-gray-100`, hover with `hover:bg-gray-50`, selection with `bg-blue-50`
- **Cell padding** - `py-3 px-4`

---

## Preview Pane (Desktop)

- Show only on wide screens: `hidden xl:block`
- Width may use an arbitrary size like `w-120`; prefer semantic widths (e.g., `w-[30rem]`) if arbitrary scale isn't configured
- **Container** - `bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto`

---

## Z-Index Layers

- **Overlay** - `z-40`
- **Sidebar/Modal content** - `z-50`
- Keep headers inside modals `sticky top-0` to maintain close controls

---

## Dark Mode (if/when enabled)

Current codebase doesn't apply dark variants; if introduced, mirror grays and accents with `dark:bg-gray-900`, `dark:text-gray-100`, and `dark:border-gray-700` while keeping `focus:ring-blue-500`

---

## Reuse and Extraction

Favor component extraction (React components) over global CSS `@apply`

### Example Components

Button, IconButton, Card, SectionHeading that encapsulate the class recipes above

If using `@apply`, restrict it to tokens and shared primitives (e.g., `.card`, `.input`) and keep utilities for composition in JSX

---

## Flowbite React

When using Flowbite components, align props/variants with these tokens:

- Neutral buttons should visually match the custom button recipe (gray text, light hover, medium radius)
- Inputs should keep `text-sm`, rounded corners, and a blue focus ring

---

## Code Style Guidelines

### General Rules

1. **Indentation** - Use 2 spaces for indentation
2. **File naming** - Use kebab-case for files (e.g., `root-layout.tsx`, `login.tsx`)
3. **Component naming** - Use PascalCase for component names
4. **Imports** - Group imports logically (React first, then third-party, then local)

### HTML/JSX

- Always indent children elements properly
- Self-closing tags should have a space before `/>` (e.g., `<meta charset="utf-8" />`)
- Use double quotes for HTML/JSX attributes

### TypeScript

- **Strict mode enabled** - All type safety features are on
- Use explicit types where clarity is needed
- Leverage type inference where appropriate
- Use `~/*` path alias for importing from `/app` directory

### React Patterns

- **Route modules** - Each route should be in its own directory under `app/routes/`
- **Layouts** - Use layout components for shared UI structure
- **Error boundaries** - Implemented at the root level in `root.tsx`
- **Route configuration** - Centralized in `app/routes.ts` using React Router's type-safe route config

### Routing Structure

Routes are configured in `app/routes.ts` using React Router v7's declarative API:

```typescript
layout("./layouts/root-layout", [
  index("./routes/home/home"),           // "/"
  route("dashboard", "./routes/dashboard/dashboard"),  // "/dashboard"
  route("login", "./routes/login/login"),              // "/login"
])
```

---

## Development Workflow

### Running the Project

```bash
# Development mode (opens browser automatically)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck
```

### Before Submitting Changes

1. **Type check** - Run `npm run typecheck` to ensure TypeScript correctness
2. **Build test** - Run `npm run build` to verify production build works
3. **Manual testing** - Test the feature in the browser using `npm run dev`

---

## Configuration Notes

### Server-Side Rendering (SSR)

- SSR is **enabled** by default (`ssr: true` in `react-router.config.ts`)
- The `Layout` component in `root.tsx` renders the full HTML structure
- `index.html` serves as the initial HTML shell only

### Path Aliases

- `~/*` maps to `./app/*` - use this for cleaner imports
- Example: `import { Header } from "~/components/Header"`

### Plugins

- **Tailwind CSS** - Integrated via Vite plugin
- **Flowbite React** - Auto-configured via Vite plugin
- **tsconfigPaths** - Enables path alias resolution

---

## File Organization

### Route Modules

Each route should be organized in its own directory:

```
app/routes/feature-name/
├── feature-name.tsx     # Main route component
├── components/          # Feature-specific components (optional)
└── utils.ts            # Feature-specific utilities (optional)
```

### Assets

- **Images** - Place in `app/assets/` for bundled assets or `public/` for static assets
- **Global CSS** - `app/app.css` for global styles
- **Icons** - Imported from `lucide-react` or `react-icons`

---

## Best Practices

1. **Component colocation** - Keep components close to where they're used
2. **Type safety** - Leverage React Router's generated types from `.react-router/types/`
3. **Form validation** - Use Zod schemas with React Hook Form
4. **Error handling** - Use ErrorBoundary in `root.tsx` for error display
5. **Responsive design** - Use Tailwind's responsive utilities
6. **Accessibility** - Follow WCAG guidelines, Flowbite components include a11y features

---

## Testing Strategy

- Manual testing in development mode
- Type checking via TypeScript compiler
- Production build verification before deployment

---

## Common Pitfalls to Avoid

1. Don't add manual script tags to `index.html` - React Router handles this
2. Don't skip type checking before committing
3. Don't put business logic in layout components
4. Don't hardcode paths - use React Router's Link component
5. Don't forget to update `routes.ts` when adding new routes