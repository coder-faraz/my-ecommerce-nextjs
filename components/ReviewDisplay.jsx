import { useState, useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import axios from 'axios';

const ReviewsDisplay = ({ productId, refreshTrigger }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    const fetchReviews = async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/review?productId=${productId}&page=${page}&limit=5&sort=${sortBy}`);

            if (data.success) {
                setReviews(data.reviews);
                setStats(data.stats);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews(currentPage);
        }
    }, [productId, currentPage, refreshTrigger, sortBy]);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Image
                key={index}
                src={index < rating ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="h-4 w-4"
                width={16}
                height={16}
            />
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const msPerMinute = 1000 * 60;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        const diff = now - date;

        if (diff < msPerMinute) {
            return 'Just now';
        }
        if (diff < msPerHour) {
            const mins = Math.floor(diff / msPerMinute);
            return `${mins} minute${mins > 1 ? 's' : ''} ago`;
        }
        if (diff < msPerDay) {
            return 'Today';
        }

        // use whole days from here on
        const days = Math.floor(diff / msPerDay);
        if (days === 1) {
            return 'Yesterday';
        }
        if (days < 7) {
            return `${days} days ago`;
        }
        if (days < 30) {
            const weeks = Math.floor(days / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        if (days < 365) {
            const months = Math.floor(days / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }

        // fallback to a full date for years+
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    const getRatingWidth = (count, total) => {
        return total > 0 ? (count / total) * 100 : 0;
    };

    const getRatingText = (rating) => {
        const ratingTexts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        return ratingTexts[rating] || '';
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto bg-white">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                    <div className="flex gap-8">
                        <div className="space-y-3">
                            <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="space-y-2 flex-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, j) => (
                                        <div key={j} className="h-4 w-4 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 mb-8 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
                </div>
                <p className="text-gray-600">See what our customers have to say about this product</p>
            </div>

            {/* Rating Summary Section */}
            {stats && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 mb-12 border border-orange-200">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Side - Overall Rating */}
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-7xl font-bold text-gray-900 leading-none">
                                    {stats.averageRating.toFixed(1)}
                                </span>
                                <div className="flex mb-3">
                                    {renderStars(Math.round(stats.averageRating))}
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-lg font-medium text-gray-800 mb-1">
                                    {getRatingText(Math.round(stats.averageRating))} Rating
                                </p>
                                <p className="text-gray-600">
                                    Based on <span className="font-semibold">{stats.totalReviews.toLocaleString()}</span> reviews
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Rating Distribution */}
                        <div className="flex-1 max-w-md">
                            <h4 className="font-semibold text-gray-800 mb-4">Rating Breakdown</h4>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-2 w-16">
                                        <span className="text-sm font-medium text-gray-700">{star}</span>
                                        <svg className="w-4 h-4 fill-current text-orange-400" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-700 ease-out"
                                            style={{
                                                width: `${getRatingWidth(stats.distribution[star], stats.totalReviews)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                        {(stats.distribution[star] || 0).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                        All Reviews ({stats?.totalReviews || 0})
                    </h3>

                    {/* Sort Dropdown */}
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                        </div>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h4>
                        <p className="text-gray-500 text-lg mb-4">Be the first to share your experience!</p>
                        <p className="text-gray-400">Your review helps other customers make informed decisions</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review, index) => (
                            <div key={review._id} className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${index !== reviews.length - 1 ? 'mb-6' : ''}`}>
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {review.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-semibold text-gray-800 text-lg">
                                                    {review.userName}
                                                </h4>
                                                {review.isVerifiedPurchase && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {getRatingText(review.rating)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-gray-500">
                                            {formatDate(review.updatedAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="mb-4">
                                    <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* Review Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    {/* <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V8a2 2 0 00-2-2H4.5A2.5 2.5 0 002 8.5v.5m9-2v12l-2-2-2 2V9h4z" />
                                            </svg>
                                            Helpful
                                        </button>
                                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Reply
                                        </button>
                                    </div> */}
                                    {review.status === 'approved' && (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified Review
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-200">
                                {/* Page Info */}
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{((pagination.currentPage - 1) * 5) + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * 5, pagination.totalDocs)}
                                    </span> of{' '}
                                    <span className="font-medium">{pagination.totalDocs}</span> reviews
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={!pagination.hasPrevPage}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                                    >
                                        First
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={!pagination.hasPrevPage}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNum === pagination.currentPage
                                                        ? 'bg-orange-500 text-white shadow-lg'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={!pagination.hasNextPage}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                                    >
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage(pagination.totalPages)}
                                        disabled={!pagination.hasNextPage}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsDisplay;
