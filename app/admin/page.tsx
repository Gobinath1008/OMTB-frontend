"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Hero from "../component/Hero";
import Footer from "../component/Footer";
import { apiUrl } from "../../lib/apiBase";

export default function AdminPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Route protection: Check authentication on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push(user.role === "customer" ? "/customer" : "/login");
      return;
    }

    fetchMovies();
  }, [router]);

  const fetchMovies = async () => {
    try {
      const response = await fetch(apiUrl("/movies"));
      const data = await response.json();
      setMovies(data || []);
    } catch (err) {
      console.error("Failed to load movies", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res = await fetch(apiUrl(`/movies/${id}`), { method: 'DELETE' });
      if (res.ok) {
        fetchMovies();
      } else {
        alert("Failed to delete movie");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/movies/edit/${id}`);
  };

  const handleAdd = () => {
    router.push("/admin/movies/add");
  };

  const sortedMovies = [...movies].sort((a, b) => String(b.id).localeCompare(String(a.id)));
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      
      
      <Hero 
        movies={sortedMovies}
        isAdmin={true}
        onEdit={(movie: any) => {
          if (movie.id) handleEdit(movie.id);
        }}
      />

      <div className="container mt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2>Manage Movies</h2>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleAdd}>
              + Add Movie
            </button>
            <input
              className="form-input"
              style={{ width: '250px' }}
              type="text"
              placeholder="🔎 Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="movie-grid fade-in">
            {filteredMovies.map((movie, index) => (
              <div className="movie-card" key={index}>
                <div className="movie-poster-wrapper">
                  <img className="movie-poster" src={movie.img} alt={movie.name} />
                  <div className="movie-overlay" style={{ flexDirection: 'column', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleEdit(movie.id)}>Edit Movie</button>
                    <button className="btn btn-danger" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => handleDelete(movie.id)}>Delete Movie</button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.name}</h3>
                  <div className="movie-meta">
                    <span className="movie-rating">⭐ {movie.rating}</span>
                    <span className="movie-genre">{movie.genre}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>₹{movie.rate || 150}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{movie.isHero ? "Hero ✅" : ""}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-4 fade-in">
            <div className="empty-state-icon">🎬</div>
            <h3>No movies found</h3>
            <p>You haven't added any movies yet, or none match "{searchQuery}"</p>
            <button className="btn btn-primary mt-2" onClick={handleAdd}>+ Add First Movie</button>
          </div>
        )}
      </div>

      <Footer role="admin" />
    </>
  );
}
