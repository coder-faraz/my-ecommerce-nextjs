export const calculateDiscountedPrice = (price, discountPercent) => {
    const priceNum = Number(price);
    const discountNum = Number(discountPercent);

    if (!priceNum || !discountNum || discountNum <= 0 || discountNum >= 100) return '';

    return (priceNum - (priceNum * discountNum) / 100).toFixed(2);
};
