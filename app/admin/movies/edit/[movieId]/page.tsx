"use client";
import React, { useEffect, useState } from "react";
import MovieForm from "../../MovieForm";
import { useParams } from "next/navigation";

export default function EditMoviePage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/movies/${movieId}`);
        if (!res.ok) throw new Error("Failed to load movie");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  if (loading) return <div>Loading movie details...</div>;
  if (!movie) return <div>Movie not found.</div>;

  return <MovieForm initialData={movie} isEdit={true} />;
}
