"use client";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import Link from "next/link";

export default function Footer({ role = "guest" }: { role?: "guest" | "customer" | "admin" }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* COMMON ABOUT SECTION */}
        <div>
          <h2 className="footer-title">MovieBooking App</h2>
          <p className="footer-text">
            A modern platform to book movies easily, manage tickets, and enjoy
            seamless entertainment experience.
          </p>

          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook className="icon-fb" /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram className="icon-ig" /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter className="icon-tw" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin className="icon-in" /></a>
          </div>
        </div>

        {/* ROLE BASED LINKS */}
        <div>
          <h2 className="footer-subtitle">Quick Links</h2>

          {role === "customer" && (
            <ul className="footer-links">
              <li><Link href="/customer">Home</Link></li>
              <li><Link href="/customer">Movies</Link></li>
              <li><Link href="/bookings">My Bookings</Link></li>
              <li><Link href="/profile">Profile</Link></li>
            </ul>
          )}

          {role === "admin" && (
            <ul className="footer-links">
              <li><Link href="/admin">Dashboard</Link></li>
              <li><Link href="/admin/users">Manage Users</Link></li>
              <li><Link href="/admin">Manage Movies</Link></li>
              <li><Link href="/admin/reports">Reports</Link></li>
            </ul>
          )}

          {role === "guest" && (
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/">Browse Movies</Link></li>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/signup">Signup</Link></li>
            </ul>
          )}
        </div>

        {/* SUPPORT / INFO */}
        <div>
          {role === "admin" && (
            <p className="admin-warning">🔒 Authorized Admin Access Only</p>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} MovieTicketBooking App. All rights reserved.
      </div>
    </footer>
  );
}