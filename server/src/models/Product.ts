export interface IProduct {
  id?: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  active?: boolean;
}