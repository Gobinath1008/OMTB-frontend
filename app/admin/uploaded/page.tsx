"use client";
import { useState, useEffect } from "react";

import Footer from "../../component/Footer";

interface UploadedImage {
  filename: string;
  url: string;
}

export default function AdminUploadedPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/uploads");
      const result = await response.json();
      if (response.ok) {
        setImages(result.images);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      const response = await fetch("http://localhost:8080/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      if (response.ok) {
        setImages(images.filter((img) => img.filename !== filename));
        if (selectedImage?.filename === filename) {
          setSelectedImage(null);
        }
      } else {
        alert("Failed to delete image");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>, filename: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const deleteRes = await fetch("http://localhost:8080/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      if (!deleteRes.ok) {
        alert("Failed to delete old image");
        return;
      }
    } catch (error) {
      console.error(error);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        await fetchImages();
        setSelectedImage(null);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Uploaded Images</h1>

        {loading ? (
          <p>Loading...</p>
        ) : images.length === 0 ? (
          <p>No uploaded images found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.filename} className="border rounded-lg p-2 shadow-sm">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-40 object-cover rounded cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                />
                <p className="text-sm truncate mt-2" title={image.filename}>
                  {image.filename}
                </p>
                <div className="flex gap-2 mt-2">
                  <label className="cursor-pointer bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleReplace(e, image.filename)}
                      disabled={uploading}
                    />
                  </label>
                  <button
                    onClick={() => handleDelete(image.filename)}
                    className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 truncate">{selectedImage.filename}</h2>
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="max-w-full max-h-96 object-contain rounded"
            />
            <div className="flex gap-2 mt-4 justify-center">
              <label className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Replace Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleReplace(e, selectedImage.filename)}
                  disabled={uploading}
                />
              </label>
              <button
                onClick={() => handleDelete(selectedImage.filename)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer role="admin" />
    </div>
  );
}
