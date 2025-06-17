"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const banks = [
    {
        name: "HDFC Bank",
        logo: "/hdfc-logo.png",
        emiFrom: "₹183/m",
        plans: [
            { label: "Popular", amount: "₹351 for 6 months", interest: "16% p.a." },
            { amount: "₹239 for 9 months", interest: "16% p.a." },
            { amount: "₹183 for 12 months", interest: "16% p.a." },
        ],
    },
    {
        name: "ICICI Bank",
        logo: "/icici-logo.png",
        emiFrom: "₹99/m",
        plans: [],
    },
    {
        name: "Kotak Bank",
        logo: "/kotak-logo.png",
        emiFrom: "₹688/m",
        plans: [],
    },
    {
        name: "AU Small Finance Bank",
        logo: "/au-logo.png",
        emiFrom: "₹99/m",
        plans: [],
    },
    {
        name: "Federal Bank",
        logo: "/federal-logo.png",
        emiFrom: "₹99/m",
        plans: [],
    },
];

export default function EMIOptionsPage() {
    const [selectedBankIndex, setSelectedBankIndex] = useState(0);
    const selectedBank = banks[selectedBankIndex];
    const router = useRouter();

    return (
        <div className="flex max-w-7xl mx-auto border rounded-md shadow-md mt-8 overflow-hidden">
            {/* Left Section */}
            <div className="w-1/3 p-4 border-r bg-white">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => router.back()} className="text-blue-600 hover:underline">
                        ← Back
                    </button>
                    <h2 className="text-xl font-semibold">Choose EMI Option</h2>
                </div>
                <input
                    type="text"
                    placeholder="Search for bank"
                    className="w-full p-2 border rounded-md mb-4"
                />
                <div className="space-y-3">
                    {banks.map((bank, idx) => (
                        <div
                            key={bank.name}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${idx === selectedBankIndex
                                ? "bg-blue-100 border border-blue-500"
                                : "hover:bg-gray-100"
                                }`}
                            onClick={() => setSelectedBankIndex(idx)}
                        >
                            <div className="flex items-center gap-2">
                                <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                                <div>
                                    <div className="font-medium">{bank.name}</div>
                                    <div className="text-xs text-gray-600">EMI From {bank.emiFrom}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="text-sm text-blue-600 font-medium mt-2">See All</button>
            </div>

            {/* Right Section */}
            <div className="w-2/3 p-6 space-y-6 bg-gray-50">
                <h3 className="text-md font-semibold">Installment</h3>

                {selectedBank.plans.length > 0 ? (
                    <div className="space-y-3">
                        {selectedBank.plans.map((plan, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 border rounded-md"
                            >
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="emiPlan" defaultChecked={index === 0} />
                                    <div className="flex flex-col">
                                        {plan.label && (
                                            <span className="text-xs text-green-600 font-medium border border-green-500 px-2 py-0.5 rounded w-fit">
                                                {plan.label}
                                            </span>
                                        )}
                                        <span className="text-sm font-medium">{plan.amount}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700">{plan.interest}</div>
                            </div>
                        ))}
                        <button className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                            Choose Plan
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-500">No plans available for this bank.</div>
                )}

                {/* Price Summary */}
                <div className="bg-blue-50 p-4 mt-4 rounded-md space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                        <span>Price (1 item)</span>
                        <span>₹999</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Interest charged by Bank</span>
                        <span>₹95</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span>₹1,094</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
