"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "./component/Hero";
import Footer from "./component/Footer";
import { getMovies } from "../lib/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    getMovies()
      .then((res) => {
        setMovies(res.data || []);
      })
      .catch((err) => console.error("Failed to load movies:", err));
  }, []);

  const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      

      <Hero movies={sortedMovies} onBookNow={() => setShowLoginMsg(true)} />

      <div className="container mt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2>Now Showing</h2>
          <input
            className="form-input"
            style={{ width: '300px' }}
            type="text"
            placeholder="🔎 Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredMovies.length > 0 ? (
          <div className="movie-grid fade-in">
            {filteredMovies.map((movie, index) => (
              <div 
                className="movie-card" 
                key={index} 
                onClick={() => setShowLoginMsg(true)}
              >
                <div className="movie-poster-wrapper">
                  <img className="movie-poster" src={movie.img} alt={movie.name} />
                  <div className="movie-overlay">
                    <button className="btn btn-primary btn-pill">Book Tickets</button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.name}</h3>
                  <div className="movie-meta">
                    <span className="movie-rating">⭐ {movie.rating}</span>
                    <span className="movie-genre">{movie.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-4 fade-in">
            <div className="empty-state-icon">🎬</div>
            <h3>No movies found</h3>
            <p>We couldn't find any movies matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* LOGIN REQUIRED MODAL */}
      {showLoginMsg && (
        <div className="modal-overlay" onClick={() => setShowLoginMsg(false)}>
          <div className="modal-content text-center fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="mb-2">Login Required</h2>
            <p className="mb-3">Please login to book a movie ticket.</p>
            <div className="flex gap-2">
              <Link href="/login" style={{flex: 1}}>
                <button className="btn btn-primary" style={{width: '100%'}}>Login</button>
              </Link>
              <button onClick={() => setShowLoginMsg(false)} className="btn btn-secondary" style={{flex: 1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer role="guest" />
    </>
  );
}
