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

    const fetchReviews = async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/review?productId=${productId}&page=${page}&limit=5`);

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
    }, [productId, currentPage, refreshTrigger]);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Image
                key={index}
                src={index < rating ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="h-4 w-4"
            />
        ));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRatingWidth = (count, total) => {
        return total > 0 ? (count / total) * 100 : 0;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>
            </div>

            {/* Rating Summary Section */}
            {stats && (
                <div className="flex flex-col lg:flex-row gap-12 mb-12">
                    {/* Left Side - Overall Rating */}
                    <div className="flex flex-col items-center lg:items-start">
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-6xl font-bold text-gray-900">
                                {stats.averageRating.toFixed(1)}
                            </span>
                            <div className="flex mb-2">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-center lg:text-left">
                            <span className="font-medium">{stats.totalReviews.toLocaleString()}</span> Ratings & <br />
                            <span className="font-medium">{reviews.length.toLocaleString()}</span> Reviews
                        </p>
                    </div>

                    {/* Right Side - Rating Distribution */}
                    <div className="flex-1 max-w-md">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-1 w-12">
                                    <span className="text-sm font-medium text-gray-700">{star}</span>
                                    <svg className="w-3 h-3 fill-current text-gray-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-full rounded-full transition-all duration-500 ease-out"
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
            )}

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Customer Reviews ({stats?.totalReviews || 0})
                </h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <div className="text-gray-400 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">No reviews yet</p>
                        <p className="text-gray-400 mt-1">Be the first to review this product!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review, index) => (
                            <div key={review._id} className={`py-6 ${index !== reviews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                {/* Review Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex">
                                        {renderStars(review.rating)}
                                    </div>
                                    {review.isVerifiedPurchase && (
                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>

                                {/* Review Content */}
                                <div className="mb-4">
                                    <p className="text-gray-800 leading-relaxed text-base">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* Review Footer */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                            {review.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-700">
                                            {review.userName}
                                        </span>
                                    </div>
                                    <span className="text-gray-500">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-6 pt-8 border-t border-gray-100">
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

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                                        <span className="font-medium">{pagination.totalPages}</span>
                                    </span>
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsDisplay;
