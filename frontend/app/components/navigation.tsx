
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
import { Link } from "react-router";

export function Navigation() {
  return (
    <Navbar fluid rounded>
      <NavbarBrand as={ Link } href="https://flowbite-react.com">
        <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Flowbite React
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink href="#" to="/" active>
          Home
        </NavbarLink>
        <NavbarLink as={ Link } to="/dashboard">
          Dashboard
        </NavbarLink>
        <NavbarLink href="#">
          Services
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
