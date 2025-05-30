import Category from "@/models/Category";
import connectToDB from "@/config/db";

export async function getCategoryIdByName(categoryName) {
    try {
        await connectToDB();
        const category = await Category.findOne({
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') } // Case-insensitive search
        });
        return category?._id || null;
    } catch (error) {
        console.error('Error finding category:', error);
        return null;
    }
}

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
