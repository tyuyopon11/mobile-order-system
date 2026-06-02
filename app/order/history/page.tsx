"use client";

import { useState } from "react";

type Item = {
  id: string;
  product_name: string;
  spec?: string;
  irisu?: string | number;
  case_qty?: string;
  note?: string;
};

type Order = {
  id: string;
  buyer_no: string;
  buyer_branch_no: string;
  buyer_name: string;
  inputter_name?: string;
  contact_phone?: string;
  delivery_date?: string;
  processed?: boolean;
  processed_at?: string;
  created_at: string;
  items?: Item[];
};

export default function OrderHistoryPage() {
  const [buyerNo, setBuyerNo] = useState("");
  const [buyerBranchNo, setBuyerBranchNo] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchHistory = async () => {
    setMessage("");
    setSearched(false);

    if (!buyerNo.trim()) {
      setMessage("買参番号を入力してください");
      return;
    }

    if (!buyerBranchNo.trim()) {
      setMessage("枝番を入力してください");
      return;
    }

    if (!contactPhone.trim()) {
      setMessage("連絡先を入力してください");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/order-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buyer_no: buyerNo,
        buyer_branch_no: buyerBranchNo,
        contact_phone: contactPhone,
      }),
    });

    const data = await res.json();
    setLoading(false);
    setSearched(true);

    if (!res.ok) {
      setMessage(data.error || "注文履歴の取得に失敗しました");
      setOrders([]);
      return;
    }

    setOrders(data.orders || []);
  };

  return (
    <main className="min-h-screen bg-green-50 px-4 py-5">
      <div className="mx-auto max-w-md space-y-5">
        <header className="rounded-2xl bg-white p-5 shadow">
          <h1 className="text-3xl font-black leading-snug text-green-900">
            注文履歴確認
          </h1>
          <p className="mt-2 font-bold text-green-700">
            過去30日分の注文内容を確認できます
          </p>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow space-y-4">
          <Field label="買参番号" value={buyerNo} setValue={setBuyerNo} />
          <Field
            label="枝番"
            value={buyerBranchNo}
            setValue={setBuyerBranchNo}
          />
          <Field
            label="連絡先（注文時に入力した携帯番号）"
            value={contactPhone}
            setValue={setContactPhone}
            placeholder="例：090-0000-0000"
          />

          <button
            onClick={searchHistory}
            disabled={loading}
            className="w-full rounded-2xl bg-green-700 p-4 text-lg font-black text-white shadow disabled:bg-gray-400"
          >
            {loading ? "確認中..." : "注文履歴を確認する"}
          </button>

          <a
            href="/order"
            className="block w-full rounded-2xl bg-green-100 p-4 text-center text-lg font-black text-green-900 shadow"
          >
            発注画面へ戻る
          </a>
        </section>

        {message && (
          <p className="rounded-2xl bg-white p-4 text-center text-lg font-bold text-red-700 shadow">
            {message}
          </p>
        )}

        {searched && orders.length === 0 && !message && (
          <p className="rounded-2xl bg-white p-5 text-center font-bold text-gray-700 shadow">
            該当する注文履歴はありません
          </p>
        )}

        <section className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-green-100 bg-white p-5 shadow space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-green-900">
                    {order.buyer_name || "買参人名 未入力"}
                  </p>
                  <p className="mt-1 font-bold text-gray-700">
                    注文日時：{formatDateTime(order.created_at)}
                  </p>
                </div>

                <StatusBadge processed={!!order.processed} />
              </div>

              <div className="rounded-xl bg-green-50 p-4 space-y-2 font-bold text-gray-800">
                <p>
                  買参番号：{order.buyer_no}-{order.buyer_branch_no}
                </p>
                <p>入力者名：{order.inputter_name || "未入力"}</p>
                <p>連絡先：{order.contact_phone || "未入力"}</p>
                <p>納品希望日：{order.delivery_date || "未入力"}</p>
                {order.processed && (
                  <p>確認日時：{formatDateTime(order.processed_at || "")}</p>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-black text-green-900">
                  商品明細（{(order.items || []).length}件）
                </h2>

                {(order.items || []).map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="text-lg font-black text-gray-900">
                      {index + 1}. {item.product_name || "品名未入力"}
                    </p>
                    <p className="font-bold text-gray-700">
                      規格：{item.spec || "未入力"}
                    </p>
                    <p className="font-bold text-gray-700">
                      入数：{item.irisu || "未入力"}
                    </p>
                    <p className="font-bold text-gray-700">
                      数量：{item.case_qty || "未入力"}
                    </p>
                    <p className="font-bold text-gray-700">
                      備考：{item.note || "未入力"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="block text-base font-bold text-green-900">{label}</span>
      <input
        className="block w-full rounded-xl border border-green-200 bg-white p-3 text-lg"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </label>
  );
}

function StatusBadge({ processed }: { processed: boolean }) {
  if (processed) {
    return (
      <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
        確認済み
      </span>
    );
  }

  return (
    <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
      受付済み
    </span>
  );
}

function formatDateTime(value: string) {
  if (!value) return "未入力";
  return new Date(value).toLocaleString("ja-JP");
}