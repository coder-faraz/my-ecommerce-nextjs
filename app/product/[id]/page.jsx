"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewForm from "@/components/ReviewForm";
import ReviewsDisplay from "@/components/ReviewDisplay";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { Utility } from "@/lib";

const Product = () => {
    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [reviewRefresh, setReviewRefresh] = useState(0);
    const { id } = useParams();
    const { capitalizeFirstLetter } = Utility();
    const { products, router, addToCart } = useAppContext();

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    useEffect(() => {
        fetchProductData();
    }, [id, products.length])

    const handleReviewSubmitted = () => {
        setReviewRefresh(prev => prev + 1);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Image
                key={index}
                className="h-4 w-4"
                src={index < Math.floor(rating) ? assets.star_icon : assets.star_dull_icon}
                alt="star"
            />
        ));
    };

    return productData ? (<>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
                        <Image
                            src={mainImage || productData.images[0]}
                            alt="alt"
                            className="w-full h-auto object-cover mix-blend-multiply"
                            width={1280}
                            height={720}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.images.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                            >
                                <Image
                                    src={image}
                                    alt="alt"
                                    className="w-full h-auto object-cover mix-blend-multiply"
                                    width={1280}
                                    height={720}
                                />
                            </div>

                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {renderStars(productData.rating || 0)}
                        </div>
                        <p>({productData.rating || 0})</p>
                        <span className="text-gray-500">•</span>
                        <p className="text-gray-500">
                            {productData.reviewCount || 0} review{(productData.reviewCount || 0) !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <p className="text-gray-600 mt-3">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6">
                        {productData.discountedPrice === 0 ? '' : `$${productData.discountedPrice}`}
                        <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                            ${productData.price}
                        </span>
                    </p>
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 font-medium">Brand</td>
                                    <td className="text-gray-800/50 ">{capitalizeFirstLetter(productData.brand)}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Color</td>
                                    <td className="text-gray-800/50 ">{capitalizeFirstLetter(productData.color)}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 font-medium">Category</td>
                                    <td className="text-gray-800/50">
                                        {capitalizeFirstLetter(productData.category)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center mt-10 gap-4">
                        <button onClick={() => addToCart(productData._id)} className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition">
                            Add to Cart
                        </button>
                        <button onClick={() => { addToCart(productData._id); router.push('/cart') }} className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition">
                            Buy now
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Details Tabs */}
            <div className="border-t pt-10">
                <div className="flex gap-8 border-b">
                    {['description', 'reviews', 'add-review'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-1 font-medium transition-colors ${activeTab === tab
                                ? 'text-orange-600 border-b-2 border-orange-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {tab === 'description' && 'Description'}
                            {tab === 'reviews' && 'Reviews'}
                            {tab === 'add-review' && 'Write Review'}
                        </button>
                    ))}
                </div>

                <div className="py-8">
                    {activeTab === 'description' && (
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                                {productData.description}
                            </p>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-3">Product Features</h4>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• High-quality materials</li>
                                        <li>• Durable construction</li>
                                        <li>• Modern design</li>
                                        <li>• Easy to use</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-3">Specifications</h4>
                                    <div className="space-y-2 text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Brand:</span>
                                            <span>{capitalizeFirstLetter(productData.brand)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Color:</span>
                                            <span>{capitalizeFirstLetter(productData.color)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Category:</span>
                                            <span>{capitalizeFirstLetter(productData.category)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <ReviewsDisplay
                            productId={productData._id}
                            refreshTrigger={reviewRefresh}
                        />
                    )}

                    {activeTab === 'add-review' && (
                        <ReviewForm
                            productId={productData._id}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium">Featured <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
                <button className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
                    onClick={() => router.push('/all-products')}
                >
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>
    ) : <Loading />
};

export default Product;
