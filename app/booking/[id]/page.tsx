"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import "./booking.css";
import { 
  ChevronLeft, 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  Film, 
  Sparkles, 
  Volume2, 
  Tv, 
  Coffee,
  Ticket,
  Search,
  CheckCircle2
} from "lucide-react";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [theaterSearch, setTheaterSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/movies/${encodeURIComponent(String(id))}`);
        if (!response.ok) {
          throw new Error(`Failed to load movie (${response.status})`);
        }
        const selected = await response.json();

        if (selected) {
          setMovie(selected);
          const dates = new Set<string>();
          selected.theaters?.forEach((t: any) => {
            t.screens?.forEach((s: any) => {
              s.schedules?.forEach((sched: any) => {
                if (sched.date) dates.add(sched.date);
              });
            });
            if (t.date) dates.add(t.date);
          });
          const uniqueDates = Array.from(dates).sort();
          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch movie", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Relative Date Label Helper
  const getDateLabel = (dateStr: string) => {
    try {
      const target = new Date(dateStr);
      const today = new Date();
      target.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "TODAY";
      if (diffDays === 1) return "TOMORROW";
      return "";
    } catch {
      return "";
    }
  };

  // Format date helper
  const formatDateCard = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: "", num: dateStr, mon: "", label: "" };
      const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const num = d.toLocaleDateString('en-US', { day: '2-digit' });
      const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const label = getDateLabel(dateStr);
      return { day, num, mon, label };
    } catch {
      return { day: "", num: dateStr, mon: "", label: "" };
    }
  };

  // Get all unique dates
  const allDates = useMemo(() => {
    if (!movie) return [];
    const allDatesSet = new Set<string>();
    movie.theaters?.forEach((t: any) => {
      t.screens?.forEach((s: any) => s.schedules?.forEach((sched: any) => sched.date && allDatesSet.add(sched.date)));
      if (t.date) allDatesSet.add(t.date);
    });
    return Array.from(allDatesSet).sort();
  }, [movie]);

  if (loading) {
    return (
      <div className="booking-page fade-in">
        <div className="booking-skeleton-header">
          <div className="container">
            <div className="skeleton skeleton-back-btn"></div>
            <div className="skeleton-hero-grid">
              <div className="skeleton skeleton-poster"></div>
              <div className="skeleton-details">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-meta"></div>
                <div className="skeleton skeleton-desc"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-6">
          <div className="skeleton skeleton-dates"></div>
          <div className="skeleton skeleton-theaters"></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container text-center py-12">
        <div className="empty-state-box">
          <Film size={64} className="empty-icon text-muted" />
          <h2>Movie Not Found</h2>
          <p className="text-muted">The movie you requested could not be located or may no longer be showing.</p>
          <button onClick={() => router.push("/movies")} className="btn btn-primary mt-4">
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  // Filter theaters based on search
  const filteredTheaters = (movie.theaters || []).filter((t: any) => {
    const name = (t.tname || t.name || "").toLowerCase();
    const loc = (t.location || "").toLowerCase();
    const query = theaterSearch.toLowerCase().trim();
    if (!query) return true;
    return name.includes(query) || loc.includes(query);
  });

  return (
    <div className="booking-page fade-in">
      {/* Cinematic Ambient Header */}
      <div className="movie-header">
        <div className="movie-header-bg" style={{ backgroundImage: `url(${movie.img})` }}></div>
        <div className="movie-header-overlay"></div>
        <div className="movie-header-content container">
          <button onClick={() => router.back()} className="back-cinema-btn">
             <ChevronLeft size={20} /> Back to Movies
          </button>
          
          <div className="movie-header-flex">
             <div className="poster-wrapper">
               <img src={movie.img} alt={movie.name} className="movie-header-poster" />
               <span className="poster-badge">IN CINEMAS</span>
             </div>

             <div className="movie-header-info">
                <div className="movie-genres-row">
                  <span className="genre-pill">{movie.genre || "Action / Drama"}</span>
                  <span className="cert-pill">U/A 13+</span>
                  <span className="format-pill">2D • 3D • IMAX</span>
                </div>

                <h1 className="booking-detail-title">{movie.name}</h1>
                
                <div className="movie-meta-bar">
                   <div className="meta-badge rating-badge">
                     <Star size={18} fill="#f59e0b" color="#f59e0b" />
                     <span>{movie.rating ? `${movie.rating}/10` : "8.8/10"}</span>
                     <span className="meta-sub">IMDb</span>
                   </div>
                   {movie.duration && (
                     <div className="meta-badge duration-badge">
                       <Clock size={16} />
                       <span>{movie.duration}</span>
                     </div>
                   )}
                   <div className="meta-badge ticket-badge">
                     <Ticket size={16} />
                     <span>₹{movie.rate || 150} onwards</span>
                   </div>
                </div>

                <p className="movie-desc">{movie.description}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="container main-booking-body">
        {/* Step Indicator */}
        <div className="booking-stepper">
          <div className="step-item active">
            <span className="step-num">1</span>
            <div className="step-text">
              <span className="step-title">Select Date & Show</span>
              <span className="step-subtitle">Choose theater & timing</span>
            </div>
          </div>
          <div className="step-separator"></div>
          <div className="step-item">
            <span className="step-num">2</span>
            <div className="step-text">
              <span className="step-title">Select Seats</span>
              <span className="step-subtitle">Pick your favorite seats</span>
            </div>
          </div>
          <div className="step-separator"></div>
          <div className="step-item">
            <span className="step-num">3</span>
            <div className="step-text">
              <span className="step-title">Checkout</span>
              <span className="step-subtitle">Secure payment</span>
            </div>
          </div>
        </div>

        {/* Date Selection Section */}
        <div className="date-selection-panel">
          <div className="panel-header">
            <div className="header-left">
              <Calendar className="panel-icon text-primary" size={22} />
              <div>
                <h3 className="panel-title">Select Date</h3>
                <p className="panel-subtitle">Available show dates for {movie.name}</p>
              </div>
            </div>
          </div>

          {allDates.length > 0 ? (
            <div className="date-cards-scroll">
              {allDates.map((dateStr, idx) => {
                const { day, num, mon, label } = formatDateCard(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button 
                    key={idx} 
                    type="button"
                    className={`date-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {label && <span className="date-tag-badge">{label}</span>}
                    <span className="date-day">{day}</span>
                    <span className="date-num">{num}</span>
                    <span className="date-mon">{mon}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="no-dates-box">
              <p className="text-muted">No dates currently scheduled for this title.</p>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        {selectedDate && (
          <div className="showtimes-controls">
            <div className="search-theaters">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search theater by name or location..." 
                value={theaterSearch}
                onChange={(e) => setTheaterSearch(e.target.value)}
                className="theater-search-input"
              />
              {theaterSearch && (
                <button className="clear-search" onClick={() => setTheaterSearch("")}>✕</button>
              )}
            </div>

            <div className="format-filter-chips">
              {["ALL", "IMAX", "DOLBY", "4DX"].map((filter) => (
                <button
                  key={filter}
                  className={`filter-chip ${selectedFilter === filter ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Theaters List */}
        {selectedDate && (
          <div className="theater-listing-container">
            {filteredTheaters.length > 0 ? (
              filteredTheaters.map((t: any, i: number) => {
                // Filter screens/schedules for the selected date
                const activeScreens = (t.screens || []).map((s: any) => {
                   const sched = (s.schedules || []).find((sch: any) => sch.date === selectedDate);
                   return sched ? { ...s, activeSchedule: sched } : null;
                }).filter(Boolean);

                const legacyMatch = t.date === selectedDate;

                if (activeScreens.length === 0 && !legacyMatch) return null;

                return (
                  <div className="cinema-card" key={i}>
                    {/* Cinema Header */}
                    <div className="cinema-card-header">
                      <div className="cinema-brand-info">
                        <div className="cinema-icon-badge">
                          <Film size={22} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="cinema-title">{t.tname || t.name}</h4>
                          <div className="cinema-location-row">
                            <MapPin size={14} className="text-muted" />
                            <span>{t.location || "Central Multiplex, Downtown"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      <div className="amenities-row">
                        <span className="amenity-pill" title="Dolby Atmos Sound System">
                          <Volume2 size={13} /> Dolby Atmos
                        </span>
                        <span className="amenity-pill" title="4K Laser Projection">
                          <Tv size={13} /> 4K Laser
                        </span>
                        <span className="amenity-pill" title="Food & Beverage">
                          <Coffee size={13} /> F&B
                        </span>
                        <span className="amenity-pill m-ticket" title="Mobile Ticket Accepted">
                          <CheckCircle2 size={13} /> M-Ticket
                        </span>
                      </div>
                    </div>

                    {/* Screens & Shows */}
                    <div className="cinema-screens-list">
                      {activeScreens.map((screen: any, j: number) => (
                        <div key={j} className="screen-row">
                           <div className="screen-meta">
                             <span className="screen-name-tag">{screen.screenName || `Screen ${j + 1}`}</span>
                             <span className="screen-type-badge">{screen.screenType || "IMAX 2D"}</span>
                           </div>
                           
                           <div className="timings-grid">
                             {screen.activeSchedule?.timings?.map((timing: any, l: number) => (
                               <button
                                 key={l}
                                 className="showtime-card-btn"
                                 onClick={() =>
                                   router.push(
                                     `/booking/${movie.id}/seats?movieName=${encodeURIComponent(movie.name)}&theater=${encodeURIComponent(t.tname || t.name)}&time=${encodeURIComponent(`${timing.startTime} - ${timing.endTime}`)}&date=${encodeURIComponent(selectedDate)}&screen=${encodeURIComponent(screen.screenName)}`
                                   )
                                 }
                               >
                                 <span className="show-start-time">{timing.startTime}</span>
                                 <span className="show-format-sub">{screen.screenType || "DOLBY 7.1"}</span>
                                 <span className="show-status-dot" title="Available"></span>
                               </button>
                             ))}
                           </div>
                        </div>
                      ))}

                      {/* Legacy Data Fallback */}
                      {legacyMatch && t.timings && activeScreens.length === 0 && (
                        <div className="screen-row">
                           <div className="screen-meta">
                             <span className="screen-name-tag">Main Auditorium</span>
                             <span className="screen-type-badge">Standard 2D</span>
                           </div>
                           <div className="timings-grid">
                             {t.timings.map((time: string, m: number) => (
                               <button
                                 key={m}
                                 className="showtime-card-btn"
                                 onClick={() =>
                                   router.push(
                                     `/booking/${movie.id}/seats?movieName=${encodeURIComponent(movie.name)}&theater=${encodeURIComponent(t.tname || t.name)}&time=${encodeURIComponent(time)}&date=${encodeURIComponent(t.date || "")}`
                                   )
                                 }
                               >
                                 <span className="show-start-time">{time}</span>
                                 <span className="show-format-sub">Dolby Atmos</span>
                                 <span className="show-status-dot" title="Available"></span>
                               </button>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-shows-card">
                <Film size={44} className="text-muted mb-2" />
                <h4>No Theaters Found</h4>
                <p className="text-muted">No theaters match your search query &ldquo;{theaterSearch}&rdquo;.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
