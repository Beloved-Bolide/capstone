import {Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle} from "flowbite-react";
import {Link} from "react-router";

export function Navigation() {
  return (
    <Navbar fluid rounded className={"flex items-center gap-2"}>
      <NavbarToggle className="md:!inline-flex"/>
      <NavbarBrand as={Link} href="https://flowbite-react.com">
        <img src="/logo.png" className="mr-3 h-12 w-auto sm:h-14" alt="Flowbite React Logo"/>
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">FileWise</span>
      </NavbarBrand>
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