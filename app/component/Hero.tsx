"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Theater = {
  tname: string;
  timings: string[];
};

type Movie = {
  id: number;
  name: string;
  description: string;
  img: string;
  genre: string;
  rating: string;
  theaters: Theater[];
  isHero?: boolean;
};

type HeroProps = {
  movies?: Movie[];
  isAdmin?: boolean;
  onEdit?: (movie: Movie) => void;
  onBookNow?: (movie: Movie) => void;
};

export default function Hero({ movies: propMovies, isAdmin, onEdit, onBookNow }: HeroProps = {}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  // Load movies
  useEffect(() => {
    let loadedMovies = [];
    if (propMovies) {
      loadedMovies = propMovies;
    } else {
      loadedMovies = JSON.parse(localStorage.getItem("movies") || "[]");
    }

    const heroMovies = loadedMovies.filter((m: Movie) => m.isHero);
    setMovies(heroMovies.length > 0 ? heroMovies : loadedMovies);
  }, [propMovies]);

  // Auto slide
  useEffect(() => {
    if (!movies.length) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % movies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies.length) return null;

  const movie = movies[index];

  return (
    <div className="hero">

      {/* Background Blur */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${movie.img})` }}
      ></div>

      {/* CONTENT */}
      <div className="hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-left">
          <h1>{movie.name}</h1>

          <p className="meta">
            {movie.rating} • {movie.genre}
          </p>

          <p className="desc">{movie.description}</p>

          {!isAdmin && (
            <button className="book-btn" onClick={() => onBookNow ? onBookNow(movie) : router.push("/login")}>
              Book Now
            </button>
          )}
          {isAdmin && onEdit && (
            <button className="edit-btn" onClick={() => onEdit(movie)}>
              Edit
            </button>
          )}
        </div>

        {/* RIGHT POSTER */}
        <div className="hero-right">
          <img src={movie.img} alt={movie.name} />
        </div>

      </div>

      {/* CONTROLS */}
      <button
        className="arrow left"
        onClick={() =>
          setIndex((index - 1 + movies.length) % movies.length)
        }
      >
        ❮
      </button>

      <button
        className="arrow right"
        onClick={() =>
          setIndex((index + 1) % movies.length)
        }
      >
        ❯
      </button>

      {/* DOTS */}
      <div className="dots">
        {movies.map((_, i) => (
          <span
            key={i}
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}