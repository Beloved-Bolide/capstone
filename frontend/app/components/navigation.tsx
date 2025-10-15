import { Navbar, NavbarBrand, NavbarToggle, NavbarCollapse, NavbarLink } from "flowbite-react";

export default function Navigation() {
    return(
        <Navbar>
            <NavbarBrand href="/">

            </NavbarBrand>
            <NavbarToggle/>
            <NavbarCollapse>
                <NavbarLink href="/about">
                    About
                </NavbarLink>
                <NavbarLink href="/pizza">
                    Pizza
                </NavbarLink>
            </NavbarCollapse>
        </Navbar>
    )
}