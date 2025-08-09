"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function SellerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ Fetch products from live backend
    fetch("http://localhost:4000/allproducts") // replace with your actual API route
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
        setError("Could not load products.");
      });

    // ✅ Fetch orders (keep mock for now if needed)
    fetch("/mock-orders.json")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setOrders(Array.isArray(data) ? data : []));
  }, []);

  const sellerEmail = "seller1@example.com";
  const myOrders = orders.filter((o) => o.seller === sellerEmail);

  function getProduct(productId: string) {
    return products.find((p) => p._id === productId); // Match your MongoDB _id
  }

  return (
    <main className="min-h-screen pb-10 bg-pink-50">
      <div className="max-w-4xl p-8 mx-auto mt-10">
        <div className="p-8 mb-10 bg-white border border-pink-100 shadow rounded-xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-center text-shop-dark-pink">Seller Dashboard</h1>
          <div className="mb-4 text-lg font-semibold text-center text-pink-700">
            Welcome, Seller! Upload your products and manage your shop below.
          </div>
        </div>

        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-pink-200"></div>
          <span className="mx-4 text-lg font-bold text-pink-400">Your Products</span>
          <div className="flex-grow border-t border-pink-200"></div>
        </div>

        <div className="mb-12">
          <a href="/upload" className="inline-block px-6 py-2 mb-6 font-bold text-white transition rounded bg-shop-dark-pink hover:bg-pink-300">Upload New Product</a>

          {loading ? (
            <div className="text-center text-pink-400">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-pink-400">No products uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <div key={product._id} className="flex flex-col items-center p-4 transition border border-pink-100 shadow bg-pink-50 rounded-xl hover:shadow-lg">
                  <Image src={product.image} alt={product.name} width={120} height={120} className="object-cover mb-2 rounded-lg" />
                  <div className="mb-1 text-lg font-semibold text-center text-shop-dark-pink">{product.name}</div>
                  <div className="mb-1 font-bold text-pink-700">${product.new_price?.toFixed(2)}</div>
                  <div className="mb-2 text-sm text-center text-gray-500">{product.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-pink-200"></div>
          <span className="mx-4 text-lg font-bold text-pink-400">Order Management</span>
          <div className="flex-grow border-t border-pink-200"></div>
        </div>

        <div>
          {myOrders.length === 0 ? (
            <div className="text-center text-pink-400">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-pink-100 shadow rounded-xl">
                <thead>
                  <tr className="text-shop-dark-pink">
                    <th className="p-2">Product</th>
                    <th className="p-2">Buyer</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((order) => {
                    const product = getProduct(order.productId);
                    return (
                      <tr key={order.id} className="text-center border-t border-pink-100">
                        <td className="p-2">
                          {product ? (
                            <div className="flex flex-col items-center">
                              <Image src={product.image} alt={product.name} width={60} height={60} className="mb-1 rounded" />
                              <span className="text-xs">{product.name}</span>
                            </div>
                          ) : (
                            <span>Product {order.productId}</span>
                          )}
                        </td>
                        <td className="p-2">{order.buyer}</td>
                        <td className="p-2">{order.quantity}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 font-semibold bg-pink-200 rounded text-shop-dark-pink">
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          <select className="p-1 border rounded" defaultValue={order.status}>
                            <option>Placed</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
