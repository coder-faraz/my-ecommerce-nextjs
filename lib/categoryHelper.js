import Category from "@/models/Category";
import connectToDB from "@/config/db";

/**
 * Retrieves the MongoDB ObjectId of a category based on its name.
 *
 * @param {string} categoryName - The name of the category to search for.
 * @returns {Promise<string|null>} - Returns the category ID if found, otherwise null.
 *
 * Details:
 * - Establishes a database connection.
 * - Performs a case-insensitive search using a regular expression.
 * - Returns the `_id` field of the matched category, or null if no match is found.
 */
export async function getCategoryIdByName(categoryName) {
    try {
        await connectToDB();
        const category = await Category.findOne({
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') } // Case-insensitive exact match
        });
        return category?._id || null;
    } catch (error) {
        console.error('Error finding category:', error);
        return null;
    }
}

/**
 * Fetches all categories from the database, sorted alphabetically by name.
 *
 * @returns {Promise<Array>} - Returns an array of category documents.
 *
 * Details:
 * - Connects to the MongoDB database.
 * - Retrieves all documents from the `Category` collection.
 * - Sorts them in ascending order based on the `name` field.
 * - Returns an empty array if an error occurs.
 */
export async function getAllCategories() {
    try {
        await connectToDB();
        const categories = await Category.find({}).sort({ name: 1 });
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}
