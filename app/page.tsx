"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "./component/Hero";
import Footer from "./component/Footer";
import { getMovies } from "../lib/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "customer") {
          router.replace("/customer");
          return;
        } else if (user.role === "admin") {
          router.replace("/admin");
          return;
        }
      } catch (e) {
        // invalid user
      }
    }

    getMovies()
      .then((res) => {
        setMovies(res.data || []);
      })
      .catch((err) => console.error("Failed to load movies:", err));
  }, [router]);

  const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      

      <Hero movies={sortedMovies} onBookNow={() => router.push("/login")} />

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
                onClick={() => router.push("/login")}
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

      <Footer role="guest" />
    </>
  );
}
