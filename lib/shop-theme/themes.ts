import type { ShopTheme } from "./types";

export const takashimayaTheme: ShopTheme = {
  type: "takashimaya",

  brand: {
    eyebrow: "SELECTED PLANTS",
    catchCopy: "目利きのプロが選ぶ、ここにしかない一鉢。",
    subCopy:
      "樹形、幹、葉の表情まで。一鉢ごとの個性を見極めて選んだ植物をご紹介します。",
    collectionLabel: "COLLECTION",
    collectionTitle: "Plant Collection",
    collectionDescription:
      "同じ品種でも、同じ姿の植物はありません。それぞれの表情をゆっくりご覧ください。",
  },

  shopCard: {
    eyebrow: "SELECTED BY",
    description:
      "目利きのプロが樹形や葉の表情を見極め、ここにしかない一鉢を選んでいます。",
    linkLabel: "ショップを見る",
  },

  purchase: {
    eyebrow: "ORDER",
    title: "ご購入について",
    soldOutTitle: "こちらの植物は売約済みです",
    description:
      "内容をご確認のうえ、購入手続きへお進みください。",
    buttonLabel: "購入手続きへ",
    soldOutButtonLabel: "売約済み",
    note: "ご注文後、担当者より詳細をご案内いたします。",
  },

  visibility: {
    producer: false,
    productionArea: false,
    staff: false,
    jfCode: false,
    lpsCategory: true,
    price: true,
    availableQuantity: false,
  },
};

export const marketTheme: ShopTheme = {
  type: "market",

  brand: {
    eyebrow: "CIRQNEX SHOP",
    catchCopy: "植物の価値と出会うマーケット。",
    subCopy:
      "季節の植物や新しい品種など、ショップが選んだおすすめの商品をご紹介します。",
    collectionLabel: "COLLECTION",
    collectionTitle: "Collection",
    collectionDescription:
      "植物の姿や特徴を見ながら、気になる一鉢をお選びください。",
  },

  shopCard: {
    eyebrow: "CIRQNEX SHOP",
    description:
      "東京フラワーポートが取り扱う植物を、商品情報とともにご案内しています。",
    linkLabel: "ショップを見る",
  },

  purchase: {
    eyebrow: "ORDER",
    title: "ご購入について",
    soldOutTitle: "こちらの植物は売約済みです",
    description:
      "数量と商品情報をご確認のうえ、購入手続きへお進みください。",
    buttonLabel: "購入手続きへ",
    soldOutButtonLabel: "売約済み",
    note: "ご注文後、担当者より詳細をご案内いたします。",
  },

  visibility: {
    producer: true,
    productionArea: true,
    staff: true,
    jfCode: true,
    lpsCategory: true,
    price: true,
    availableQuantity: true,
  },
};

export const producerTheme: ShopTheme = {
  ...marketTheme,
  type: "producer",

  brand: {
    ...marketTheme.brand,
    eyebrow: "GROWER'S COLLECTION",
    catchCopy: "育てる人の想いと出会う植物。",
    subCopy:
      "生産者の技術や土地の個性とともに、一鉢ずつ丁寧に育てられた植物をご紹介します。",
  },

  shopCard: {
    ...marketTheme.shopCard,
    eyebrow: "GROWN BY",
    description:
      "育てる人の想いや技術とともに、植物の個性をご紹介しています。",
  },
};

export const wholesalerTheme: ShopTheme = {
  ...marketTheme,
  type: "wholesaler",

  brand: {
    ...marketTheme.brand,
    eyebrow: "PROFESSIONAL SELECTION",
    catchCopy: "プロの仕入れに、新しい選択肢を。",
    subCopy:
      "植物の特徴、販売可能数量、取引情報を確認しながら、仕入れ商品をお選びいただけます。",
  },

  shopCard: {
    ...marketTheme.shopCard,
    eyebrow: "WHOLESALE SHOP",
    description:
      "プロ向けの商品情報と販売可能数量を確認しながら、仕入れ商品をお選びいただけます。",
  },
};
