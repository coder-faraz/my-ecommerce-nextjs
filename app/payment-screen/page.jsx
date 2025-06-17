'use client'
import { useState } from 'react';
import { useRouter } from "next/navigation";
import {
    ArrowLeft, CreditCard, Calendar, Shield, Smartphone, Building, Truck, Wallet,
    ChevronUp, ChevronDown, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentPage() {
    const [selectedPayment, setSelectedPayment] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    // Card Fields
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const router = useRouter();

    const paymentMethods = [
        {
            id: 'upi',
            icon: <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">UPI</div>,
            title: 'UPI',
            subtitle: 'Pay by any UPI app',
            offer: 'Up to ₹0 instant saving on GooglePay',
            offerColor: 'text-green-600'
        },
        {
            id: 'card',
            icon: <CreditCard className="w-6 h-6 text-gray-600" />,
            title: 'Credit / Debit / ATM Card',
            subtitle: 'Add and secure cards as per RBI guidelines',
            offer: '5% Unlimited Cashback on Flipkart Axis Bank Credit Card',
            offerColor: 'text-green-600'
        },
        {
            id: 'emi',
            icon: <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center"><div className="w-3 h-3 bg-gray-400 rounded-sm"></div></div>,
            title: 'EMI',
            subtitle: 'Get Debit and Cardless EMIs on HDFC Bank'
        },
        {
            id: 'netbanking',
            icon: <Building className="w-6 h-6 text-gray-600" />,
            title: 'Net Banking'
        },
        {
            id: 'cod',
            icon: <Truck className="w-6 h-6 text-gray-600" />,
            title: 'Cash on Delivery'
        },
        // {
        //     id: 'wallet',
        //     icon: <Wallet className="w-6 h-6 text-gray-400" />,
        //     title: 'Wallet',
        //     disabled: true,
        //     status: 'Unavailable'
        // }
    ];

    const isCardValid =
        /^[0-9]{16}$/.test(cardNumber.replace(/\s/g, '')) &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) &&
        /^[0-9]{3}$/.test(cvv);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 cursor-pointer"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600 cursor-pointer" />
                            <h1 className="text-xl font-medium text-gray-900">Complete Payment</h1>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">100% Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Methods */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h2 className="font-medium text-gray-900">Payment Methods</h2>
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="divide-y">
                                    {paymentMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => !method.disabled && setSelectedPayment(method.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {method.icon}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-gray-900">{method.title}</h3>
                                                        {method.status && (
                                                            <div className="flex items-center gap-1 text-gray-500">
                                                                <span className="text-sm">{method.status}</span>
                                                                <HelpCircle className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {method.subtitle && <p className="text-sm text-gray-600 mt-1">{method.subtitle}</p>}
                                                    {method.offer && <p className={`text-sm mt-1 ${method.offerColor}`}>{method.offer}</p>}
                                                </div>
                                                {!method.disabled && (
                                                    <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                                        {selectedPayment === method.id && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Section - Payment Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[300px]">
                            <AnimatePresence mode="wait">
                                {selectedPayment === 'upi' && (
                                    <motion.div
                                        key="upi"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                    >
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="font-medium text-gray-900">Add new UPI ID</span>
                                            <a href="#" className="text-blue-600 text-sm ml-auto">How to find?</a>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                        placeholder="Enter your UPI ID"
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                                                        onClick={() => console.log('verify clicked')}
                                                    >
                                                        Verify
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                className="w-full py-3 bg-gray-600 text-white rounded-md font-medium text-lg hover:bg-gray-700"
                                                disabled={!upiId.trim()}
                                            >
                                                Pay ₹1000
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedPayment === 'card' && (
                                    <motion.div
                                        key="card"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                    >
                                        <p className="text-sm text-gray-600 mb-4">
                                            <strong>Note:</strong> Please ensure your card can be used for online transactions. <a href="#" className="text-blue-600 underline">Learn More</a>
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value)}
                                                    maxLength={19}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Thru</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM / YY"
                                                        value={expiry}
                                                        onChange={(e) => setExpiry(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                                    <input
                                                        type="password"
                                                        placeholder="CVV"
                                                        value={cvv}
                                                        onChange={(e) => setCvv(e.target.value)}
                                                        maxLength={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                className="w-full py-3 bg-yellow-400 text-black rounded-md font-semibold text-lg hover:bg-yellow-500"
                                                disabled={!isCardValid}
                                            >
                                                Pay ₹1000
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedPayment === 'emi' && (
                                    <motion.div
                                        key="emi"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900">Get EMI in 3 easy steps</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <CreditCard className="w-4 h-4" />
                                                <span>Choose bank</span>
                                            </div>
                                            <span>→</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Choose plan</span>
                                            </div>
                                            <span>→</span>
                                            <div className="flex items-center gap-1">
                                                <Shield className="w-4 h-4" />
                                                <span>Confirm & Pay</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            {[
                                                { name: 'HDFC Bank', emi: '₹183/m', logo: '/hdfc-logo.png' },
                                                { name: 'ICICI Bank', emi: '₹99/m', logo: '/icici-logo.png' },
                                                { name: 'Kotak Bank', emi: '₹688/m', logo: '/kotak-logo.png' },
                                            ].map((bank, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center p-4 rounded-lg border ${index === 0 ? 'border-blue-600' : 'border-gray-300'} cursor-pointer`}
                                                >
                                                    <input type="radio" name="emi-bank" defaultChecked={index === 0} className="mr-4" />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{bank.name}</div>
                                                        <div className="text-sm text-gray-600">EMI From <span className="font-semibold">{bank.emi}</span></div>
                                                    </div>
                                                    <img src={bank.logo} alt={bank.name} className="w-6 h-6" />
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                                            See Plans
                                        </button>

                                        <button className="w-full text-blue-600 text-sm font-medium hover:underline mt-2 text-left"
                                            onClick={() => router.push("/emi-options")}
                                        >
                                            All EMI Options →
                                        </button>
                                    </motion.div>
                                )}

                                {selectedPayment === 'netbanking' && (
                                    <motion.div
                                        key="netbanking"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                    >
                                        {/* <div className="mb-4 flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="font-medium text-gray-900">Pay using Net Banking</span>
                                            <a href="#" className="text-blue-600 text-sm ml-auto">Know more</a>
                                        </div> */}

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Select your bank</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">-- Choose Bank --</option>
                                                    <option value="hdfc">HDFC Bank</option>
                                                    <option value="icici">ICICI Bank</option>
                                                    <option value="sbi">State Bank of India</option>
                                                    <option value="axis">Axis Bank</option>
                                                    <option value="kotak">Kotak Mahindra Bank</option>
                                                    <option value="yes">YES Bank</option>
                                                    <option value="bob">Bank of Baroda</option>
                                                    <option value="indusind">IndusInd Bank</option>
                                                </select>
                                            </div>

                                            <button
                                                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium text-lg hover:bg-blue-700"
                                            >
                                                Pay ₹1000
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedPayment === 'cod' && (
                                    <motion.div
                                        key="cod"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                    >
                                        {/* <div className="mb-4 flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="font-medium text-gray-900">Cash on Delivery</span>
                                        </div> */}

                                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4 text-sm">
                                            Due to handling costs, a nominal fee of ₹10 will be charged
                                        </div>

                                        <button
                                            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md text-lg"
                                        >
                                            Place Order
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Price (1 item)</span>
                                    <span className="font-medium">₹1,999</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Protect Promise Fee</span>
                                    <span className="font-medium">₹9</span>
                                </div>
                                <hr className="border-gray-200" />
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span className="text-gray-900">Total Amount</span>
                                    <span className="text-blue-600">₹2,008</span>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-700 font-semibold">99% Cashback</span>
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-green-700 text-sm mt-1">
                                        Claim now with payment offers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
