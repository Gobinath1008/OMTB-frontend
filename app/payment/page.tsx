"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./payment.css";
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  Lock, 
  CheckCircle2, 
  ChevronLeft, 
  ShieldCheck, 
  Film, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket, 
  QrCode, 
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle
} from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const movieId = searchParams.get("movieId");
  const movieName = decodeURIComponent(searchParams.get("movieName") || "");
  const theater = decodeURIComponent(searchParams.get("theater") || "");
  const time = decodeURIComponent(searchParams.get("time") || "");
  const date = decodeURIComponent(searchParams.get("date") || "");
  const seats = decodeURIComponent(searchParams.get("seats") || "");
  const total = searchParams.get("total") || "0";

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    netBank: "",
    upiId: "",
    selectedUpiApp: "gpay"
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePaymentForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (paymentMethod === "card") {
      const cleanNum = formData.cardNumber.replace(/\s/g, "");
      if (!cleanNum) {
        newErrors.cardNumber = "Card number is required";
      } else if (cleanNum.length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (!formData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }

      if (!formData.expiry.trim()) {
        newErrors.expiry = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
        newErrors.expiry = "Use MM/YY format";
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (formData.cvv.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      }
    } else if (paymentMethod === "netbanking") {
      if (!formData.netBank) {
        newErrors.netBank = "Please select a bank";
      }
    } else if (paymentMethod === "upi") {
      if (!formData.upiId.trim()) {
        newErrors.upiId = "UPI ID is required (e.g., user@okhdfcbank)";
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = "Invalid UPI ID format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (!v) return "";
    const matches = v.match(/.{1,4}/g);
    return matches ? matches.join(" ") : "";
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Detect card brand
  const getCardBrand = (number: string) => {
    const clean = number.replace(/\s/g, "");
    if (clean.startsWith("4")) return "VISA";
    if (clean.startsWith("5")) return "MASTERCARD";
    if (clean.startsWith("3")) return "AMEX";
    return "CARD";
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;

    if (loading) return;
    setLoading(true);

    const seatArray = seats.split(",").filter(Boolean);

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Please login to book tickets");
      router.push("/login");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);

    try {
      const bookingRes = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: String(movieId),
          movieName: movieName,
          theater: theater,
          date: date,
          time: time,
          seats: seatArray,
          total: Number(total),
          userId: user.id,
          userName: user.name || user.username,
          userEmail: user.email,
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        alert(bookingData.message || "Failed to save booking");
        setLoading(false);
        return;
      }

      setConfirmedBookingId(bookingData.id || "BK-" + Math.floor(100000 + Math.random() * 900000));
      setBookingSuccess(true);

    } catch (error) {
      console.error(error);
      alert("Something went wrong with the transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!movieName || !seats) {
    return (
      <div className="container text-center py-12">
        <div className="empty-state-card">
          <AlertCircle size={48} className="text-warning mb-3" />
          <h2>Invalid Payment Details</h2>
          <p className="text-muted">No booking details were detected for checkout.</p>
          <button onClick={() => router.push("/movies")} className="btn btn-primary mt-4">
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  const seatList = seats.split(",").filter(Boolean);

  return (
    <div className="payment-page fade-in">
      
      {/* Top Navigation */}
      <div className="payment-top-nav">
        <div className="container nav-flex">
          <button onClick={() => router.back()} className="back-cinema-btn">
            <ChevronLeft size={18} /> Back to Seats
          </button>
          
          <div className="checkout-trust-badge">
            <ShieldCheck size={16} className="text-success" />
            <span>256-bit SSL Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="container payment-main-container">
        
        {/* Stepper */}
        <div className="booking-stepper mb-6">
          <div className="step-item completed">
            <span className="step-num"><CheckCircle2 size={16} /></span>
            <div className="step-text">
              <span className="step-title">Date & Show</span>
              <span className="step-subtitle">Selected</span>
            </div>
          </div>
          <div className="step-separator active-sep"></div>
          <div className="step-item completed">
            <span className="step-num"><CheckCircle2 size={16} /></span>
            <div className="step-text">
              <span className="step-title">Select Seats</span>
              <span className="step-subtitle">{seatList.length} Seats Picked</span>
            </div>
          </div>
          <div className="step-separator active-sep"></div>
          <div className="step-item active">
            <span className="step-num">3</span>
            <div className="step-text">
              <span className="step-title">Checkout</span>
              <span className="step-subtitle">Instant Confirmation</span>
            </div>
          </div>
        </div>

        <div className="payment-grid-layout">
          
          {/* LEFT: REAL CINEMA TICKET VOUCHER */}
          <div className="ticket-voucher-col">
            <div className="cinema-voucher-card">
              
              <div className="voucher-head">
                <div className="voucher-brand">
                  <Film size={20} className="text-primary" />
                  <span>OMTB PREMIERE PASS</span>
                </div>
                <span className="voucher-badge">E-TICKET</span>
              </div>

              <div className="voucher-movie-hero">
                <h3 className="voucher-movie-title">{movieName}</h3>
                <div className="voucher-movie-tags">
                  <span className="tag-pill">U/A 13+</span>
                  <span className="tag-pill">Dolby Atmos</span>
                  <span className="tag-pill">2D</span>
                </div>
              </div>

              {/* Perforation Cutouts */}
              <div className="voucher-perforation">
                <div className="notch notch-left"></div>
                <div className="dashed-tear-line"></div>
                <div className="notch notch-right"></div>
              </div>

              <div className="voucher-details-body">
                <div className="voucher-field-group">
                  <div className="voucher-field">
                    <span className="v-label">
                      <MapPin size={11} className="v-label-icon" />
                      CINEMA
                    </span>
                    <span className="v-value">{theater}</span>
                  </div>
                </div>

                <div className="voucher-grid-row">
                  <div className="voucher-field">
                    <span className="v-label">
                      <Calendar size={11} className="v-label-icon" />
                      DATE
                    </span>
                    <span className="v-value">{date}</span>
                  </div>
                  <div className="voucher-field">
                    <span className="v-label">
                      <Clock size={11} className="v-label-icon" />
                      TIME
                    </span>
                    <span className="v-value text-success">{time}</span>
                  </div>
                </div>

                <div className="voucher-seats-section">
                  <span className="v-label">
                    <Ticket size={11} className="v-label-icon" />
                    SEATS ({seatList.length})
                  </span>
                  <div className="voucher-seat-tags">
                    {seatList.map((s) => (
                      <span key={s} className="v-seat-pill">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Billing Breakdown */}
                <div className="voucher-billing">
                  <div className="bill-line">
                    <span style={{ color: 'var(--text-muted)' }}>
                      {seatList.length} Ticket{seatList.length > 1 ? 's' : ''} × ₹{Math.round(Number(total) / seatList.length)}
                    </span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>₹{total}</span>
                  </div>
                  <div className="bill-line">
                    <span style={{ color: 'var(--text-muted)' }}>Convenience Fee &amp; Taxes</span>
                    <span className="text-success" style={{ fontWeight: 700 }}>FREE</span>
                  </div>
                  <div className="bill-divider"></div>
                  <div className="bill-total-line">
                    <span className="total-text">Total Payable</span>
                    <span className="total-amount-glow">₹{total}</span>
                  </div>
                </div>

                {/* Stylized Barcode */}
                <div className="voucher-barcode-area">
                  <div className="fake-barcode"></div>
                  <span className="barcode-number">SCAN AT THEATER ENTRANCE</span>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT: PAYMENT OPTIONS & INTERACTIVE CARD */}
          <div className="payment-forms-col">
            <div className="payment-box-card">
              
              <div className="payment-box-header">
                <div>
                  <h2 className="box-title">Choose Payment Method</h2>
                  <p className="box-subtitle">Select your preferred payment gateway</p>
                </div>
                <div className="secure-shield-icon">
                  <Lock size={18} className="text-primary" />
                </div>
              </div>

              {/* Payment Tabs */}
              <div className="payment-tabs-bar">
                <button
                  type="button"
                  className={`pay-tab-btn ${paymentMethod === "card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard size={18} />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  className={`pay-tab-btn ${paymentMethod === "upi" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <Smartphone size={18} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  className={`pay-tab-btn ${paymentMethod === "netbanking" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("netbanking")}
                >
                  <Building2 size={18} />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* TAB 1: CREDIT / DEBIT CARD */}
              {paymentMethod === "card" && (
                <div className="card-payment-view fade-in">
                  
                  {/* Virtual Live 3D Credit Card */}
                  <div className="virtual-card-stage">
                    <div className="virtual-credit-card">
                      <div className="card-top-row">
                        <div className="emv-chip">
                          <div className="chip-line"></div>
                        </div>
                        <span className="card-brand-logo">{getCardBrand(formData.cardNumber)}</span>
                      </div>

                      <div className="card-number-display">
                        {formData.cardNumber || "•••• •••• •••• ••••"}
                      </div>

                      <div className="card-bottom-row">
                        <div className="card-holder-display">
                          <span className="card-mini-label">CARDHOLDER</span>
                          <span className="card-name-val">{formData.cardName || "YOUR NAME"}</span>
                        </div>
                        <div className="card-expiry-display">
                          <span className="card-mini-label">EXPIRES</span>
                          <span className="card-expiry-val">{formData.expiry || "MM/YY"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="card-input-grid">
                    <div className="input-group full-width">
                      <label>Card Number</label>
                      <div className="input-with-icon">
                        <CreditCard size={18} className="field-icon" />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                          className={errors.cardNumber ? "input-field error" : "input-field"}
                        />
                      </div>
                      {errors.cardNumber && <span className="field-error-text">{errors.cardNumber}</span>}
                    </div>

                    <div className="input-group full-width">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                        className={errors.cardName ? "input-field error" : "input-field"}
                      />
                      {errors.cardName && <span className="field-error-text">{errors.cardName}</span>}
                    </div>

                    <div className="input-group">
                      <label>Valid Thru</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiry}
                        onChange={(e) => handleInputChange("expiry", formatExpiry(e.target.value))}
                        className={errors.expiry ? "input-field error" : "input-field"}
                      />
                      {errors.expiry && <span className="field-error-text">{errors.expiry}</span>}
                    </div>

                    <div className="input-group">
                      <label>CVV / CVC</label>
                      <div className="input-with-icon">
                        <Lock size={16} className="field-icon" />
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                          className={errors.cvv ? "input-field error" : "input-field"}
                        />
                      </div>
                      {errors.cvv && <span className="field-error-text">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPI / QR */}
              {paymentMethod === "upi" && (
                <div className="upi-payment-view fade-in">
                  <div className="upi-quick-apps">
                    {[
                      { id: "gpay", name: "Google Pay", color: "#4285F4" },
                      { id: "phonepe", name: "PhonePe", color: "#6739B7" },
                      { id: "paytm", name: "Paytm", color: "#00BAF2" },
                      { id: "bhim", name: "BHIM UPI", color: "#FF9933" },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        className={`upi-app-chip ${formData.selectedUpiApp === app.id ? "active" : ""}`}
                        onClick={() => handleInputChange("selectedUpiApp", app.id)}
                      >
                        <Smartphone size={16} style={{ color: app.color }} />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="input-group full-width mt-4">
                    <label>Enter UPI ID (VPA)</label>
                    <div className="input-with-icon">
                      <Smartphone size={18} className="field-icon" />
                      <input
                        type="text"
                        placeholder="username@okhdfcbank"
                        value={formData.upiId}
                        onChange={(e) => handleInputChange("upiId", e.target.value)}
                        className={errors.upiId ? "input-field error" : "input-field"}
                      />
                    </div>
                    {errors.upiId && <span className="field-error-text">{errors.upiId}</span>}
                  </div>

                  <div className="upi-instruction-box">
                    <QrCode size={36} className="text-primary" />
                    <div className="instruction-text">
                      <span className="inst-title">Instant UPI Verification</span>
                      <span className="inst-sub">A payment request of ₹{total} will be dispatched to your mobile UPI application.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {paymentMethod === "netbanking" && (
                <div className="netbanking-view fade-in">
                  <label className="section-mini-label">Popular Banks</label>
                  <div className="popular-banks-grid">
                    {[
                      { id: "hdfc", name: "HDFC Bank" },
                      { id: "sbi", name: "State Bank of India" },
                      { id: "icici", name: "ICICI Bank" },
                      { id: "axis", name: "Axis Bank" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`bank-chip-btn ${formData.netBank === b.id ? "active" : ""}`}
                        onClick={() => handleInputChange("netBank", b.id)}
                      >
                        <Building2 size={16} />
                        <span>{b.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="input-group full-width mt-4">
                    <label>Or Select Another Bank</label>
                    <select
                      value={formData.netBank}
                      onChange={(e) => handleInputChange("netBank", e.target.value)}
                      className={errors.netBank ? "input-field select-field error" : "input-field select-field"}
                    >
                      <option value="">Select a Bank from list</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="yes">Yes Bank</option>
                      <option value="idbi">IDBI Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="canara">Canara Bank</option>
                    </select>
                    {errors.netBank && <span className="field-error-text">{errors.netBank}</span>}
                  </div>
                </div>
              )}

              {/* Checkout Submit CTA */}
              <button
                type="button"
                className="complete-pay-btn"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-row">
                    <span className="loading-spinner"></span>
                    <span>Processing Secure Payment...</span>
                  </div>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Pay ₹{total} & Confirm Booking</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="checkout-guarantee-note">
                <ShieldCheck size={16} className="text-success" />
                <span>Zero cancellation fee within 20 minutes • 100% Verified Tickets</span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* CONFIRMATION CELEBRATION MODAL */}
      {bookingSuccess && (
        <div className="confirmation-modal-overlay fade-in">
          <div className="celebration-modal-card">
            <div className="success-icon-ring">
              <Sparkles size={40} className="sparkle-icon" />
              <CheckCircle2 size={56} className="check-icon" />
            </div>

            <h2 className="modal-title">Booking Confirmed! 🎉</h2>
            <p className="modal-sub">
              Your tickets for <strong className="text-white">{movieName}</strong> have been secured.
            </p>

            <div className="confirmed-ticket-preview">
              <div className="conf-row">
                <span className="conf-label">Booking Reference:</span>
                <span className="conf-val text-primary">{confirmedBookingId}</span>
              </div>
              <div className="conf-row">
                <span className="conf-label">Theater:</span>
                <span className="conf-val">{theater}</span>
              </div>
              <div className="conf-row">
                <span className="conf-label">Showtime:</span>
                <span className="conf-val">{date} • {time}</span>
              </div>
              <div className="conf-row">
                <span className="conf-label">Seats:</span>
                <span className="conf-val text-success">{seats}</span>
              </div>
              <div className="conf-row total-conf-row">
                <span className="conf-label">Amount Paid:</span>
                <span className="conf-val">₹{total}</span>
              </div>
            </div>

            <div className="modal-actions-row">
              <button 
                type="button"
                className="btn btn-secondary modal-secondary-btn"
                onClick={() => router.push("/movies")}
              >
                Explore Movies
              </button>
              <button 
                type="button"
                className="btn btn-primary modal-primary-btn"
                onClick={() => router.push("/bookings")}
              >
                View My Bookings →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container py-12 text-center">
        <h2 className="loading">Securing Payment Channel...</h2>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
