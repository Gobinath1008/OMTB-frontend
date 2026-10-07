"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Footer from "../../component/Footer";
import { apiUrl } from "../../../lib/apiBase";

interface Booking {
  id: number;
  movieName: string;
  movieId: number;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  bookedAt?: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Route protection
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await fetch(apiUrl("/bookings"));
      const data = await res.json();

      if (res.ok) {
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const bookingToDelete = bookings.find((b) => b.id === id);
    if (!bookingToDelete) return;

    try {
      const res = await fetch(apiUrl("/bookings"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          movieId: bookingToDelete.movieId,
          theater: bookingToDelete.theater,
          date: bookingToDelete.date,
          time: bookingToDelete.time,
          seats: bookingToDelete.seats,
        }),
      });

      if (res.ok) {
        const updatedBookings = bookings.filter((b) => b.id !== id);
        setBookings(updatedBookings);
        alert("Booking deleted successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete booking.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;

    try {
      const res = await fetch(apiUrl("/bookings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editBooking.id,
          movieName: editBooking.movieName,
          theater: editBooking.theater,
          date: editBooking.date,
          time: editBooking.time,
          seats: editBooking.seats,
          total: editBooking.total,
          userName: editBooking.userName,
          userEmail: editBooking.userEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedBookings = bookings.map((b) =>
          b.id === editBooking.id ? data : b
        );
        setBookings(updatedBookings);
        setEditBooking(null);
        alert("Booking updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update booking.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.movieName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.theater?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      
      <div className="page-wrapper fade-in">
        <div className="container mt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2>Manage All Bookings</h2>
            <div className="flex items-center gap-2">
              <input
                className="form-input"
                style={{ width: "350px" }}
                type="text"
                placeholder="Search by movie, theater, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                Total: {filteredBookings.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎟️</div>
              <h2>No bookings found!</h2>
            </div>
          ) : (
            <div className="card" style={{ overflowX: "auto", padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>ID</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Movie</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Theater</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Date & Time</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Seats</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Total</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Customer</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Booked At</th>
                    <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: "600" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "16px", color: "var(--primary)", fontWeight: "600" }}>#{booking.id}</td>
                      <td style={{ padding: "16px", fontWeight: "600" }}>{booking.movieName}</td>
                      <td style={{ padding: "16px" }}>{booking.theater}</td>
                      <td style={{ padding: "16px" }}>
                        <div>{booking.date}</div>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>{booking.time}</div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {booking.seats?.map((seat, i) => <span key={i} style={{ background: "var(--primary-faded)", color: "var(--primary)", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>{seat}</span>) || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: "var(--success)", fontWeight: "bold" }}>₹{booking.total}</td>
                      <td style={{ padding: "16px", fontSize: "0.9rem" }}>
                        <div style={{ fontWeight: "600" }}>{booking.userName || "N/A"}</div>
                        <div className="text-muted">{booking.userEmail || ""}</div>
                      </td>
                      <td style={{ padding: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : "N/A"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div className="flex gap-2">
                          <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setEditBooking(booking)}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleDelete(booking.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editBooking && (
          <div className="modal-overlay" onClick={() => setEditBooking(null)}>
            <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-3">Edit Booking #{editBooking.id}</h2>

              <div className="flex-col gap-2">
                <div className="form-group">
                  <label className="form-label">Movie Name</label>
                  <input className="form-input" value={editBooking.movieName || ""} onChange={(e) => setEditBooking({ ...editBooking, movieName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Theater</label>
                  <input className="form-input" value={editBooking.theater || ""} onChange={(e) => setEditBooking({ ...editBooking, theater: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" value={editBooking.date || ""} onChange={(e) => setEditBooking({ ...editBooking, date: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Time</label>
                    <input className="form-input" value={editBooking.time || ""} onChange={(e) => setEditBooking({ ...editBooking, time: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Seats (comma separated)</label>
                  <input className="form-input" value={editBooking.seats?.join(", ") || ""} onChange={(e) => setEditBooking({ ...editBooking, seats: e.target.value.split(",").map((s) => s.trim()).filter((s) => s) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount (₹)</label>
                  <input className="form-input" type="number" value={editBooking.total || ""} onChange={(e) => setEditBooking({ ...editBooking, total: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex gap-2">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Customer Name</label>
                    <input className="form-input" value={editBooking.userName || ""} onChange={(e) => setEditBooking({ ...editBooking, userName: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Customer Email</label>
                    <input className="form-input" type="email" value={editBooking.userEmail || ""} onChange={(e) => setEditBooking({ ...editBooking, userEmail: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                <button className="btn btn-secondary" onClick={() => setEditBooking(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer role="admin" />
    </>
  );
}
