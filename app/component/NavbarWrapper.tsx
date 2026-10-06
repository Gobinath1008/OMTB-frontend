"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const noNavbarRoutes = ["/login", "/signup"];
  const isNoNavbar = noNavbarRoutes.includes(pathname);

  useEffect(() => {
    if (isNoNavbar) {
      document.body.classList.add("no-navbar");
    } else {
      document.body.classList.remove("no-navbar");
    }
  }, [isNoNavbar]);

  if (isNoNavbar) return null;
  return <Navbar />;
}
