"use client"
import React, { useState } from "react";
import Link from "next/link"
import Image from "next/image";
import { useClerk, UserButton } from '@clerk/nextjs'
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";

const Navbar = () => {
  const { isSeller, router, user, getCartCount, getWishlistCount } = useAppContext();
  const { openSignIn } = useClerk();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          className="cursor-pointer w-24 md:w-28 lg:w-32 hover:opacity-80 transition-opacity"
          onClick={() => router.push('/')}
          src={assets.logo}
          alt="logo"
        />
      </div>

      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          Contact
        </Link>
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar - Show when not seller and user exists */}
        {!isSeller && user && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Image src={assets.search_icon} alt="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            </div>
          </form>
        )}

        {/* Action Icons - Show when user exists and is not seller */}
        {user && !isSeller && (
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <button
              onClick={() => router.push('/wishlist')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
              aria-label="Wishlist"
            >
              <Image src={assets.heart_icon} alt="wishlist" className="w-5 h-5" />
              {/* Optional: Add wishlist count badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{getWishlistCount()}</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
              aria-label="Shopping Cart"
            >
              <CartIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {/* Optional: Add cart count badge */}
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{getCartCount()}</span>
            </button>

            {/* My Orders */}
            <button
              onClick={() => router.push('/my-orders')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
              aria-label="My Orders"
            >
              <BagIcon className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
            </button>
          </div>
        )}

        {/* User Authentication */}
        {user ? (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
              }
            }}
          >
            {/* Mobile menu items when user is not seller */}
            {!isSeller && (
              <>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label='Home'
                    labelIcon={<HomeIcon />}
                    onClick={() => router.push('/')}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label='Products'
                    labelIcon={<BoxIcon />}
                    onClick={() => router.push('/all-products')}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label='Wishlist'
                    labelIcon={<Image src={assets.heart_icon} alt="wishlist" className="w-4 h-4" />}
                    onClick={() => router.push('/wishlist')}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label='Cart'
                    labelIcon={<CartIcon />}
                    onClick={() => router.push('/cart')}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label='My Orders'
                    labelIcon={<BagIcon />}
                    onClick={() => router.push('/my-orders')}
                  />
                </UserButton.MenuItems>
              </>
            )}
          </UserButton>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
          >
            <Image src={assets.user_icon} alt="user icon" className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;