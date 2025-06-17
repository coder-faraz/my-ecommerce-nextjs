'use client'
import React, { useState } from 'react';
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Home,
    ChevronRight
} from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function ContactPage() {
    // State to hold the contact form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission
        alert('Thank you for your message! We will get back to you soon.');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-orange-500 font-medium">Contact Us</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Call Us */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Phone className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Call Us</h3>
                        <p className="text-gray-600 mb-2">070170 20735</p>
                    </div>

                    {/* Email Us */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Us</h3>
                        <p className="text-gray-600 mb-2">Softechbee@gmail.com</p>
                    </div>

                    {/* Our Location */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Location</h3>
                        <p className="text-gray-600">9F56+WXX, Bisalpur Rd, near Green Park, Pawan Vihar,</p>
                        <p className="text-gray-600">Bareilly, Uttar Pradesh</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="flex items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Get In Touch</h2>
                            <span className="ml-2 text-2xl">👋</span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Full Name (Required)*"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@domain.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Phone Number (Optional)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="Subject"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Your message..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                            >
                                <span>Send Message</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-8">
                        {/* Business Hours */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <Clock className="w-6 h-6 text-orange-500 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Monday - Friday:</span>
                                    <span className="font-medium">9:00 AM - 9:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Saturday:</span>
                                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sunday:</span>
                                    <span className="font-medium">Closed</span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">How can I track my order?</h4>
                                    <p className="text-gray-600 text-sm">You can track your order using the tracking number sent to your email after purchase.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">What's your return policy?</h4>
                                    <p className="text-gray-600 text-sm">We offer a 15-day return policy for all unopened items in original packaging.</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition duration-300">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition duration-300">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center text-white hover:bg-pink-700 transition duration-300">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-800 transition duration-300">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-700 transition duration-300">
                                    <Youtube className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
                        <p className="text-gray-600">Visit our store or get directions to our location</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 h-96 bg-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ecommerce Store</h3>
                                <p className="text-gray-600">9F56+WXX, Bisalpur Rd, near Green Park, Pawan Vihar,</p>
                                <p className="text-gray-600">Bareilly, Uttar Pradesh</p>
                                <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition duration-300">
                                    Get Directions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}