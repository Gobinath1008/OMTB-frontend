"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { apiUrl } from "../../../../lib/apiBase";
import { FoodItem, FoodOrderItem } from "../../../../lib/api";
import "./food.css";
import {
  ChevronLeft,
  Film,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Utensils,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Armchair,
} from "lucide-react";

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

function FoodBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();

  const movieId = searchParams.get("movieId") || id;
  const movieName = decodeURIComponent(searchParams.get("movieName") || "");
  const theater = decodeURIComponent(searchParams.get("theater") || "");
  const time = decodeURIComponent(searchParams.get("time") || "");
  const date = decodeURIComponent(searchParams.get("date") || "");
  const screen = decodeURIComponent(searchParams.get("screen") || "Screen 1");
  const seats = decodeURIComponent(searchParams.get("seats") || "");
  const ticketTotal = Number(searchParams.get("ticketTotal") || searchParams.get("total") || "0");

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, number>>({});

  const seatList = useMemo(() => seats.split(",").filter(Boolean), [seats]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch(apiUrl("/food"));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFoods(data);
          } else {
            setFoods(FALLBACK_FOODS);
          }
        } else {
          setFoods(FALLBACK_FOODS);
        }
      } catch (err) {
        console.error("Failed to fetch foods, using fallback catalog", err);
        setFoods(FALLBACK_FOODS);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();

    // Restore any existing cart from sessionStorage
    try {
      const stored = sessionStorage.getItem("omtb_food_cart");
      if (stored) {
        const parsed: FoodOrderItem[] = JSON.parse(stored);
        const map: Record<string, number> = {};
        parsed.forEach((item) => {
          map[item.foodId] = item.quantity;
        });
        setCart(map);
      }
    } catch (e) {
      console.warn("Could not read previous food cart from session", e);
    }
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

  const clearCart = () => setCart({});

  // Calculation
  const selectedFoodItems = useMemo<FoodOrderItem[]>(() => {
    const items: FoodOrderItem[] = [];
    for (const [foodId, quantity] of Object.entries(cart)) {
      if (quantity > 0) {
        const food = foods.find((f) => f.id === foodId);
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

  const foodTotal = useMemo(() => {
    return selectedFoodItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedFoodItems]);

  const tax = useMemo(() => {
    // 5% GST convenience tax
    return Math.round((ticketTotal + foodTotal) * 0.05 * 100) / 100;
  }, [ticketTotal, foodTotal]);

  const grandTotal = useMemo(() => {
    return Math.round((ticketTotal + foodTotal + tax) * 100) / 100;
  }, [ticketTotal, foodTotal, tax]);

  const handleProceed = () => {
    // Save to session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("omtb_food_cart", JSON.stringify(selectedFoodItems));
    }

    router.push(
      `/payment?movieId=${movieId}&movieName=${encodeURIComponent(
        movieName
      )}&theater=${encodeURIComponent(theater)}&time=${encodeURIComponent(
        time
      )}&date=${encodeURIComponent(date)}&screen=${encodeURIComponent(
        screen
      )}&seats=${encodeURIComponent(seats)}&ticketTotal=${ticketTotal}&foodTotal=${foodTotal}&tax=${tax}&total=${grandTotal}`
    );
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("omtb_food_cart");
    }
    const ticketTax = Math.round(ticketTotal * 0.05 * 100) / 100;
    const finalTotal = Math.round((ticketTotal + ticketTax) * 100) / 100;

    router.push(
      `/payment?movieId=${movieId}&movieName=${encodeURIComponent(
        movieName
      )}&theater=${encodeURIComponent(theater)}&time=${encodeURIComponent(
        time
      )}&date=${encodeURIComponent(date)}&screen=${encodeURIComponent(
        screen
      )}&seats=${encodeURIComponent(seats)}&ticketTotal=${ticketTotal}&foodTotal=0&tax=${ticketTax}&total=${finalTotal}`
    );
  };

  return (
    <div className="food-page fade-in">
      {/* Top Breadcrumb & Cinema Context Bar */}
      <div className="food-top-bar">
        <div className="container top-bar-flex">
          <button onClick={() => router.back()} className="back-cinema-btn">
            <ChevronLeft size={18} /> Back to Seats
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
            <div className="pill-divider"></div>
            <div className="pill-item">
              <Armchair size={15} className="text-primary" />
              <span>{seatList.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* 4-Step Booking Stepper */}
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
              <span className="step-subtitle">{seatList.length} Seats Chosen</span>
            </div>
          </div>
          <div className="step-separator active-sep"></div>
          <div className="step-item active">
            <span className="step-num">3</span>
            <div className="step-text">
              <span className="step-title">Food & Beverages</span>
              <span className="step-subtitle">
                {selectedFoodItems.length > 0
                  ? `${selectedFoodItems.length} items added`
                  : "Add movie snacks"}
              </span>
            </div>
          </div>
          <div className="step-separator"></div>
          <div className="step-item">
            <span className="step-num">4</span>
            <div className="step-text">
              <span className="step-title">Checkout</span>
              <span className="step-subtitle">Payment</span>
            </div>
          </div>
        </div>

        {/* Hero banner */}
        <div className="food-hero-banner">
          <div className="hero-text">
            <h1>
              <Utensils size={24} className="text-primary" />
              Add Food & Beverages
            </h1>
            <p>Skip the cinema concession queue! Pre-order hot snacks and chilled drinks delivered straight to your seat.</p>
          </div>
          <div className="hero-badge-deal">
            <Sparkles size={16} />
            <span>Combo Discounts Active</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="food-tabs-container">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`food-tab-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "All" && "🍿 All Items"}
              {cat === "Popcorn" && "🍿 Popcorn"}
              {cat === "Snacks" && "🍟 Hot Snacks"}
              {cat === "Beverages" && "🥤 Cold Beverages"}
              {cat === "Combos" && "✨ Saver Combos"}
              {!["All", "Popcorn", "Snacks", "Beverages", "Combos"].includes(cat) && cat}
            </button>
          ))}
        </div>

        {/* Main Grid: Foods on Left, Sticky Order Summary on Right */}
        <div className="food-layout-grid">
          {/* Foods list */}
          <div className="food-items-section">
            {loading ? (
              <div className="text-center py-12 text-muted">
                <p>Loading cinema concessions menu...</p>
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <p>No food items found in this category.</p>
              </div>
            ) : (
              <div className="food-items-grid">
                {filteredFoods.map((food) => {
                  const qty = cart[food.id] || 0;
                  return (
                    <div className={`food-card ${qty > 0 ? "in-cart" : ""}`} key={food.id}>
                      <div className="food-img-wrapper">
                        <img
                          src={food.imageURL}
                          alt={food.name}
                          className="food-img"
                          loading="lazy"
                        />
                        <span className="food-category-badge">{food.category}</span>
                      </div>
                      <div className="food-info">
                        <h3 className="food-title">{food.name}</h3>
                        <p className="food-desc">{food.description}</p>
                        <div className="food-bottom-row">
                          <span className="food-price">₹{food.price}</span>
                          {qty === 0 ? (
                            <button
                              type="button"
                              className="add-food-btn"
                              onClick={() => updateQuantity(food.id, 1)}
                            >
                              <Plus size={15} /> Add
                            </button>
                          ) : (
                            <div className="food-qty-control">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(food.id, -1)}
                                title="Decrease"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="qty-display">{qty}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(food.id, 1)}
                                title="Increase"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky Order Summary Sidebar */}
          <aside className="order-summary-sidebar">
            <div className="order-summary-card">
              <div className="summary-card-header">
                <h2 className="summary-card-title">
                  <ShoppingBag size={18} className="text-primary" />
                  Order Summary
                </h2>
                {selectedFoodItems.length > 0 && (
                  <button onClick={clearCart} className="clear-cart-link" type="button">
                    Clear snacks
                  </button>
                )}
              </div>

              {/* Booking Context */}
              <div className="booking-context-box">
                <div className="context-row">
                  <span className="context-label">Movie:</span>
                  <span className="context-val">{movieName}</span>
                </div>
                <div className="context-row">
                  <span className="context-label">Seats ({seatList.length}):</span>
                  <span className="context-val">{seatList.join(", ")}</span>
                </div>
                <div className="context-row">
                  <span className="context-label">Auditorium:</span>
                  <span className="context-val">{screen}</span>
                </div>
              </div>

              {/* Selected Food Items List */}
              <div className="selected-food-items">
                {selectedFoodItems.length === 0 ? (
                  <div className="empty-food-cart">
                    <p>No food or beverages selected yet.</p>
                    <span className="text-muted">Choose your favorite popcorn or drinks to enjoy during the movie.</span>
                  </div>
                ) : (
                  selectedFoodItems.map((item) => (
                    <div className="cart-item-row" key={item.foodId}>
                      <div className="cart-item-left">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-calc">
                          {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeFood(item.foodId)}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="summary-price-lines">
                <div className="price-line">
                  <span>Ticket Price ({seatList.length} {seatList.length === 1 ? "seat" : "seats"})</span>
                  <span>₹{ticketTotal}</span>
                </div>
                <div className="price-line">
                  <span>Food & Beverages</span>
                  <span className={foodTotal > 0 ? "text-success" : ""}>
                    {foodTotal > 0 ? `₹${foodTotal}` : "₹0"}
                  </span>
                </div>
                <div className="price-line">
                  <span>Taxes & GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="price-line total-line">
                  <span>Grand Total</span>
                  <span className="total-green">₹{grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="food-cta-actions">
                <button
                  type="button"
                  className="proceed-payment-btn"
                  onClick={handleProceed}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  className="skip-food-btn"
                  onClick={handleSkip}
                >
                  Skip Food & Beverages
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function FoodBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-12 text-center text-muted">
          <h2>Loading Food & Beverages Menu...</h2>
        </div>
      }
    >
      <FoodBookingContent />
    </Suspense>
  );
}
