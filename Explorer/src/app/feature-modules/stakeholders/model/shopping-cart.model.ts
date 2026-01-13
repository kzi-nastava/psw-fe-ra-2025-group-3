export interface ShoppingCartItem {
  tourId: number;
  tourName: string;
  price: number;
}

export interface ShoppingCart {
  touristId: number;
  totalPrice: number;
  items: ShoppingCartItem[];
  bundleItems: BundleOrderItem[];
}
export interface BundleOrderItem {
  bundleId: number;
  bundleName: string;
  price: number;
  tourCount: number;
}