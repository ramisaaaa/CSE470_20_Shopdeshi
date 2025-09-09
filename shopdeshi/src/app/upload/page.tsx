"use client";
import React, { useRef, useState } from "react";

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError("");
    const form = formRef.current;
    if (!form) return;

    try {
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const description = String(formData.get("description") || "").trim();
      const priceStr = String(formData.get("price") || "0");
      const category = String(formData.get("category") || "").trim();
      const imageFile = formData.get("image") as File | null;

      if (!name || !description || !priceStr || !category || !imageFile) {
        setError("Please fill all fields and select an image.");
        return;
      }

      // 1) Upload image to backend
      const imageUploadFd = new FormData();
      imageUploadFd.append("image", imageFile);
      const uploadRes = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: imageUploadFd,
      });
      if (!uploadRes.ok) {
        throw new Error("Image upload failed");
      }
      const uploadJson = await uploadRes.json();
      const imageUrl = uploadJson.image_url as string;

      // 2) Save product in backend DB
      const newPrice = parseFloat(priceStr);
      const saveRes = await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: imageUrl,
          category,
          new_price: newPrice,
          old_price: newPrice,
          description,
        }),
      });
      if (!saveRes.ok) {
        const txt = await saveRes.text();
        throw new Error(`Save failed: ${txt}`);
      }

      setSuccess(true);
      form.reset();
      setPreview(null);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Try again.");
    }
  }

  return (
    <main className="max-w-xl p-8 mx-auto mt-10 bg-white border border-pink-100 shadow rounded-xl">
      <h1 className="mb-6 text-2xl font-bold text-center text-shop-dark-pink">Upload a Product</h1>
      {success && <div className="mb-4 font-bold text-green-600">Product uploaded!</div>}
      {error && <div className="mb-4 font-bold text-red-600">{error}</div>}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input name="name" required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea name="description" required className="w-full p-2 border rounded" rows={3} />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Price (USD)</label>
          <input name="price" type="number" step="0.01" min="0" required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Category</label>
          <select name="category" required className="w-full p-2 border rounded">
            <option value="">Select a category</option>
            <option value="crochet">Crochet</option>
            <option value="doll">Plush doll</option>
            <option value="clothing">Clothing</option>
            <option value="rug">Rug</option>
            <option value="furniture">Furniture</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Product Image</label>
          <input name="image" type="file" accept="image/*" required onChange={handleImageChange} className="w-full" />
          {preview && <img src={preview} alt="Preview" className="object-contain h-32 mt-2 border rounded" />}
        </div>
        <button type="submit" className="w-full py-2 font-bold text-white transition rounded bg-shop-dark-pink hover:bg-pink-300">Upload</button>
      </form>
    </main>
  );
} 