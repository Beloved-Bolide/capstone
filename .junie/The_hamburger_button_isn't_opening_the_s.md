### Likely causes (based on your code)
Your sidebar toggle logic looks correct. On small screens, the hamburger button should set `sidebarOpen` to `true`, the overlay should appear, and the sidebar should slide in.

Common reasons it “doesn’t open” on mobile:

1) No responsive viewport meta tag
- If `<meta name="viewport" content="width=device-width, initial-scale=1" />` is missing from your HTML head (e.g., in `root.tsx` or `root-layout.tsx`), mobile browsers treat the page as a wide desktop layout. Tailwind’s `lg:` breakpoint can be active on a phone, so:
  - The hamburger (`lg:hidden`) becomes hidden on an actual phone.
  - The sidebar remains in the desktop state (`lg:translate-x-0 lg:static`).

Action: Ensure you have the viewport meta in your app’s document head.

```tsx
// In your HTML <head> (e.g., Remix root document)
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

2) Testing at a width ≥ 1024px
- The hamburger button is intentionally hidden on large screens by `lg:hidden`.
- On large screens the sidebar is always visible (`lg:translate-x-0 lg:static`), so clicking the hamburger isn’t needed and won’t be visible.

Action: Reduce viewport to <1024px (e.g., 375–768px) or use device emulation in DevTools. You should see the hamburger and the sidebar should be off‑canvas until opened.

3) Tailwind utilities not loading (build/purge issue)
- If Tailwind doesn’t include `translate-x-0` or `-translate-x-full` in the build, the sidebar won’t slide in/out.
- Because your classes are present as string literals in the JSX template (`"translate-x-0"` | `"-translate-x-full"`), Tailwind should keep them, but invalid `content` globs in `tailwind.config.js` can purge them.

Action: Check that Tailwind is configured to scan your TSX files (e.g., `./app/**/*.{ts,tsx,jsx,js}` or your framework’s paths).

4) Click not firing due to overlay or layering
- When closed, `sidebarOpen` is `false`, so there’s no overlay. When open, the overlay (`z-40`) sits below the sidebar (`z-50`). The main content should be `z-auto` by default.
- If custom CSS adds higher `z-index` to the main header, it could block the slide-in visually or absorb taps.

Action: In DevTools, check the stacking context when tapping the button:
- Confirm the button’s click handler runs.
- Confirm the sidebar container gets `translate-x-0` when `sidebarOpen` becomes `true`.

### Quick diagnostics you can try immediately
- Add a temporary console log to see if the click fires:
```tsx
<button
  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
  onClick={() => { console.log('Hamburger clicked'); setSidebarOpen(true); }}
>
  {/* icon */}
</button>
```
- Add a temporary state indicator near the button:
```tsx
<span className="lg:hidden text-xs text-gray-500">sidebarOpen: {String(sidebarOpen)}</span>
```
- In DevTools → Elements, watch the sidebar element’s class change from `-translate-x-full` to `translate-x-0` after clicking.

### If you want it to open on desktop as well (for testing)
- Make the hamburger visible at all sizes and disable the desktop-sticky sidebar behavior:
```tsx
// Show hamburger at all sizes (remove lg:hidden)
<button
  className="p-2 hover:bg-gray-100 rounded-lg"
  onClick={() => setSidebarOpen(true)}
>
  {/* icon */}
</button>

// Sidebar always off-canvas unless open (remove lg:translate-x-0 lg:static)
<div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>
  {/* ... */}
</div>
```

### Accessibility (optional but recommended)
Add ARIA attributes so assistive tech reflects the open state and relationship:
```tsx
<button
  aria-expanded={sidebarOpen}
  aria-controls="mobile-sidebar"
  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
  onClick={() => setSidebarOpen(true)}
>
  {/* icon */}
</button>

<div id="mobile-sidebar" /* existing classes */>
  {/* sidebar content */}
</div>
```

### Summary checklist
- Ensure the viewport meta tag exists in your layout.
- Test below 1024px width (or temporarily remove `lg:hidden`).
- Verify the click handler runs and toggles `sidebarOpen`.
- Confirm Tailwind includes translate utilities and your `content` globs match your TSX files.
- Check z-index/overlap in DevTools if the class switches but you don’t see it.

With the viewport meta present and a sub-1024px viewport, your current code should work as-is for mobile:
- The button sets `sidebarOpen` to `true`.
- The overlay appears (`z-40`, `lg:hidden`).
- The sidebar slides in (`translate-x-0`) over the content (`z-50`).