"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertTriangle,
  CreditCard,
  Ticket,
  Utensils,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cancelBookingWithRefund, CancelBookingResponse } from "../../lib/api";

export interface BookingToCancel {
  id: string;
  movieName: string;
  movieId: string | number;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  foodItems?: Array<{
    foodId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  foodTotal?: number;
  ticketTotal?: number;
  tax?: number;
  status?: string;
  refundAmount?: number;
  cancellationFee?: number;
}

interface Props {
  booking: BookingToCancel;
  onClose: () => void;
  onSuccess: (result: CancelBookingResponse) => void;
}

export default function CancelBookingModal({ booking, onClose, onSuccess }: Props) {
  const hasActiveFood = Boolean(
    booking.foodItems &&
      booking.foodItems.length > 0 &&
      (booking.foodTotal || 0) > 0 &&
      booking.status !== "FOOD_CANCELLED"
  );

  const [cancelType, setCancelType] = useState<"ALL" | "FOOD_ONLY">("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 15% cancellation fee calculation
  const calculations = useMemo(() => {
    const feeRate = 0.15;
    if (cancelType === "FOOD_ONLY") {
      const original = booking.foodTotal || 0;
      const fee = Math.round(original * feeRate * 100) / 100;
      const refund = Math.max(0, Math.round((original - fee) * 100) / 100);
      return { original, fee, refund };
    }

    const original = booking.total || 0;
    const fee = Math.round(original * feeRate * 100) / 100;
    const refund = Math.max(0, Math.round((original - fee) * 100) / 100);
    return { original, fee, refund };
  }, [cancelType, booking.total, booking.foodTotal]);

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cancelBookingWithRefund(booking.id, cancelType);
      if (res.data) {
        onSuccess(res.data);
      }
    } catch (err: any) {
      console.error("Cancellation error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel booking. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="cancel-modal-backdrop" onClick={onClose}>
      <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cancel-modal-header">
          <div className="header-title-flex">
            <div className="warning-icon-badge">
              <AlertTriangle size={22} className="text-warning" />
            </div>
            <div>
              <h2 className="modal-title">Cancel Booking &amp; Refund</h2>
              <span className="modal-subtitle">
                Booking Reference #{booking.id} • {booking.movieName}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="cancel-modal-body">
          {error && (
            <div className="cancel-error-banner">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Show summary pill */}
          <div className="cancel-show-summary">
            <div className="summary-col">
              <span className="col-label">Cinema</span>
              <span className="col-value">{booking.theater}</span>
            </div>
            <div className="summary-col">
              <span className="col-label">Showtime</span>
              <span className="col-value">
                {booking.date} • {booking.time}
              </span>
            </div>
            <div className="summary-col">
              <span className="col-label">Seats</span>
              <span className="col-value text-primary">{booking.seats.join(", ")}</span>
            </div>
          </div>

          {/* Selection of cancel type if food is present */}
          {hasActiveFood && (
            <div className="cancel-type-selector">
              <label className="selector-title">What would you like to cancel?</label>
              <div className="radio-options-grid">
                <label
                  className={`radio-card ${cancelType === "ALL" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="cancelType"
                    checked={cancelType === "ALL"}
                    onChange={() => setCancelType("ALL")}
                  />
                  <div className="radio-card-content">
                    <span className="card-headline">
                      <Ticket size={16} /> Entire Booking
                    </span>
                    <span className="card-description">
                      Cancel all movie tickets and pre-ordered food
                    </span>
                  </div>
                </label>

                <label
                  className={`radio-card ${cancelType === "FOOD_ONLY" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="cancelType"
                    checked={cancelType === "FOOD_ONLY"}
                    onChange={() => setCancelType("FOOD_ONLY")}
                  />
                  <div className="radio-card-content">
                    <span className="card-headline">
                      <Utensils size={16} /> Food Portion Only
                    </span>
                    <span className="card-description">
                      Keep your seats and cancel snacks (₹{booking.foodTotal})
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Live Refund Breakdown */}
          <div className="refund-breakdown-card">
            <div className="breakdown-title">
              <CreditCard size={16} className="text-primary" />
              <span>Refund Calculation Breakdown</span>
            </div>

            <div className="breakdown-line">
              <span className="line-label">
                {cancelType === "FOOD_ONLY" ? "Food Amount Paid" : "Total Amount Paid"}
              </span>
              <span className="line-val">₹{calculations.original}</span>
            </div>

            <div className="breakdown-line fee-line">
              <span className="line-label">Cancellation Tax / Fee (15%)</span>
              <span className="line-val text-warning">- ₹{calculations.fee}</span>
            </div>

            <div className="breakdown-divider"></div>

            <div className="breakdown-line refund-final-line">
              <span className="line-label">Refund Amount</span>
              <span className="line-val refund-val-glow">₹{calculations.refund}</span>
            </div>
          </div>

          {/* Policy Notice */}
          <div className="policy-notice-box">
            <ShieldAlert size={16} className="text-warning flex-shrink-0" />
            <p>
              <strong>Cancellation Policy:</strong> Cancellations are permitted strictly
              before show start time. A standard 15% cancellation fee applies and ₹
              {calculations.refund} will be credited back to your original payment method.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="cancel-modal-footer">
          <button
            type="button"
            className="btn-keep-booking"
            onClick={onClose}
            disabled={loading}
          >
            Keep Booking
          </button>

          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={handleConfirmCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>
                  Confirm Cancellation • Refund ₹{calculations.refund}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

