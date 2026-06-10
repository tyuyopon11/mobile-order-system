import { createClient } from "@/lib/supabase/server";
import ConfirmSecureButton from "./confirm-secure-button";

type SearchParams = {
  buyer_no?: string;
  branch?: string;
  buyer_name?: string;
  contact?: string;
  password?: string;
  success?: string;
  error?: string;
};

export default async function ExhibitionBuyerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const buyerNo = params.buyer_no || "";
  const branch = params.branch || "00";
  const buyerName = params.buyer_name || "";
  const contact = params.contact || "";
  const password = params.password || "";

  const isInputComplete =
    buyerNo && branch && buyerName && contact && password;

  const { data: exhibition } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("is_active", true)
    .single();

  const isLoginOk =
    exhibition &&
    isInputComplete &&
    exhibition.access_password === password;

  const { data: items } = isLoginOk
    ? await supabase
        .from("exhibition_items")
        .select(`
          id,
          item_no,
          product_name,
          spec,
          price,
          origin,
          producer,
          staff,
          comment,
          status,
          exhibition_images (
            id,
            image_url,
            sort_order
          )
        `)
        .eq("exhibition_id", exhibition.id)
        .eq("status", "selling")
        .order("item_no", { ascending: true })
    : { data: [] };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md space-y-5">
        <div className="rounded-xl bg-white p-5 shadow">
          <h1 className="text-2xl font-bold">園芸部WEB展示販売会</h1>
          <p className="mt-2 text-sm text-gray-600">
            買参番号・店名・連絡先を入力して商品をご確認ください。
          </p>
        </div>

        {!isLoginOk && (
          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="mb-4 text-xl font-bold">ログイン</h2>

            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold">買参番号</label>
                <input
                  name="buyer_no"
                  defaultValue={buyerNo}
                  inputMode="numeric"
                  className="w-full rounded-lg border px-3 py-3 text-lg"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">枝番</label>
                <input
                  name="branch"
                  defaultValue={branch}
                  inputMode="numeric"
                  className="w-full rounded-lg border px-3 py-3 text-lg"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">店名</label>
                <input
                  name="buyer_name"
                  defaultValue={buyerName}
                  className="w-full rounded-lg border px-3 py-3 text-lg"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">連絡先</label>
                <input
                  name="contact"
                  defaultValue={contact}
                  inputMode="tel"
                  placeholder="電話番号など"
                  className="w-full rounded-lg border px-3 py-3 text-lg"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  展示会パスワード
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full rounded-lg border px-3 py-3 text-lg"
                  required
                />
              </div>

              {isInputComplete && !isLoginOk && (
                <p className="rounded bg-red-50 p-3 text-sm text-red-600">
                  入力内容または展示会パスワードが違います。
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-green-700 px-4 py-4 text-lg font-bold text-white"
              >
                商品を見る
              </button>
            </form>
          </div>
        )}

        {isLoginOk && (
          <>
            <div className="rounded-xl bg-white p-4 shadow">
              <p className="text-sm text-gray-600">ログイン中</p>
              <p className="font-bold">
                {buyerNo}-{branch} / {buyerName}
              </p>
              <p className="text-sm text-gray-600">{contact}</p>
            </div>

            {params.success === "1" && (
              <div className="rounded-xl bg-green-50 p-4 font-bold text-green-700 shadow">
                商品を確保しました。
              </div>
            )}

            {params.error && (
              <div className="rounded-xl bg-red-50 p-4 font-bold text-red-600 shadow">
                処理に失敗しました。もう一度お試しください。
              </div>
            )}

            <div className="space-y-4">
              {(items ?? []).map((item: any) => {
                const images = [...(item.exhibition_images ?? [])].sort(
                  (a: any, b: any) =>
                    (a.sort_order ?? 0) - (b.sort_order ?? 0)
                );

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl bg-white shadow"
                  >
                    {images.length > 0 ? (
                      <div>
                        <div className="flex snap-x snap-mandatory overflow-x-auto">
                          {images.map((image: any, index: number) => (
                            <div
                              key={image.id}
                              className="min-w-full snap-center"
                            >
                              <img
                                src={image.image_url}
                                alt={`${item.product_name} 画像${index + 1}`}
                                className="h-72 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>

                        {images.length > 1 && (
                          <div className="flex justify-center gap-2 bg-white py-2">
                            {images.map((_: any, index: number) => (
                              <span
                                key={index}
                                className="h-2 w-2 rounded-full bg-gray-300"
                              />
                            ))}
                          </div>
                        )}

                        <p className="bg-gray-50 py-2 text-center text-xs text-gray-500">
                          画像は横にスワイプできます
                        </p>
                      </div>
                    ) : (
                      <div className="flex h-72 items-center justify-center bg-gray-100 text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="space-y-3 p-4">
                      <p className="text-sm text-gray-500">No.{item.item_no}</p>

                      <h2 className="text-xl font-bold">{item.product_name}</h2>

                      <div className="space-y-1 text-sm text-gray-700">
                        <p>規格：{item.spec || "-"}</p>
                        <p>産地：{item.origin || "-"}</p>
                        <p>生産者：{item.producer || "-"}</p>
                        <p>担当：{item.staff || "-"}</p>
                      </div>

                      {item.comment && (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm">
                          {item.comment}
                        </p>
                      )}

                      <p className="text-2xl font-bold">
                        ¥{Number(item.price ?? 0).toLocaleString()}
                      </p>

                      <form action="/api/exhibition/orders" method="POST">
                        <input type="hidden" name="item_id" value={item.id} />
                        <input type="hidden" name="buyer_no" value={buyerNo} />
                        <input type="hidden" name="branch" value={branch} />
                        <input
                          type="hidden"
                          name="buyer_name"
                          value={buyerName}
                        />
                        <input type="hidden" name="contact" value={contact} />
                        <input type="hidden" name="password" value={password} />

                        <ConfirmSecureButton
                          productName={item.product_name}
                          price={Number(item.price ?? 0)}
                        />
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>

            {(items ?? []).length === 0 && (
              <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
                現在販売中の商品はありません。
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}