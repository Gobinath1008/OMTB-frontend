"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, User, LogOut, Home, Calendar, Ticket, Settings, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { apiUrl } from "../../lib/apiBase";

export default function Navbar({ role = "guest" }: { role?: "guest" | "customer" | "admin" }) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<"guest" | "customer" | "admin">(role);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUserData(parsedUser);
      if (parsedUser.role) {
        setCurrentRole(parsedUser.role);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("bookings");
    setUserData(null);
    setCurrentRole("guest");
    setShowProfile(false);
    setMobileOpen(false);
    router.replace("/");
    router.refresh();
  };

  const openProfile = () => {
    if (currentRole === "guest") {
      alert("You are currently a Guest. Please login to view and edit your profile.");
      return;
    }
    setEditData(userData);
    setShowProfile(true);
    setMobileOpen(false);
  };

  const closeMobileMenu = () => setMobileOpen(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(apiUrl("/auth/update"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.id,
          username: editData.username,
          email: editData.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Profile updated successfully!");
        setShowProfile(false);
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <nav className={`navbar ${mobileOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-brand-wrap">
            <div className="brand-mark">
              <Film size={22} />
            </div>
            <Link
              href={currentRole === "admin" ? "/admin" : currentRole === "customer" ? "/customer" : "/"}
              className="navbar-brand"
              onClick={closeMobileMenu}
            >
              <span className="navbar-title">Movie Ticket Booking</span>
            </Link>
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className={`navbar-panel ${mobileOpen ? "is-open" : ""}`}>
            <ul className="navbar-links">
              {currentRole === "guest" && (
                <>
                  <li>
                    <Link href="/" className="nav-link" onClick={closeMobileMenu}>
                      <Home size={18} />
                      <span>Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="nav-link nav-link-primary" onClick={closeMobileMenu}>
                      <User size={18} />
                      <span>Login</span>
                    </Link>
                  </li>
                </>
              )}

              {currentRole === "customer" && (
                <>
                  <li>
                    <Link href="/customer" className="nav-link" onClick={closeMobileMenu}>
                      <Home size={18} />
                      <span>Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/bookings" className="nav-link" onClick={closeMobileMenu}>
                      <Calendar size={18} />
                      <span>My Bookings</span>
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={openProfile} className="nav-link">
                      <Settings size={18} />
                      <span>Profile</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={handleLogout} className="nav-link nav-link-danger logout-btn">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              )}

              {currentRole === "admin" && (
                <>
                  <li>
                    <Link href="/admin" className="nav-link" onClick={closeMobileMenu}>
                      <Home size={18} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/bookings" className="nav-link" onClick={closeMobileMenu}>
                      <Ticket size={18} />
                      <span>Manage Bookings</span>
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={openProfile} className="nav-link">
                      <Settings size={18} />
                      <span>Profile</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={handleLogout} className="nav-link nav-link-danger logout-btn">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {showProfile && userData && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal fade-in" onClick={(e) => e.stopPropagation()}>
            <h2>My Profile</h2>

            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                className="form-input"
                type="text"
                value={userData.role.toUpperCase()}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                value={editData.username || ""}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={editData.email || ""}
                disabled
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowProfile(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}