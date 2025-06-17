'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Home,
    ChevronRight,
    Shield,
    Eye,
    Lock,
    UserCheck,
    FileText,
    Mail,
    Clock,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
    const [expandedSection, setExpandedSection] = useState(null);
    const router = useRouter();

    const toggleSection = (index) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    const policyData = {
        lastUpdated: "June 17, 2025",
        effectiveDate: "June 17, 2025"
    };

    const quickLinks = [
        { title: "Information We Collect", href: "#information-collect" },
        { title: "How We Use Your Information", href: "#how-we-use" },
        { title: "Information Sharing", href: "#information-sharing" },
        { title: "Data Security", href: "#data-security" },
        { title: "Your Rights", href: "#your-rights" },
        { title: "Cookies Policy", href: "#cookies-policy" },
        { title: "Contact Us", href: "#contact-us" }
    ];

    const accordionData = [
        {
            title: "What personal information do you collect?",
            content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email address, phone number, shipping address, and payment information."
        },
        {
            title: "How do you use my personal information?",
            content: "We use your information to process orders, provide customer service, send you updates about your orders, improve our services, and comply with legal obligations."
        },
        {
            title: "Do you share my information with third parties?",
            content: "We only share your information with trusted service providers who help us operate our business, such as payment processors and shipping companies. We never sell your personal information."
        },
        {
            title: "How can I access or delete my personal information?",
            content: "You can access, update, or delete your personal information by logging into your account or contacting our customer service team. We will respond to your request within 30 days."
        },
        {
            title: "How do you protect my information?",
            content: "We use industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information from unauthorized access."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <Shield className="w-12 h-12 text-orange-500 mr-3" />
                            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-orange-500 font-medium">Privacy Policy</span>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Last Updated</h3>
                        <p className="text-gray-600">{policyData.lastUpdated}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <UserCheck className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
                        <p className="text-gray-600">Access, update, or delete your data</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Security</h3>
                        <p className="text-gray-600">Industry-standard protection</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                            <nav className="space-y-2">
                                {quickLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className="flex items-center px-3 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-md transition duration-200"
                                    >
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        {link.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Introduction */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <Info className="w-6 h-6 text-orange-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
                            </div>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Welcome to Ecommerce. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    This privacy policy is provided in a layered format so you can click through to the specific areas set out below. Please also use the Glossary to understand the meaning of some of the terms used in this privacy policy.
                                </p>
                            </div>
                        </div>

                        {/* Information We Collect */}
                        <div id="information-collect" className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <Eye className="w-6 h-6 text-orange-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span>Identity data: first name, last name, username or similar identifier</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span>Contact data: billing address, delivery address, email address, telephone numbers</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span>Financial data: bank account and payment card details</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <span>Transaction data: details about payments and other details of products purchased</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and information about your usage of our website.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* How We Use Information */}
                        <div id="how-we-use" className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <FileText className="w-6 h-6 text-orange-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Processing</h3>
                                    <p className="text-gray-600">To process your orders, manage payments, and provide customer service related to your purchases.</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
                                    <p className="text-gray-600">To send you important updates about your orders, account changes, and promotional offers (with your consent).</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Improvement</h3>
                                    <p className="text-gray-600">To analyze usage patterns and improve our website, products, and services based on your preferences.</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Compliance</h3>
                                    <p className="text-gray-600">To comply with applicable laws, regulations, and legal processes.</p>
                                </div>
                            </div>
                        </div>

                        {/* Data Security */}
                        <div id="data-security" className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <Lock className="w-6 h-6 text-orange-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-6">
                                <p className="text-orange-800 font-medium">
                                    🔒 Your data security is our top priority. We implement multiple layers of protection to keep your information safe.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                        <span className="text-green-600 font-bold">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">SSL Encryption</h4>
                                        <p className="text-gray-600">All data transmission is encrypted using industry-standard SSL technology.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                        <span className="text-green-600 font-bold">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Secure Storage</h4>
                                        <p className="text-gray-600">Personal data is stored on secure servers with restricted access.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                                        <span className="text-green-600 font-bold">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Regular Audits</h4>
                                        <p className="text-gray-600">We conduct regular security audits and updates to maintain protection.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Your Rights */}
                        <div id="your-rights" className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <UserCheck className="w-6 h-6 text-orange-500 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                            </div>
                            <p className="text-gray-600 mb-6">Under data protection laws, you have rights including:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Request access to your personal data",
                                    "Request correction of your personal data",
                                    "Request erasure of your personal data",
                                    "Object to processing of your personal data",
                                    "Request restriction of processing",
                                    "Request transfer of your personal data",
                                    "Right to withdraw consent"
                                ].map((right, index) => (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <ChevronRight className="w-4 h-4 text-orange-500 mr-3" />
                                        <span className="text-gray-700">{right}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {accordionData.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection(index)}
                                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition duration-200"
                                        >
                                            <span className="font-medium text-gray-900">{item.title}</span>
                                            {expandedSection === index ? (
                                                <ChevronUp className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-500" />
                                            )}
                                        </button>
                                        {expandedSection === index && (
                                            <div className="px-6 pb-4">
                                                <p className="text-gray-600 leading-relaxed">{item.content}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div id="contact-us" className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6 cursor-pointer"
                                onClick={() => router.push('/contact')}
                            >
                                <Mail className="w-6 h-6 text-orange-500 mr-3" />
                                <span className="text-2xl font-bold text-gray-900">Contact Us</span>
                                <ArrowLeft className="w-6 h-6 text-gray-600 cursor-pointer" />
                                <span className="text-xl font-medium text-gray-900">Click Here</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}