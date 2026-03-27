export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  created_at: Date;
  updated_at: Date;
}

export interface Favorite {
  id: number;
  productId: number;
  created_at: Date;
  product: Product;
}

export interface AddFavoriteRequest {
  productId: number;
}

export interface RemoveFavoriteRequest {
  productId: number;
}

export interface FavoriteResponse {
  id: number;
  productId: number;
  created_at: Date;
  product: Product;
}

export interface FavoriteState {
  favorites: Favorite[];
  favoriteIds: Set<number>;
  loading: boolean;
  error: string | null;
}
