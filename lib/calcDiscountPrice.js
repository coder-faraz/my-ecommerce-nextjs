/**
 * Calculates the discounted price of a product based on the original price
 * and the discount percentage.
 *
 * @param {number|string} price - The original price of the product.
 *                                Can be a number or a numeric string.
 * @param {number|string} discountPercent - The discount percentage to apply.
 *                                          Can be a number or a numeric string.
 *
 * @returns {string} - The discounted price, formatted to two decimal places.
 *                     Returns an empty string if inputs are invalid or out of acceptable range.
 *
 * Logic:
 * - Converts both `price` and `discountPercent` to numbers.
 * - Checks for validity: both must be numbers, discount between 0 and 100.
 * - Applies standard discount formula: discounted = price - (price * discount / 100)
 * - Returns the result rounded to two decimal places.
 */
export const calculateDiscountedPrice = (price, discountPercent) => {
    const priceNum = Number(price);
    const discountNum = Number(discountPercent);

    // Validate input: must be valid numbers and discount must be in 0–100% range (non-inclusive)
    if (!priceNum || !discountNum || discountNum <= 0 || discountNum >= 100) return '';

    // Calculate discounted price and format to 2 decimal places
    return (priceNum - (priceNum * discountNum) / 100).toFixed(2);
};
