"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./bookings.css";

import { Calendar, Clock, MapPin, CreditCard, XCircle, Film, Download, Ticket, AlertCircle } from "lucide-react";

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

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "customer") {
      router.push(user.role === "admin" ? "/admin" : "/login");
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);

    try {
      const res = await fetch(`http://localhost:8080/api/bookings/user/${user.id}`);
      const data = await res.json();

      if (res.ok) {
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    }
    setLoading(false);
  };

  const cancelBooking = async (id: number) => {
    const confirmed = confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    const bookingToCancel = bookings.find((b) => b.id === id);
    if (!bookingToCancel) return;

    try {
      const res = await fetch("http://localhost:8080/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          movieId: bookingToCancel.movieId,
          theater: bookingToCancel.theater,
          date: bookingToCancel.date,
          time: bookingToCancel.time,
          seats: bookingToCancel.seats,
        }),
      });

      if (res.ok) {
        const updatedBookings = bookings.filter((b) => b.id !== id);
        setBookings(updatedBookings);
        alert("Booking cancelled successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Something went wrong while canceling.");
    }
  };

  const generateTicketHTML = (booking: Booking) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    const bookingDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Movie Ticket - ${booking.movieName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', sans-serif; background: #f0f0f0; padding: 20px; }
    .ticket-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
    .ticket-header { background: linear-gradient(135deg, #e89a24, #f5a623); padding: 25px; text-align: center; color: white; }
    .ticket-header h1 { font-size: 1.8rem; margin-bottom: 5px; }
    .ticket-header .badge { background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-size: 12px; display: inline-block; margin-top: 10px; }
    .ticket-body { padding: 25px; }
    .movie-title { font-size: 1.5rem; color: #1a1a2e; font-weight: 700; margin-bottom: 20px; text-align: center; border-bottom: 2px dashed #e89a24; padding-bottom: 15px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-item { }
    .info-item .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .info-item .value { font-size: 1.1rem; color: #1a1a2e; font-weight: 600; }
    .seats-section { background: #fafafa; padding: 15px; border-radius: 10px; margin: 20px 0; }
    .seats-section .label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 10px; }
    .seat-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .seat-tag { background: linear-gradient(135deg, #e89a24, #f5a623); color: white; padding: 6px 14px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .price-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px dashed #e89a24; margin-top: 15px; }
    .price-label { font-size: 1rem; color: #666; }
    .price-value { font-size: 1.5rem; font-weight: 700; color: #28a745; }
    .ticket-footer { background: #f5f5f5; padding: 20px; text-align: center; }
    .booking-info { font-size: 12px; color: #888; margin-bottom: 10px; }
    .qr-placeholder { width: 80px; height: 80px; background: #f0f0f0; margin: 0 auto; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }
    .barcode { height: 50px; background: repeating-linear-gradient(90deg, #1a1a2e 0px, #1a1a2e 2px, transparent 2px, transparent 4px); margin-top: 15px; }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <h1>🎬 Movie Ticket</h1>
      <div class="badge">CONFIRMED</div>
    </div>
    <div class="ticket-body">
      <div class="movie-title">${booking.movieName}</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Theater</div>
          <div class="value">${booking.theater}</div>
        </div>
        <div class="info-item">
          <div class="label">Date</div>
          <div class="value">${booking.date}</div>
        </div>
        <div class="info-item">
          <div class="label">Time</div>
          <div class="value">${booking.time}</div>
        </div>
        <div class="info-item">
          <div class="label">Booking ID</div>
          <div class="value">#${booking.id}</div>
        </div>
      </div>
      <div class="seats-section">
        <div class="label">Seats</div>
        <div class="seat-tags">
          ${booking.seats.map(seat => `<span class="seat-tag">${seat}</span>`).join("")}
        </div>
      </div>
      <div class="price-row">
        <span class="price-label">Total Paid</span>
        <span class="price-value">₹${booking.total}</span>
      </div>
    </div>
    <div class="ticket-footer">
      <div class="booking-info">Booked by: ${user.name || user.username} | ${user.email || ""}</div>
      <div class="booking-info">Booked on: ${bookingDate}</div>
      <div class="qr-placeholder">SCAN AT GATE</div>
      <div class="barcode"></div>
    </div>
  </div>
</body>
</html>
    `;
  };

  const downloadTicket = (booking: Booking) => {
    const html = generateTicketHTML(booking);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${booking.movieName.replace(/\s+/g, "-")}-${booking.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isBookingExpired = (booking: Booking): boolean => {
    const now = new Date();
    const [day, month, year] = booking.date.split("-").map(Number);
    const [timePart, period] = booking.time.split(" ");
    const [hoursStr, minutesStr] = timePart.split(":").map(s => s.trim());
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr || "0");

    if (period && period.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (period && period.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    const bookingDate = new Date(year, month - 1, day, hours, minutes);
    return now > bookingDate;
  };

  return (
    <div className="bookings-page">
      

      <div className="container" style={{ textAlign: 'left', paddingBottom: '10px' }}>
        <button 
          onClick={() => router.back()} 
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>←</span> Back
        </button>
      </div>
      <div className="bookings-container fade-in">

        <div className="bookings-header">
          <h1>
            <Film size={32} />
            My Bookings
          </h1>
          <p>View and manage your movie ticket bookings</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Loading your bookings...</h2>
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">🎬</div>
            <h2>No bookings found!</h2>
            <p>You haven't booked any tickets yet.</p>
            <Link href="/customer">
              <button className="back-btn">Browse Movies</button>
            </Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const expired = isBookingExpired(booking);
              return (
              <div className={`booking-card ${expired ? "expired" : ""}`} key={booking.id}>
                {expired && (
                  <div className="expired-badge">
                    <AlertCircle size={14} />
                    Show Expired
                  </div>
                )}
                <div className="booking-header" style={expired ? { background: "#999" } : {}}>
                  <h2>{booking.movieName}</h2>
                  <span className="booking-id">#{booking.id}</span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <MapPin size={18} />
                    <span>{booking.theater}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={18} />
                    <span>{booking.date}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={18} />
                    <span>{booking.time}</span>
                  </div>
                  <div className="detail-item seats">
                    <span className="seats-label">Seats:</span>
                    <div className="seats-tags">
                      {booking.seats.map((seat, i) => (
                        <span key={i} className="seat-tag">{seat}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="booking-footer">
                  <div className="total-display">
                    <CreditCard size={18} />
                    <span className="total-label">Total</span>
                    <span className="total-value">₹{booking.total}</span>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="download-btn"
                      onClick={() => downloadTicket(booking)}
                      disabled={expired}
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => cancelBooking(booking.id)}
                      disabled={expired}
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
