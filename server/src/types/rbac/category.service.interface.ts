import { ICategory } from "../../models/Category";

export interface CategoryService {
  createCategory(category: ICategory): Promise< ICategory >;

  updateCategory(id: string, category: Partial< ICategory >): Promise<ICategory>;

  disableCategory(id: string): Promise<void>;

  getAllCategories(): Promise<ICategory[]>;

  getAllCategoriesWithItems(): Promise<ICategory[]>;

  getCategoryById(id: string): Promise<ICategory | null>;

  getCategoryWithItemsById(id: string): Promise<ICategory | null>;
}