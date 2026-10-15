"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Utensils,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  FoodItem,
  FoodOrderItem,
  ModifyFoodResponse,
  getFoodItems,
  modifyBookingFood,
} from "../../lib/api";

const FALLBACK_FOODS: FoodItem[] = [
  {
    id: "f-1",
    name: "Caramel Popcorn (Large)",
    description: "Freshly popped crispy gourmet popcorn coated with rich golden caramel.",
    price: 220,
    imageURL: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&auto=format&fit=crop&q=80",
    category: "Popcorn",
  },
  {
    id: "f-2",
    name: "Cheese & Butter Popcorn (Medium)",
    description: "Golden cinema-style popcorn loaded with real melted cheese & creamy butter.",
    price: 190,
    imageURL: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=600&auto=format&fit=crop&q=80",
    category: "Popcorn",
  },
  {
    id: "f-3",
    name: "Loaded Mexican Nachos",
    description: "Crisp seasoned tortilla chips served with warm melted jalapeno queso & zesty salsa.",
    price: 180,
    imageURL: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80",
    category: "Snacks",
  },
  {
    id: "f-4",
    name: "Crispy Peri-Peri Fries",
    description: "Freshly fried golden potato fries dusted with spicy African peri-peri seasoning.",
    price: 140,
    imageURL: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
    category: "Snacks",
  },
  {
    id: "f-5",
    name: "Paneer Tikka Burger",
    description: "Crispy spiced paneer patty with mint mayo, crisp lettuce, tomato, on toasted brioche.",
    price: 160,
    imageURL: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    category: "Snacks",
  },
  {
    id: "f-6",
    name: "Chilled Pepsi Fountain Drink (500ml)",
    description: "Refreshing fountain soda poured ice-cold and bubbly.",
    price: 90,
    imageURL: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    category: "Beverages",
  },
  {
    id: "f-7",
    name: "Iced Chocolate Cold Coffee",
    description: "Creamy blended espresso cold brew topped with dark chocolate drizzle.",
    price: 130,
    imageURL: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
    category: "Beverages",
  },
  {
    id: "f-8",
    name: "Blockbuster Cinema Duo Combo",
    description: "1 Large Caramel Popcorn + 2 Chilled Pepsis + 1 Loaded Nachos tub.",
    price: 450,
    imageURL: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=600&auto=format&fit=crop&q=80",
    category: "Combos",
  },
];

export interface EditableBooking {
  id: string;
  movieName: string;
  movieId: string | number;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  foodItems?: FoodOrderItem[];
  foodTotal?: number;
  status?: string;
}

interface Props {
  booking: EditableBooking;
  onClose: () => void;
  onSuccess: (result: ModifyFoodResponse) => void;
}

export default function ManageFoodModal({ booking, onClose, onSuccess }: Props) {
  const [foods, setFoods] = useState<FoodItem[]>(FALLBACK_FOODS);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Initialize cart from booking's current food items
  const [cart, setCart] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    if (booking.foodItems && Array.isArray(booking.foodItems)) {
      booking.foodItems.forEach((item) => {
        if (item.foodId) {
          initialMap[item.foodId] = (initialMap[item.foodId] || 0) + item.quantity;
        } else {
          // If foodId was not set, attempt to find matching food from fallback
          const match = FALLBACK_FOODS.find((f) => f.name === item.name);
          const key = match ? match.id : item.name;
          initialMap[key] = (initialMap[key] || 0) + item.quantity;
        }
      });
    }
    return initialMap;
  });

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await getFoodItems();
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setFoods(res.data);
        }
      } catch (err) {
        console.warn("Could not load food catalog from API, using default catalog", err);
      } finally {
        setLoadingFoods(false);
      }
    };
    loadCatalog();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(foods.map((f) => f.category)));
    return ["All", ...unique];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    if (selectedCategory === "All") return foods;
    return foods.filter((f) => f.category === selectedCategory);
  }, [foods, selectedCategory]);

  const updateQuantity = (foodId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[foodId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[foodId];
        return copy;
      }
      return { ...prev, [foodId]: next };
    });
  };

  const removeFood = (foodId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[foodId];
      return copy;
    });
  };

  const selectedFoodItems = useMemo<FoodOrderItem[]>(() => {
    const items: FoodOrderItem[] = [];
    for (const [foodId, quantity] of Object.entries(cart)) {
      if (quantity > 0) {
        const food = foods.find((f) => f.id === foodId || f.name === foodId);
        if (food) {
          items.push({
            foodId: food.id,
            name: food.name,
            price: food.price,
            quantity,
            imageURL: food.imageURL,
            category: food.category,
          });
        }
      }
    }
    return items;
  }, [cart, foods]);

  const previousFoodTotal = booking.foodTotal || 0;
  const newFoodTotal = useMemo(() => {
    return Math.round(
      selectedFoodItems.reduce((acc, i) => acc + i.price * i.quantity, 0) * 100
    ) / 100;
  }, [selectedFoodItems]);

  const priceDifference = Math.round((newFoodTotal - previousFoodTotal) * 100) / 100;
  const extraToPay = Math.max(0, priceDifference);
  const refundAmount = Math.max(0, -priceDifference);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await modifyBookingFood(booking.id, selectedFoodItems);
      if (res.data) {
        onSuccess(res.data);
      }
    } catch (err: any) {
      console.error("Failed to update food details:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update food. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="manage-food-backdrop" onClick={onClose}>
      <div className="manage-food-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="manage-food-header">
          <div className="header-title-flex">
            <div className="food-icon-badge">
              <Utensils size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="modal-title">Edit Movie Snacks &amp; Food</h2>
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
        <div className="manage-food-body">
          {error && (
            <div className="cancel-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Context Banner */}
          <div className="edit-food-summary-bar">
            <div className="summary-pill-item">
              <span className="pill-sub">Theater:</span>
              <span className="pill-bold">{booking.theater}</span>
            </div>
            <div className="summary-pill-item">
              <span className="pill-sub">Showtime:</span>
              <span className="pill-bold">{booking.date} • {booking.time}</span>
            </div>
            <div className="summary-pill-item">
              <span className="pill-sub">Already Paid For Food:</span>
              <span className="pill-bold text-primary">₹{previousFoodTotal}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="edit-food-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`edit-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" ? "🍿 All Items" : cat}
              </button>
            ))}
          </div>

          {/* Split View: Menu on Left, Updated Basket on Right */}
          <div className="edit-food-grid">
            {/* Left: Food Catalog */}
            <div className="edit-menu-col">
              <div className="menu-items-scroll">
                {filteredFoods.map((food) => {
                  const qty = cart[food.id] || cart[food.name] || 0;
                  return (
                    <div className={`menu-food-card ${qty > 0 ? "in-basket" : ""}`} key={food.id}>
                      <img src={food.imageURL} alt={food.name} className="menu-thumb" />
                      <div className="menu-food-details">
                        <span className="menu-food-cat">{food.category}</span>
                        <h4 className="menu-food-name">{food.name}</h4>
                        <span className="menu-food-price">₹{food.price}</span>
                      </div>
                      <div className="menu-action-col">
                        {qty === 0 ? (
                          <button
                            type="button"
                            className="btn-add-mini"
                            onClick={() => updateQuantity(food.id, 1)}
                          >
                            <Plus size={14} /> Add
                          </button>
                        ) : (
                          <div className="qty-control-mini">
                            <button
                              type="button"
                              onClick={() => updateQuantity(food.id, -1)}
                              title="Decrease"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="qty-val">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(food.id, 1)}
                              title="Increase"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Updated Basket & Price Differential Breakdown */}
            <div className="edit-basket-col">
              <div className="basket-card">
                <h3 className="basket-title">
                  <span>Updated Snacks Basket</span>
                  <span className="basket-count">{selectedFoodItems.length} items</span>
                </h3>

                <div className="basket-items-scroll">
                  {selectedFoodItems.length === 0 ? (
                    <div className="empty-basket-hint">
                      <p>No snacks selected.</p>
                      <span>Select snacks on the left to add to your cinema order.</span>
                    </div>
                  ) : (
                    selectedFoodItems.map((item) => (
                      <div className="basket-item-row" key={item.foodId}>
                        <div className="basket-item-info">
                          <span className="b-name">{item.name}</span>
                          <span className="b-calc">{item.quantity} × ₹{item.price}</span>
                        </div>
                        <div className="basket-item-right">
                          <span className="b-price">₹{item.price * item.quantity}</span>
                          <button
                            type="button"
                            className="b-remove"
                            onClick={() => removeFood(item.foodId)}
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Price Difference Breakdown Box */}
                <div className="price-adjustment-box">
                  <div className="adj-line">
                    <span>Already Paid For Food:</span>
                    <span>₹{previousFoodTotal}</span>
                  </div>
                  <div className="adj-line">
                    <span>New Food Total:</span>
                    <span className="font-bold text-white">₹{newFoodTotal}</span>
                  </div>

                  <div className="adj-divider"></div>

                  {/* HIGHER: EXTRA BILL */}
                  {extraToPay > 0 && (
                    <div className="extra-bill-highlight">
                      <div className="highlight-row">
                        <span className="highlight-label">Extra Bill To Pay:</span>
                        <span className="highlight-val text-warning">+ ₹{extraToPay}</span>
                      </div>
                      <p className="highlight-sub">
                        Your new food total is higher than the already paid amount. You will pay an extra bill of <strong>₹{extraToPay}</strong>.
                      </p>
                    </div>
                  )}

                  {/* LOWER: REFUND DUE */}
                  {refundAmount > 0 && (
                    <div className="refund-highlight">
                      <div className="highlight-row">
                        <span className="highlight-label">Refund to You:</span>
                        <span className="highlight-val text-success">- ₹{refundAmount}</span>
                      </div>
                      <p className="highlight-sub">
                        Your new food total is lower. A refund of <strong>₹{refundAmount}</strong> will be processed back to your payment account.
                      </p>
                    </div>
                  )}

                  {/* EQUAL: NO CHARGE */}
                  {priceDifference === 0 && (
                    <div className="even-highlight">
                      <span>No Price Change (₹0)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="manage-food-footer">
          <button
            type="button"
            className="btn-cancel-modal"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`btn-save-food ${extraToPay > 0 ? "pay-extra" : ""}`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Updating Order...</span>
              </>
            ) : extraToPay > 0 ? (
              <>
                <CreditCard size={16} />
                <span>Pay Extra ₹{extraToPay} &amp; Update Food</span>
              </>
            ) : refundAmount > 0 ? (
              <>
                <CheckCircle2 size={16} />
                <span>Update Food &amp; Refund ₹{refundAmount}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Save Changes</span>
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

