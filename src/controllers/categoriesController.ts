import { Request, Response } from "express";
import * as categoriesService from "../services/categoriesService.js";
import { responseWithJSON } from "../utils/resJson.js";
import { NewCategory } from "../db/schema.js";

export async function createCategory(req: Request, res: Response) {
    const newCategoryData: NewCategory = req.body;
    const createdCategory = await categoriesService.createCategory(newCategoryData);
    responseWithJSON(res, 201, {
        message: "Category created successfully",
        data: createdCategory,
    });
}

export async function deleteCategory(req: Request, res: Response) {
    const categoryId = parseInt(req.params.id);
    const deletedCategory = await categoriesService.deleteCategory(categoryId);
    responseWithJSON(res, 200, {
        message: "Category deleted successfully",
        data: deletedCategory,
    });
}
