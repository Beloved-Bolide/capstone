import { Outlet } from 'react-router';

export default function RootLayout() {
    return (

            <div>
                {/* Your navbar or other layout elements */}
                <Outlet />
            </div>

    );
}