'use client'
import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

const Wishlist = () => {
    const { products, router, wishlistItems, toggleWishlist, addToCart, getWishlistCount } = useAppContext();

    // Get wishlist products
    const wishlistProducts = products.filter(product => wishlistItems.includes(product._id));

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20">
                <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
                    <p className="text-2xl md:text-3xl text-gray-500">
                        Your <span className="font-medium text-red-500">Wishlist</span>
                    </p>
                    <p className="text-lg md:text-xl text-gray-500/80">{getWishlistCount()} Items</p>
                </div>

                {wishlistProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-6">
                            <Image
                                src={assets.heart_icon}
                                alt="empty wishlist"
                                className="w-16 h-16 mx-auto opacity-50"
                                width={64}
                                height={64}
                            />
                        </div>
                        <p className="text-xl text-gray-500 mb-4">Your wishlist is empty</p>
                        <p className="text-gray-400 mb-6">Start adding products you love!</p>
                        <button
                            onClick={() => router.push('/all-products')}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {wishlistProducts.map((product) => {
                                // Calculate discount percent
                                const discountPercent = product.discountPercent
                                    ?? Math.round(100 - (product.discountedPrice / product.price * 100));

                                return (
                                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {/* Product Image */}
                                        <div className="relative bg-gray-50 p-4">
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-48 object-cover mix-blend-multiply cursor-pointer"
                                                width={300}
                                                height={200}
                                                onClick={() => router.push(`/product/${product._id}`)}
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3
                                                className="font-medium text-gray-800 mb-1 cursor-pointer hover:text-gray-600 line-clamp-2"
                                                onClick={() => router.push(`/product/${product._id}`)}
                                            >
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-semibold text-gray-800">
                                                    ${product.discountedPrice.toFixed(2)}
                                                </span>
                                                <span className="text-sm line-through text-gray-500">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-green-600 font-medium">
                                                    {discountPercent}% Off
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        addToCart(product._id);
                                                        // Optionally show a toast notification here
                                                    }}
                                                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={() => toggleWishlist(product._id)}
                                                    className="px-3 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition flex items-center justify-center"
                                                    aria-label="Remove from wishlist"
                                                    title="Remove from wishlist"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            fill="none"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Continue Shopping Button */}
                        <div className="mt-8">
                            <button
                                onClick={() => router.push('/all-products')}
                                className="group flex items-center gap-2 text-red-500 hover:text-red-600 transition"
                            >
                                <Image
                                    className="group-hover:-translate-x-1 transition"
                                    src={assets.arrow_right_icon_colored}
                                    alt="arrow_right_icon_colored"
                                />
                                Continue Shopping
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Wishlist;
