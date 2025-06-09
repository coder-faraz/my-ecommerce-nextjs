'use client';
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

const CouponSection = ({ cartTotal, onCouponApplied }) => {
    const { user, cart } = useAppContext();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchAvailableCoupons = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `/api/coupons/available?cartTotal=${cartTotal}&cartItems=${JSON.stringify(getCartItemsForCoupon())}`
            );
            const data = await response.json();
            if (response.ok) {
                setAvailableCoupons(data.coupons || []);
                setShowSuggestions(true);
            } else {
                setError(data.message || 'Error fetching available coupons');
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setError('Error fetching available coupons');
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/coupons/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    couponCode: couponCode.trim().toUpperCase(),
                    cartTotal,
                    cartItems: getCartItemsForCoupon(),
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setAppliedCoupon(data.coupon);
                onCouponApplied(data.discount);
                setError('');
                setShowSuggestions(false);
            } else {
                setError(data.message || 'Invalid coupon code');
                setAppliedCoupon(null);
                onCouponApplied(null);
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            setError('Error applying coupon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setError('');
        onCouponApplied(null);
    };

    const applySuggestedCoupon = (coupon) => {
        setCouponCode(coupon.code);
        setShowSuggestions(false);
        setTimeout(() => applyCoupon(), 100);
    };

    const getCartItemsForCoupon = () => {
        // Transform cart items from context to match backend expectation
        if (!cart || !cart.items) return [];
        return cart.items.map(item => ({
            productId: item.productId || item._id,
            category: item.category || 'unknown' // Adjust based on your product data
        }));
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Discount Coupons</h3>

            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            {loading && <div className="text-gray-600 text-sm mb-3">Loading...</div>}

            {!appliedCoupon ? (
                <>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <button
                            onClick={applyCoupon}
                            disabled={loading || !couponCode.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>

                    <button
                        onClick={fetchAvailableCoupons}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Show Available Coupons'}
                    </button>

                    {showSuggestions && availableCoupons.length > 0 && (
                        <div className="mt-4 bg-white p-4 rounded-lg shadow">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Coupons</h4>
                            <div className="space-y-3">
                                {availableCoupons.map(coupon => (
                                    <div key={coupon._id} className="border p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {coupon.code} - {coupon.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {coupon.description}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Discount: {coupon.discountType === 'percentage'
                                                        ? `${coupon.discountValue}%`
                                                        : `$${coupon.discountValue}`}
                                                    {coupon.maxDiscountAmount && ` (Max: $${coupon.maxDiscountAmount})`}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Min Order: ${coupon.minOrderAmount || 0} | Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Potential Saving: ${coupon.potentialDiscount.toFixed(2)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => applySuggestedCoupon(coupon)}
                                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                                disabled={loading}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowSuggestions(false)}
                                className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                                disabled={loading}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-green-100 p-3 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                        Coupon Applied: {appliedCoupon.code} - {appliedCoupon.name}
                    </p>
                    <p className="text-xs text-green-700">
                        Discount: {appliedCoupon.discountType === 'percentage'
                            ? `${appliedCoupon.discountValue}%`
                            : `$${appliedCoupon.discountValue}`}
                    </p>
                    <button
                        onClick={removeCoupon}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        disabled={loading}
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};

export default CouponSection;