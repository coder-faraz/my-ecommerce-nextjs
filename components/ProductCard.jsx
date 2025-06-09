import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product, isInWishlist, onWishlistToggle }) => {

    const { currency, router } = useAppContext();

    const handleWishlistClick = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking wishlist button
        onWishlistToggle();
    };

    const handleProductClick = () => {
        router.push('/product/' + product._id);
        window.scrollTo(0, 0);
    };

    return (
        <div
            onClick={handleProductClick}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                <button
                    onClick={handleWishlistClick}
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 ${isInWishlist
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-white hover:bg-gray-50'
                        }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    {isInWishlist ? (
                        // Filled heart when in wishlist
                        <svg
                            className="h-3 w-3 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    ) : (
                        // Empty heart when not in wishlist
                        <Image
                            className="h-3 w-3"
                            src={assets.heart_icon}
                            alt="heart_icon"
                        />
                    )}
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>

            <div className="flex items-center gap-2">
                <p className="text-xs">{product.rating || 4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(product.rating || 4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <div className="flex flex-col">
                    {product.discountedPrice && product.discountedPrice < product.price ? (
                        <div className="flex items-center gap-2">
                            <p className="text-base font-medium text-green-600">
                                {currency}{product.discountedPrice}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                                {currency}{product.price}
                            </p>
                        </div>
                    ) : (
                        <p className="text-base font-medium">
                            {currency}{product.price}
                        </p>
                    )}
                </div>
                <button className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition">
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard
