
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import {Link} from "react-router";

export function Navigation() {
    return (
        <Navbar fluid rounded className={"flex items-center gap-2"}>
            <NavbarToggle className="md:!inline-flex" />
            <NavbarBrand as={Link} href="https://flowbite-react.com">
                <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
            </NavbarBrand>
            <NavbarCollapse>
                <NavbarLink href="#" active>Home</NavbarLink>
                <NavbarLink as={Link} href="#">About</NavbarLink>
                <NavbarLink href="#">Services</NavbarLink>
                <NavbarLink href="#">Pricing</NavbarLink>
                <NavbarLink href="#">Expenses</NavbarLink>
            </NavbarCollapse>
        </Navbar>
    );
}