export type ProductImage = {
  id: string | number;
  image_url: string;
  sort_order: number | null;
};

export type ProductShop = {
  id: string;
  shop_name: string;
  slug: string;
};

export type Product = {
  id: string | number;
  number: string | number;

  name: string;

  category: string | null;
  item: string | null;
  variety: string | null;

  tree_height: string | null;
  tree_shape: string | null;
  pot_size: string | null;

  quantity: number | null;
  price: number | null;

  origin: string | null;
  producer: string | null;
  staff: string | null;

  comment: string | null;
  jf_code: string | null;

  image: string | null;
  images: ProductImage[];

  shop: ProductShop;
};