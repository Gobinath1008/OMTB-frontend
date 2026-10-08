"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Armchair, AlertCircle, Loader2 } from "lucide-react";
import { apiUrl } from "../../lib/apiBase";

export interface ManageableBooking {
  id: string;
  movieName: string;
  movieId: string | number;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  seatPrices?: Record<string, number>;
}

export interface ModifyResult {
  booking: ManageableBooking | null;
  bookingCancelled: boolean;
  refundAmount: number;
  priceDifference: number;
  message: string;
}

type SeatAction = "keep" | "change" | "cancel";

const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = 8;
const VIP_ROWS = ["E", "F"];
const VIP_SURCHARGE = 50;

const isVip = (seat: string) => VIP_ROWS.includes(seat.charAt(0));
const rupees = (n: number) => `₹${Math.round(Math.abs(n))}`;

/** Price per seat. Falls back to deriving it from the total for older bookings. */
function getSeatPrices(booking: ManageableBooking): Record<string, number> {
  if (booking.seatPrices && booking.seats.every((s) => booking.seatPrices![s] !== undefined)) {
    return booking.seatPrices;
  }
  const vipCount = booking.seats.filter(isVip).length;
  const base = (booking.total - VIP_SURCHARGE * vipCount) / Math.max(booking.seats.length, 1);
  const prices: Record<string, number> = {};
  booking.seats.forEach((s) => (prices[s] = base + (isVip(s) ? VIP_SURCHARGE : 0)));
  return prices;
}

interface Props {
  booking: ManageableBooking;
  onClose: () => void;
  onUpdated: (result: ModifyResult) => void;
}

export default function ManageBookingModal({ booking, onClose, onUpdated }: Props) {
  const [actions, setActions] = useState<Record<string, SeatAction>>(
    () => Object.fromEntries(booking.seats.map((s) => [s, "keep" as SeatAction]))
  );
  const [newSeats, setNewSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prices = useMemo(() => getSeatPrices(booking), [booking]);
  const base = useMemo(() => {
    const first = booking.seats[0];
    return first ? prices[first] - (isVip(first) ? VIP_SURCHARGE : 0) : 0;
  }, [booking.seats, prices]);

  const cancelSeats = booking.seats.filter((s) => actions[s] === "cancel");
  const changeFrom = booking.seats.filter((s) => actions[s] === "change");
  const keepSeats = booking.seats.filter((s) => actions[s] === "keep");

  // Load seats that are already taken for this show
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          apiUrl(
            `/bookings/seats?movieId=${encodeURIComponent(String(booking.movieId))}` +
              `&theater=${encodeURIComponent(booking.theater)}` +
              `&date=${encodeURIComponent(booking.date)}` +
              `&time=${encodeURIComponent(booking.time)}`
          )
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setBookedSeats(data);
      } catch (e) {
        console.error("Failed to load seats", e);
      }
    };
    load();
  }, [booking]);

  // Keep the chosen new seats in line with how many seats are being changed
  useEffect(() => {
    setNewSeats((prev) => (prev.length > changeFrom.length ? prev.slice(0, changeFrom.length) : prev));
  }, [changeFrom.length]);

  const setAction = (seat: string, action: SeatAction) => {
    setActions((prev) => ({ ...prev, [seat]: action }));
    setNewSeats([]); // Reset selected new seats when actions change to avoid count mismatches
    setError(null);
  };

  const toggleNewSeat = (seat: string) => {
    if (bookedSeats.includes(seat) || booking.seats.includes(seat)) return;
    setError(null);
    if (newSeats.includes(seat)) {
      setNewSeats(newSeats.filter((s) => s !== seat));
      return;
    }
    
    const isTargetVip = isVip(seat);
    const vipChanging = changeFrom.filter(isVip).length;
    const normalChanging = changeFrom.length - vipChanging;
    const vipNew = newSeats.filter(isVip).length;
    const normalNew = newSeats.filter((s) => !isVip(s)).length;

    if (isTargetVip) {
      if (vipNew >= vipChanging) {
        if (vipChanging === 0) {
          setError("You can only change to Executive seats since you haven't selected any VIP seats to change.");
        } else {
          setError(`You are changing ${vipChanging} VIP seat${vipChanging > 1 ? "s" : ""}. Deselect a new VIP seat first.`);
        }
        return;
      }
    } else {
      if (normalNew >= normalChanging) {
        if (normalChanging === 0) {
          setError("You can only change to VIP seats since you haven't selected any Executive seats to change.");
        } else {
          setError(`You are changing ${normalChanging} Executive seat${normalChanging > 1 ? "s" : ""}. Deselect a new Executive seat first.`);
        }
        return;
      }
    }
    
    setNewSeats([...newSeats, seat]);
  };

  const pairs = useMemo(() => {
    const vipFrom = changeFrom.filter(isVip);
    const normalFrom = changeFrom.filter((s) => !isVip(s));
    const vipTo = newSeats.filter(isVip);
    const normalTo = newSeats.filter((s) => !isVip(s));

    const paired = [];
    for (let i = 0; i < Math.min(vipFrom.length, vipTo.length); i++) {
      paired.push({ from: vipFrom[i], to: vipTo[i] });
    }
    for (let i = 0; i < Math.min(normalFrom.length, normalTo.length); i++) {
      paired.push({ from: normalFrom[i], to: normalTo[i] });
    }
    return paired;
  }, [changeFrom, newSeats]);

  const refund = cancelSeats.reduce((sum, s) => sum + prices[s], 0);
  const priceDifference = pairs.reduce(
    (sum, p) => sum + (base + (isVip(p.to) ? VIP_SURCHARGE : 0)) - prices[p.from],
    0
  );

  const hasAction = cancelSeats.length + changeFrom.length > 0;
  const changesComplete = newSeats.length === changeFrom.length;
  const cancelsEverything = cancelSeats.length === booking.seats.length;
  const canSubmit = hasAction && changesComplete && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/bookings/${encodeURIComponent(booking.id)}/modify`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelSeats, changeSeats: pairs }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Could not update the booking. Please try again.");
        // A seat may have been taken meanwhile - refresh availability
        if (res.status === 409) {
          setNewSeats([]);
          const r = await fetch(
            apiUrl(
              `/bookings/seats?movieId=${encodeURIComponent(String(booking.movieId))}` +
                `&theater=${encodeURIComponent(booking.theater)}` +
                `&date=${encodeURIComponent(booking.date)}` +
                `&time=${encodeURIComponent(booking.time)}`
            )
          );
          if (r.ok) setBookedSeats(await r.json());
        }
        return;
      }
      onUpdated(data as ModifyResult);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="mb-overlay" onClick={onClose}>
      <div className="mb-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mb-header">
          <div>
            <h2>Manage Seats</h2>
            <p>
              {booking.movieName} • {booking.date} • {booking.time}
            </p>
          </div>
          <button className="mb-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="mb-body">
          {/* STEP 1: choose what to do with every seat */}
          <h3 className="mb-section-title">1. Choose what to do with each seat</h3>
          <div className="mb-seat-list">
            {booking.seats.map((seat) => (
              <div className={`mb-seat-row mb-${actions[seat]}`} key={seat}>
                <div className="mb-seat-info">
                  <Armchair size={16} />
                  <strong>{seat}</strong>
                  <span className="mb-seat-price">{rupees(prices[seat])}</span>
                </div>
                <div className="mb-seg">
                  {(["keep", "change", "cancel"] as SeatAction[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`mb-seg-btn ${actions[seat] === a ? `active ${a}` : ""}`}
                      onClick={() => setAction(seat, a)}
                    >
                      {a === "keep" ? "Keep" : a === "change" ? "Change" : "Cancel"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-counts">
            <span className="keep">Keep {keepSeats.length}</span>
            <span className="change">Change {changeFrom.length}</span>
            <span className="cancel">Cancel {cancelSeats.length}</span>
          </div>

          {/* STEP 2: pick replacement seats */}
          {changeFrom.length > 0 && (
            <>
              <h3 className="mb-section-title">
                2. Pick {changeFrom.length} new seat{changeFrom.length > 1 ? "s" : ""} ({newSeats.length}/
                {changeFrom.length} selected)
              </h3>
              <div className="mb-screen">SCREEN</div>
              <div className="mb-grid">
                {ROWS.map((row) => (
                  <div className="mb-grid-row" key={row}>
                    <span className="mb-row-label">{row}</span>
                    {Array.from({ length: COLS }, (_, i) => {
                      const seat = `${row}${i + 1}`;
                      const own = booking.seats.includes(seat);
                      const taken = bookedSeats.includes(seat) && !own;
                      const selected = newSeats.includes(seat);
                      let cls = "mb-seat";
                      if (isVip(seat)) cls += " vip";
                      if (own) cls += " own";
                      if (taken) cls += " taken";
                      if (selected) cls += " selected";
                      return (
                        <button
                          key={seat}
                          type="button"
                          className={cls}
                          disabled={own || taken}
                          onClick={() => toggleNewSeat(seat)}
                          title={own ? `${seat} - your current seat` : taken ? `${seat} - booked` : seat}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mb-legend">
                <span><i className="mb-seat" /> Available</span>
                <span><i className="mb-seat selected" /> New seat</span>
                <span><i className="mb-seat own" /> Your seats</span>
                <span><i className="mb-seat taken" /> Booked</span>
              </div>

              {pairs.length > 0 && (
                <div className="mb-pairs">
                  {pairs.map((p) => (
                    <span key={p.from}>
                      {p.from} → <strong>{p.to}</strong>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Summary */}
          {hasAction && (
            <div className="mb-summary">
              {cancelSeats.length > 0 && (
                <div>
                  <span>Refund for {cancelSeats.length} cancelled seat{cancelSeats.length > 1 ? "s" : ""}</span>
                  <strong className="refund">{rupees(refund)}</strong>
                </div>
              )}
              {pairs.length > 0 && Math.round(priceDifference) !== 0 && (
                <div>
                  <span>{priceDifference > 0 ? "Extra payable for upgraded seats" : "Refund for cheaper seats"}</span>
                  <strong className={priceDifference > 0 ? "extra" : "refund"}>{rupees(priceDifference)}</strong>
                </div>
              )}
              {cancelsEverything && (
                <div className="mb-warn">
                  <AlertCircle size={16} /> All seats are cancelled, so the whole booking will be cancelled.
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        <div className="mb-footer">
          <button className="mb-btn-secondary" onClick={onClose} disabled={submitting}>
            Close
          </button>
          <button className="mb-btn-primary" onClick={submit} disabled={!canSubmit}>
            {submitting ? (
              <>
                <Loader2 size={16} className="mb-spin" /> Updating...
              </>
            ) : cancelsEverything ? (
              "Cancel Entire Booking"
            ) : (
              "Confirm Changes"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
