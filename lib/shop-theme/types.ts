export type ShopType =
  | "takashimaya"
  | "market"
  | "producer"
  | "wholesaler";

export type ShopIdentity = {
  shop_name?: string | null;
  slug?: string | null;
  type?: string | null;
};

export type ShopTheme = {
  type: ShopType;

  brand: {
    eyebrow: string;
    catchCopy: string;
    subCopy: string;
    collectionLabel: string;
    collectionTitle: string;
    collectionDescription: string;
  };

  shopCard: {
    eyebrow: string;
    description: string;
    linkLabel: string;
  };

  purchase: {
    eyebrow: string;
    title: string;
    soldOutTitle: string;
    description: string;
    buttonLabel: string;
    soldOutButtonLabel: string;
    note: string;
  };

  visibility: {
    producer: boolean;
    productionArea: boolean;
    staff: boolean;
    jfCode: boolean;
    lpsCategory: boolean;
    price: boolean;
    availableQuantity: boolean;
  };
};
