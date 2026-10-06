"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Hero from "../component/Hero";
import Footer from "../component/Footer";
import { useRouter } from "next/navigation";

export default function CustomerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const router = useRouter();

  // Route protection: Check authentication on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "customer") {
      router.push(user.role === "admin" ? "/admin" : "/login");
      return;
    }

    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/movies");
        const data = await response.json();
        setMovies(data || []);
      } catch (err) {
        console.error("Failed to load movies", err);
      }
    };
    fetchMovies();
  }, [router]);

  const sortedMovies = [...movies].sort((a, b) => String(b.id).localeCompare(String(a.id)));
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Hero
        movies={sortedMovies}
        onBookNow={(movie) =>
        router.push(`/booking/${movie.id}`)
        }
      />
      
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
                onClick={() => router.push(`/booking/${movie.id}`)}
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

      <Footer role="customer" />
    </>
  );
}
