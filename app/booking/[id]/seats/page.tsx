"use client";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { apiUrl } from "../../../../lib/apiBase";
import "./seats.css";
import { 
  ChevronLeft, 
  Film, 
  MapPin, 
  Calendar, 
  Clock, 
  Tv, 
  Info, 
  CheckCircle2, 
  X, 
  Sparkles,
  ShieldCheck,
  Armchair
} from "lucide-react";

function SeatBookingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { id } = useParams();

  const theater = decodeURIComponent(params.get("theater") || "");
  const time = decodeURIComponent(params.get("time") || "");
  const date = decodeURIComponent(params.get("date") || "");
  const movieName = decodeURIComponent(params.get("movieName") || "");
  const screen = decodeURIComponent(params.get("screen") || "Screen 1");

  // Seat layout configuration
  // Rows A-D: Executive, Rows E-F: Recliner / VIP
  const rows = [
    { row: "A", tier: "Executive", priceAdd: 0 },
    { row: "B", tier: "Executive", priceAdd: 0 },
    { row: "C", tier: "Executive", priceAdd: 0 },
    { row: "D", tier: "Executive", priceAdd: 0 },
    { row: "E", tier: "VIP Recliner", priceAdd: 50 },
    { row: "F", tier: "VIP Recliner", priceAdd: 50 },
  ];
  const cols = 8;
  const MAX_SEATS = 8;

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [movieRate, setMovieRate] = useState<number>(150);
  const [loadingRate, setLoadingRate] = useState<boolean>(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Fetch movie rate
  useEffect(() => {
    const fetchMovieRate = async () => {
      try {
        const res = await fetch(apiUrl(`/movies/${encodeURIComponent(String(id))}`));
        if (!res.ok) {
          throw new Error(`Failed to load movie rate (${res.status})`);
        }
        const movie = await res.json();
        if (movie?.rate) {
          setMovieRate(movie.rate);
        }
      } catch (err) {
        console.error("Error fetching movie rate", err);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchMovieRate();
  }, [id]);

  // Fetch booked seats from API
  useEffect(() => {
    const fetchSeats = async () => {
      if (!id || !theater || !time || !date) return;

      try {
        const res = await fetch(
          apiUrl(
            `/bookings/seats?movieId=${encodeURIComponent(String(id))}&theater=${encodeURIComponent(
              theater
            )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`
          )
        );

        const data = await res.json();

        if (res.ok) {
          setBookedSeats(Array.isArray(data) ? data : []);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Error fetching seats", err);
      }
    };

    fetchSeats();
  }, [id, theater, time, date]);

  // Toggle seat selection
  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
      setWarningMessage(null);
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        setWarningMessage(`You can select a maximum of ${MAX_SEATS} seats per booking.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
      setWarningMessage(null);
    }
  };

  const removeSeat = (seat: string) => {
    setSelectedSeats(selectedSeats.filter((s) => s !== seat));
  };

  // Calculate pricing
  const basePrice = movieRate;
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((acc, seat) => {
      const rowChar = seat.charAt(0);
      const rowConfig = rows.find(r => r.row === rowChar);
      const seatPrice = basePrice + (rowConfig ? rowConfig.priceAdd : 0);
      return acc + seatPrice;
    }, 0);
  }, [selectedSeats, basePrice]);

  // Proceed to payment
  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      setWarningMessage("Please select at least one seat to proceed.");
      return;
    }

    router.push(
      `/payment?movieId=${id}&movieName=${encodeURIComponent(
        movieName || ""
      )}&theater=${encodeURIComponent(theater || "")}&time=${encodeURIComponent(
        time || ""
      )}&date=${encodeURIComponent(date || "")}&screen=${encodeURIComponent(
        screen || ""
      )}&seats=${selectedSeats.join(
        ","
      )}&total=${totalPrice}`
    );
  };

  return (
    <div className="seat-page fade-in">
      {/* Top Breadcrumb & Cinema Context Bar */}
      <div className="seat-top-bar">
        <div className="container top-bar-flex">
          <button onClick={() => router.back()} className="back-cinema-btn">
            <ChevronLeft size={18} /> Back
          </button>

          <div className="show-summary-pill">
            <div className="pill-item">
              <Film size={15} className="text-primary" />
              <span className="pill-title">{movieName || "Movie"}</span>
            </div>
            <div className="pill-divider"></div>
            <div className="pill-item">
              <MapPin size={15} className="text-muted" />
              <span>{theater}</span>
            </div>
            <div className="pill-divider"></div>
            <div className="pill-item">
              <Calendar size={15} className="text-muted" />
              <span>{date}</span>
            </div>
            <div className="pill-divider"></div>
            <div className="pill-item">
              <Clock size={15} className="text-muted" />
              <span className="text-success">{time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Booking Stepper */}
        <div className="booking-stepper mb-6">
          <div className="step-item completed">
            <span className="step-num"><CheckCircle2 size={16} /></span>
            <div className="step-text">
              <span className="step-title">Date & Show</span>
              <span className="step-subtitle">Selected</span>
            </div>
          </div>
          <div className="step-separator active-sep"></div>
          <div className="step-item active">
            <span className="step-num">2</span>
            <div className="step-text">
              <span className="step-title">Select Seats</span>
              <span className="step-subtitle">Pick {selectedSeats.length > 0 ? `${selectedSeats.length} seats` : "your seats"}</span>
            </div>
          </div>
          <div className="step-separator"></div>
          <div className="step-item">
            <span className="step-num">3</span>
            <div className="step-text">
              <span className="step-title">Checkout</span>
              <span className="step-subtitle">Payment</span>
            </div>
          </div>
        </div>

        {warningMessage && (
          <div className="seat-warning-banner">
            <Info size={18} />
            <span>{warningMessage}</span>
            <button onClick={() => setWarningMessage(null)} className="close-banner-btn">✕</button>
          </div>
        )}

        <div className="seat-layout-grid">
          {/* LEFT: SEAT SELECTION AUDITORIUM */}
          <div className="auditorium-card">
            
            {/* Screen with Ambient Light Beam */}
            <div className="auditorium-screen-stage">
              <div className="projector-beam"></div>
              <div className="curved-screen-glass">
                <span className="screen-tagline">CINEMA SCREEN</span>
              </div>
              <div className="screen-caption">All eyes this way • Dolby Atmos 7.1 Surround</div>
            </div>

            {/* Scrollable Stage Wrapper */}
            <div className="seats-stage-scroll">
              <div className="seats-stage">
                
                {/* Executive Tier */}
                <div className="tier-label-divider">
                  <span className="tier-tag prime-tag">EXECUTIVE — ₹{basePrice}</span>
                  <div className="tier-line"></div>
                </div>

                <div className="seats-rows-group">
                  {rows.slice(0, 4).map(({ row, tier, priceAdd }) => (
                    <div className="seat-row" key={row}>
                      <div className="row-label">{row}</div>
                      <div className="seats-cluster">
                        {Array.from({ length: cols }, (_, i) => {
                          const seat = `${row}${i + 1}`;
                          const isBooked = bookedSeats.includes(seat);
                          const isSelected = selectedSeats.includes(seat);

                          let seatClass = "cinema-seat executive-seat";
                          if (isBooked) seatClass += " booked";
                          if (isSelected) seatClass += " selected";

                          return (
                            <button
                              key={seat}
                              type="button"
                              className={seatClass}
                              onClick={() => toggleSeat(seat)}
                              disabled={isBooked}
                              title={`${seat} - ${tier} (₹${basePrice + priceAdd})`}
                            >
                              <div className="seat-cushion"></div>
                              <span className="seat-num">{i + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="row-label">{row}</div>
                    </div>
                  ))}
                </div>

                {/* VIP Recliner Tier */}
                <div className="tier-label-divider mt-4">
                  <span className="tier-tag vip-tag">✨ VIP RECLINER — ₹{basePrice + 50}</span>
                  <div className="tier-line"></div>
                </div>

                <div className="seats-rows-group">
                  {rows.slice(4).map(({ row, tier, priceAdd }) => (
                    <div className="seat-row" key={row}>
                      <div className="row-label vip-label">{row}</div>
                      <div className="seats-cluster">
                        {Array.from({ length: cols }, (_, i) => {
                          const seat = `${row}${i + 1}`;
                          const isBooked = bookedSeats.includes(seat);
                          const isSelected = selectedSeats.includes(seat);
                          
                          let seatClass = "cinema-seat vip-seat";
                          if (isBooked) seatClass += " booked";
                          if (isSelected) seatClass += " selected";

                          return (
                            <button
                              key={seat}
                              type="button"
                              className={seatClass}
                              onClick={() => toggleSeat(seat)}
                              disabled={isBooked}
                              title={`${seat} - ${tier} (₹${basePrice + priceAdd})`}
                            >
                              <div className="seat-cushion"></div>
                              <span className="seat-num">{i + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="row-label vip-label">{row}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Seat Legend */}
            <div className="seat-legend-bar">
              <div className="legend-chip">
                <div className="sample-seat sample-available"></div>
                <span>Available</span>
              </div>
              <div className="legend-chip">
                <div className="sample-seat sample-selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-chip">
                <div className="sample-seat sample-booked"></div>
                <span>Booked</span>
              </div>
              <div className="legend-chip">
                <div className="sample-seat sample-vip"></div>
                <span>VIP Recliner</span>
              </div>
            </div>

          </div>

          {/* RIGHT: STICKY BOOKING SUMMARY TICKET */}
          <div className="booking-summary-sidebar">
            <div className="summary-ticket-card">
              <div className="ticket-header">
                <div>
                  <span className="ticket-sub">SELECTED SHOW</span>
                  <h3 className="ticket-movie-title">{movieName || "Movie"}</h3>
                </div>
                <div className="ticket-format-chip">
                  {screen || "Screen 1"}
                </div>
              </div>

              <div className="ticket-body">
                <div className="ticket-info-item">
                  <span className="item-label">Cinema</span>
                  <span className="item-value">{theater}</span>
                </div>
                
                <div className="ticket-info-grid">
                  <div className="ticket-info-item">
                    <span className="item-label">Date</span>
                    <span className="item-value">{date}</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="item-label">Showtime</span>
                    <span className="item-value text-success">{time}</span>
                  </div>
                </div>

                {/* Selected Seats Badges */}
                <div className="selected-seats-panel">
                  <div className="panel-title-row">
                    <span className="item-label">Selected Seats ({selectedSeats.length})</span>
                    {selectedSeats.length > 0 && (
                      <button 
                        className="clear-all-btn" 
                        onClick={() => setSelectedSeats([])}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="seats-badge-wrap">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seat) => (
                        <span key={seat} className="interactive-seat-tag">
                          {seat}
                          <button 
                            type="button" 
                            className="remove-seat-btn"
                            onClick={() => removeSeat(seat)}
                            title="Deselect seat"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <div className="no-seats-placeholder">
                        <Armchair size={24} className="text-muted mb-1" />
                        <span>Click on seats from the auditorium map above</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                {selectedSeats.length > 0 && (
                  <div className="price-breakdown-box">
                    <div className="breakdown-row">
                      <span>Ticket Price ({selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'})</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="breakdown-row text-muted">
                      <span>Integrated Booking Fee</span>
                      <span className="text-success">FREE</span>
                    </div>
                  </div>
                )}

                <div className="ticket-divider"></div>

                <div className="ticket-total-row">
                  <div>
                    <span className="total-label">Total Amount</span>
                    <span className="tax-sub">Includes all taxes</span>
                  </div>
                  <div className="total-price-val">₹{totalPrice}</div>
                </div>

                <button 
                  type="button"
                  className={`checkout-cta-btn ${selectedSeats.length === 0 ? 'disabled' : ''}`}
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0}
                >
                  <Sparkles size={18} />
                  <span>
                    {selectedSeats.length === 0 
                      ? "Select Seats to Proceed" 
                      : `Proceed • ₹${totalPrice}`}
                  </span>
                </button>

                <div className="secure-checkout-tag">
                  <ShieldCheck size={14} className="text-success" />
                  <span>100% Safe & Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeatBookingPage() {
  return (
    <Suspense fallback={
      <div className="container py-12 text-center">
        <h2 className="loading">Initializing Cinema Auditorium...</h2>
      </div>
    }>
      <SeatBookingContent />
    </Suspense>
  );
}
