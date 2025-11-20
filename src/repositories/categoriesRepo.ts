import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories, NewCategory } from "../db/schema.js";

export async function createCategory(category: NewCategory) {
    const [newCategory] = await db
        .insert(categories)
        .values(category)
        .returning();
    return newCategory;
}

export async function getCategoryByName(name: string) {
    const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, name))
        .limit(1);
    return category;
}

export async function getCategoryById(id: number) {
    const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);
    return category;
}

export async function deleteCategory(id: number) {
    const deletedCategory = await db.update(categories).set({ isActive: false }).where(eq(categories.id, id)).returning({ id: categories.id });
    return deletedCategory;
}

