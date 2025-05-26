// components/CheckoutPayment.jsx

'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CheckoutPayment({
    amount,
    currency,
    customer,
    receipt
}) {
    const [gatewayData, setGatewayData] = useState(null);

    useEffect(() => {
        axios.post('/api/payment/order', {
            amount,
            currency,
            receipt,
            customer,
            returnUrl: `${window.location.origin}/order-placed`
        })
            .then(res => setGatewayData(res.data))
            .catch(console.error);
    }, [amount, currency, receipt, customer]);

    const handlePay = () => {
        if (gatewayData.gateway === 'razorpay') {
            const { order } = gatewayData;
            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                name: 'My Shop',
                handler: r => {
                    window.location.href = `/payment-success?payment_id=${r.razorpay_payment_id}`;
                }
            });
            rzp.open();
        } else {
            // Telr—redirect to their payment page
            // data.order.url looks like: "https://secure.telr.com/.../order.html?..."
            window.location.href = gatewayData.order.url;
        }
    };

    if (!gatewayData) {
        return <button disabled>Loading payment...</button>;
    }

    return (
        <button
            onClick={handlePay}
            className="bg-orange-600 text-white py-2 px-4 rounded"
        >
            Pay {currency} {amount.toFixed(2)}
        </button>
    );
}
