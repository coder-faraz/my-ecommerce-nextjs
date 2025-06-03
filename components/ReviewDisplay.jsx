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
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Rating Summary */}
            {stats && (
                <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Overall Rating */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-800 mb-2">
                                {stats.averageRating}
                            </div>
                            <div className="flex justify-center mb-2">
                                {renderStars(Math.round(stats.averageRating))}
                            </div>
                            <div className="text-gray-600">
                                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm w-8">{star} star</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${getRatingWidth(stats.distribution[star], stats.totalReviews)}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm w-8 text-right">
                                        {stats.distribution[star] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-800">
                    Customer Reviews ({stats?.totalReviews || 0})
                </h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No reviews yet. Be the first to review this product!
                    </div>
                ) : (
                    <>
                        {reviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">
                                                {renderStars(review.rating)}
                                            </div>
                                            <span className="font-medium text-gray-800">
                                                {review.userName}
                                            </span>
                                            {review.isVerifiedPurchase && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    {review.comment}
                                </p>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <span className="text-gray-600">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                    disabled={!pagination.hasNextPage}
                                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReviewsDisplay;
