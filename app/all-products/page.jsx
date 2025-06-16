'use client'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from "react-hot-toast";

import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams.get('search') || '';
    const { wishlistItems, toggleWishlist, user } = useAppContext();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 6;

    // Filter states
    const [priceRange, setPriceRange] = useState({ min: 100, max: 100000 });
    const [selectedRating, setSelectedRating] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

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

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/category/list');
                if (data.success) {
                    setCategories(data.categories);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setCurrentPage(1);
        }
    }, [searchQuery]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const offset = (currentPage - 1) * productsPerPage;
                let url = `/api/product/list?page=${currentPage}&limit=${productsPerPage}&offset=${offset}`;

                if (selectedCategory) {
                    url += `&categoryId=${selectedCategory}`;
                }
                if (searchQuery) {
                    url += `&search=${encodeURIComponent(searchQuery)}`;
                }

                const { data } = await axios.get(url);
                if (data.success) {
                    setProducts(data.allProducts);
                    setTotalProducts(data.totalCount || data.allProducts.length);
                    setTotalPages(Math.ceil((data.totalCount || data.allProducts.length) / productsPerPage));
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
                console.log(error, 'error in fetching products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [selectedCategory, currentPage, searchQuery]);

    // Apply filters and sorting whenever products or filter states change
    useEffect(() => {
        let filtered = [...products];

        // Apply price filter
        filtered = filtered.filter(product =>
            product.price >= priceRange.min && product.price <= priceRange.max
        );

        // Apply rating filter
        if (selectedRating) {
            filtered = filtered.filter(product => {
                const rating = product.rating || 0;
                return rating >= selectedRating;
            });
        }

        // Apply sorting
        switch (sortBy) {
            case 'priceLowToHigh':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'priceHighToLow':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'nameAZ':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameZA':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        setFilteredProducts(filtered);
    }, [products, priceRange, selectedRating, sortBy]);

    // Handle category change - reset to page 1 and clear search
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);

        // Clear search query from URL when changing categories
        if (searchQuery) {
            router.push('/all-products');
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reset filters and pagination
    const clearAllFilters = () => {
        setPriceRange({ min: 100, max: 100000 });
        setSelectedRating(null);
        setSortBy('newest');
        setSelectedCategory(null);
        setCurrentPage(1);

        // Clear search query from URL
        if (searchQuery) {
            router.push('/all-products');
        }
    };

    // Clear search function
    const clearSearch = () => {
        router.push('/all-products');
    };

    const renderStars = (rating, clickable = false, onClick = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            } ${clickable ? 'cursor-pointer hover:text-yellow-500' : ''}`}
                        onClick={() => clickable && onClick && onClick(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // Pagination component
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        };

        return (
            <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                >
                    Previous
                </button>

                {/* First page */}
                {currentPage > 3 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        >
                            1
                        </button>
                        {currentPage > 4 && <span className="text-gray-500">...</span>}
                    </>
                )}

                {/* Page Numbers */}
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === page
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <div className="flex px-6 md:px-16 lg:px-32 gap-8">
                {/* Sidebar Filters - Desktop */}
                <div className="hidden lg:block w-64 flex-shrink-0 pt-12">
                    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-orange-600 hover:text-orange-700"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Price Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium mb-3">FILTER BY PRICE</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">From: Rs. {priceRange.min}</label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="100000"
                                        step="100"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">To: Rs. {priceRange.max}</label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="100000"
                                        step="100"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="mb-6">
                            <h4 className="font-medium mb-3">FILTER BY RATING</h4>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={selectedRating === rating}
                                            onChange={() => setSelectedRating(selectedRating === rating ? null : rating)}
                                            className="text-orange-600"
                                        />
                                        {renderStars(rating)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex flex-col items-start pt-12">
                        <div className="flex justify-between items-center w-full mb-6">
                            <div className="flex flex-col items-start">
                                <p className="text-2xl font-medium">All products</p>
                                <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
                            </div>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden bg-orange-600 text-white px-4 py-2 rounded-lg"
                            >
                                Filters
                            </button>
                        </div>

                        {/* Search Result Banner */}
                        {searchQuery && (
                            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-800 font-medium">
                                            Search results for: "{searchQuery}"
                                        </p>
                                        <p className="text-blue-600 text-sm">
                                            {filteredProducts.length} products found
                                        </p>
                                    </div>
                                    <button
                                        onClick={clearSearch}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Filters */}
                        {showFilters && (
                            <div className="lg:hidden w-full bg-white rounded-lg shadow-sm border p-4 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Filters</h3>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-orange-600 hover:text-orange-700"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Mobile Price Filter */}
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Price Range</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600">From: Rs. {priceRange.min}</label>
                                            <input
                                                type="range"
                                                min="100"
                                                max="100000"
                                                step="100"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600">To: Rs. {priceRange.max}</label>
                                            <input
                                                type="range"
                                                min="100"
                                                max="100000"
                                                step="100"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Rating Filter */}
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Rating</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <label key={rating} className="flex items-center gap-1 cursor-pointer text-sm">
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    checked={selectedRating === rating}
                                                    onChange={() => setSelectedRating(selectedRating === rating ? null : rating)}
                                                    className="text-orange-600"
                                                />
                                                {renderStars(rating)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Category Bar and Sort */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full mb-6">
                            {/* Category Filters */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className={`px-4 py-2 rounded-full text-sm ${!selectedCategory ? 'bg-orange-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                                    onClick={() => handleCategoryChange(null)}
                                >
                                    All
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category._id}
                                        className={`px-4 py-2 rounded-full text-sm ${selectedCategory === category._id ? 'bg-orange-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                                        onClick={() => handleCategoryChange(category._id)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="priceLowToHigh">Price: Low to High</option>
                                    <option value="priceHighToLow">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="nameAZ">Name: A to Z</option>
                                    <option value="nameZA">Name: Z to A</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Count and Pagination Info */}
                        <div className="flex justify-between items-center w-full mb-4">
                            <p className="text-sm text-gray-600">
                                Showing {filteredProducts.length} of {products.length} products
                                {searchQuery && ` for "${searchQuery}"`}
                                {totalProducts > products.length && ` (Page ${currentPage} of ${totalPages})`}
                            </p>
                            {totalPages > 1 && (
                                <p className="text-sm text-gray-500">
                                    Total: {totalProducts} products
                                </p>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center w-full py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                <span className="ml-2 text-gray-600">Loading products...</span>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, index) => (
                                        <ProductCard
                                            key={`${product._id}-${currentPage}`}
                                            product={product}
                                            isInWishlist={isInWishlist(product._id)}
                                            onWishlistToggle={() => handleWishlistToggle(product._id)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                                        <button
                                            onClick={clearAllFilters}
                                            className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && renderPagination()}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #ea580c;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }

                .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #ea580c;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
            `}</style>

            <Footer />
        </>
    );
};

export default AllProducts;
