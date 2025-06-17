'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Award, Clock, Target, Heart, Zap, Globe } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const AboutUs = () => {
    const router = useRouter();

    const stats = [
        { number: '10+', label: 'Years Experience' },
        { number: '50K+', label: 'Happy Customers' },
        { number: '100K+', label: 'Products Delivered' },
        { number: '24/7', label: 'Customer Support' }
    ];

    const values = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Trust & Security',
            description: 'We prioritize secure transactions and protect customer data with advanced encryption technologies.'
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Customer First',
            description: 'Our customers are at the heart of everything we do. We strive to exceed expectations in every interaction.'
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'Quality Excellence',
            description: 'We maintain the highest standards in product quality and service delivery across all operations.'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Innovation',
            description: 'We continuously evolve with cutting-edge technology to provide the best ecommerce experience.'
        }
    ];

    const team = [
        {
            name: 'Enter Name',
            role: 'CEO & Founder',
            description: 'Visionary leader with 15+ years in ecommerce and digital transformation.'
        },
        {
            name: 'Enter Name',
            role: 'CTO',
            description: 'Technology expert specializing in scalable ecommerce platforms and security.'
        },
        {
            name: 'Enter Name',
            role: 'Head of Operations',
            description: 'Operations specialist ensuring smooth logistics and customer satisfaction.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">About Ecommerce</h1>
                        <p className="text-xl max-w-3xl mx-auto leading-relaxed">
                            Transforming the way people shop online through innovative solutions,
                            exceptional service, and unwavering commitment to customer satisfaction.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-orange-500 mb-2">{stat.number}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-black mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Founded in 2016, Ecommerce began with a simple vision: to create an online marketplace
                                    that combines cutting-edge technology with exceptional customer service. What started as
                                    a small team of passionate entrepreneurs has grown into a leading ecommerce platform
                                    serving customers worldwide.
                                </p>
                                <p>
                                    Our journey has been marked by continuous innovation and an unwavering commitment to
                                    understanding and meeting our customers' evolving needs. We've built our reputation
                                    on reliability, quality, and the ability to adapt to the rapidly changing digital landscape.
                                </p>
                                <p>
                                    Today, we're proud to be a trusted partner for thousands of businesses and millions
                                    of customers, facilitating seamless transactions and creating value through our
                                    comprehensive ecommerce solutions.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                            <Globe className="w-32 h-32 text-orange-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-black text-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="text-center lg:text-left">
                            <Target className="w-12 h-12 text-orange-500 mx-auto lg:mx-0 mb-4" />
                            <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
                            <p className="text-gray-300 leading-relaxed">
                                To empower businesses and individuals by providing innovative, secure, and user-friendly
                                ecommerce solutions that drive growth and create meaningful connections between buyers and sellers.
                            </p>
                        </div>
                        <div className="text-center lg:text-left">
                            <Heart className="w-12 h-12 text-orange-500 mx-auto lg:mx-0 mb-4" />
                            <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
                            <p className="text-gray-300 leading-relaxed">
                                To be the world's most trusted and innovative ecommerce platform, setting new standards
                                for online commerce through technology, service excellence, and sustainable business practices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-black mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These principles guide every decision we make and every interaction we have with our customers and partners.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="text-orange-500 mb-4 flex justify-center">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-black mb-3">{value.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-black mb-4">Leadership Team</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Meet the experienced professionals who drive our vision forward and ensure our continued success.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center">
                                <div className="w-24 h-24 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <Users className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-black mb-2">{member.name}</h3>
                                <p className="text-orange-500 font-medium mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-black mb-4">Why Choose Ecommerce?</h2>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg border-l-4 border-orange-500 shadow-md">
                            <Shield className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-xl font-semibold text-black mb-3">Safe & Secure</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Advanced encryption and security protocols protect your data and transactions,
                                ensuring peace of mind with every purchase.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-lg border-l-4 border-orange-500 shadow-md">
                            <Clock className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-xl font-semibold text-black mb-3">Fast & Reliable</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Optimized systems and streamlined processes ensure quick order processing
                                and reliable delivery every time.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-lg border-l-4 border-orange-500 shadow-md">
                            <Award className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-xl font-semibold text-black mb-3">Quality Assured</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Rigorous quality control and vendor verification ensure that every product
                                meets our high standards of excellence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of satisfied customers who trust Ecommerce for their online shopping needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            onClick={() => router.push('/contact')}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default AboutUs;