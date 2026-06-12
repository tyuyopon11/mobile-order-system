"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const supabase = createClient();

type Notice = {
  product_name: string;
  price?: number | null;
  buyer_no?: string | null;
  buyer_branch_no?: string | null;
  store_name?: string | null;
};

export default function SaleNotificationPopup() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playSound = () => {
    if (!soundEnabled) return;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.25,
      audioCtx.currentTime + 0.02
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.5
    );

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  const enableSound = () => {
    setSoundEnabled(true);
  };

  useEffect(() => {
    const channel = supabase
      .channel("admin-sale-notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "exhibition_orders",
        },
        async (payload) => {
          const order: any = payload.new;

          const { data: item } = await supabase
            .from("exhibition_items")
            .select("product_name, price")
            .eq("id", order.item_id)
            .single();

          const newNotice: Notice = {
            product_name: item?.product_name ?? "商品名未取得",
            price: item?.price ?? null,
            buyer_no: order.buyer_no ?? null,
            buyer_branch_no: order.buyer_branch_no ?? null,
            store_name: order.store_name ?? null,
          };

          setNotice(newNotice);
          playSound();

          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          timerRef.current = setTimeout(() => {
            setNotice(null);
          }, 12000);
        }
      )
      .subscribe();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={enableSound}
          className={`rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
            soundEnabled
              ? "bg-green-600 text-white"
              : "bg-yellow-400 text-black"
          }`}
        >
          {soundEnabled ? "通知音ON" : "通知音を有効化"}
        </button>
      </div>

      {notice && (
        <div className="fixed right-4 top-4 z-50 w-[340px] rounded-2xl border-4 border-red-500 bg-white p-5 shadow-2xl">
          <div className="mb-3 text-xl font-black text-red-600">
            🔴 新規売約
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-500">商品名</div>
              <div className="text-lg font-bold text-gray-900">
                {notice.product_name}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">買参番号</div>
              <div className="font-bold text-gray-900">
                {notice.buyer_no}
                {notice.buyer_branch_no ? `-${notice.buyer_branch_no}` : ""}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">店名</div>
              <div className="font-bold text-gray-900">
                {notice.store_name ?? "未入力"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="mt-4 w-full rounded-lg bg-red-600 py-2 font-bold text-white"
          >
            確認
          </button>
        </div>
      )}
    </>
  );
}