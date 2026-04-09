import { ICategory } from "../../models/Category";
import { CategoryService } from "../../types/rbac/category.service.interface";

export class CategoryServiceImpl implements CategoryService {

  constructor(private categoryRepository: any) {}

  async createCategory(category: ICategory): Promise<ICategory> {
    return await this.categoryRepository.create(category);
  }

  async updateCategory(id: string, category: Partial<ICategory>): Promise<ICategory> {
    return await this.categoryRepository.update(id, category);
  }

  async disableCategory(id: string): Promise<void> {
    await this.categoryRepository.disable(id);
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await this.categoryRepository.findAll();
  }

  async getAllCategoriesWithItems(): Promise<ICategory[]> {
    return await this.categoryRepository.findAllWithItems();
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await this.categoryRepository.findById(id);
  }

  async getCategoryWithItemsById(id: string): Promise<ICategory | null> {
    return await this.categoryRepository.findByIdWithItems(id);
  }
}