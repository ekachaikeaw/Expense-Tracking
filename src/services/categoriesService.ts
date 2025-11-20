import * as categoriesRepo from "../repositories/categoriesRepo.js";
import { BadRequestError } from "../utils/errors.js";
import { NewCategory } from "../db/schema.js";

export async function createCategory(category: NewCategory) {
    const newCategory = await categoriesRepo.createCategory(category);
    return newCategory;
}

export async function deleteCategory(id: number) {
    const category = await categoriesRepo.getCategoryById(id);
    if (!category) throw new BadRequestError("Category not found");
    const deletedCategory = await categoriesRepo.deleteCategory(id);
    return deletedCategory;
}
