import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { router, wishlistItems, toggleWishlist, user } = useAppContext();
  const [activeTab, setActiveTab] = useState('latest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'latest', label: 'Latest Products' },
    { id: 'topRated', label: 'Top Rating' },
    { id: 'bestSelling', label: 'Best Selling' },
    { id: 'featured', label: 'Featured' }
  ];

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.includes(productId);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    await toggleWishlist(productId);
  };

  const fetchProductsByType = async (filterType) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/product/list?filterType=${filterType}&limit=5`);
      if (data.success) {
        setProducts(data.allProducts);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsByType(activeTab);
  }, [activeTab]);

  return (
    <div className="flex flex-col items-center pt-14">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8 w-full">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center w-full py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2 text-gray-600">Loading Products...</span>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard
                key={`${product._id}-${activeTab}`}
                product={product}
                isInWishlist={isInWishlist(product._id)}
                onWishlistToggle={() => handleWishlistToggle(product._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No Products Found For This Category.</p>
            </div>
          )}
        </div>
      )}

      {/* See More Button */}
      <button
        onClick={() => { router.push(`/all-products?filterType=${activeTab}`) }}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
