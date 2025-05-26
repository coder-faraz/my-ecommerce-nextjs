import Razorpay from 'razorpay';
import axios from 'axios';
import { NextApiRequest, NextResponse } from 'next/server';

export async function POST(request) {
    const {
        amount,
        currency,    // e.g. "INR" or "AED"
        receipt,
        customer,    // { name, email, phone }
        returnUrl    // callback URL after payment
    } = request.body;

    try {
        if (currency === 'INR') {
            // ----- RAZORPAY -----
            const rz = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });

            const order = await rz.orders.create({
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt,
                payment_capture: 1
            });

            return NextResponse.json({ success: true, gateway: 'razorpay', order });
        } else if (currency === 'AED') {
            // ----- TELR -----
            const telrPayload = {
                store: process.env.TELR_STORE_ID,
                auth_key: process.env.TELR_AUTH_KEY,
                tran: {
                    test: 1,             // 1 = test mode
                    type: "sale",
                    class: "ecom",
                    cartid: receipt,
                    description: "Purchase at My Shop",
                    currency: "AED",
                    amount: amount.toFixed(2),
                    language: "en",
                    // Customer info:
                    "udf1": customer.name,
                    "udf2": customer.email,
                    "udf3": customer.phone,
                    // URLs:
                    "return": returnUrl,
                    "callback": returnUrl
                }
            };

            const { data } = await axios.post(
                "https://secure.telr.com/gateway/order.json",
                telrPayload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!data || !data.order) {
                throw new Error("Invalid Telr response");
            }

            return res.status(200).json({
                gateway: "telr",
                order: data.order
            });
        } else {
            return res.status(400).json({ error: "Unsupported currency" });
        }
    } catch (err) {
        console.error('Payment order', err);
        res.status(500).json({ error: err.message });
    }
}
