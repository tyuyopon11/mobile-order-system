import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import BuyerRoleControls from "./BuyerRoleControls";
import ShopManagerControls from "./ShopManagerControls";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: member }, { data: shops }] = await Promise.all([
    supabaseAdmin.from("platform_users").select("id,email,name,company_name,phone,role,shop_id,approval_status,is_active,created_at,shops(shop_name)").eq("id", id).maybeSingle(),
    supabaseAdmin.from("shops").select("id,shop_name").order("display_order").order("shop_name"),
  ]);
  if (!member) notFound();
  const isShopManager = member.role === "shop" || member.role === "shop_admin";
  const linkedShop = Array.isArray(member.shops) ? member.shops[0] : member.shops;
  const isPendingApproval = member.approval_status === "pending";
  const statusLabel = isPendingApproval
    ? "承認待ち"
    : member.is_active
      ? "利用中"
      : "利用停止";
  const statusClass = isPendingApproval
    ? "bg-amber-50 text-amber-700"
    : member.is_active
      ? "bg-green-100 text-green-800"
      : "bg-stone-100 text-stone-600";
  return <div>
    <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
      <Link href="/platform/admin/members" className="text-sm text-stone-500 hover:text-green-800">← 会員管理へ戻る</Link>
      <p className="mt-6 text-xs font-semibold tracking-[0.28em] text-green-800">MEMBER DETAIL</p>
      <div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold text-stone-900">{member.name}</h1><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{member.role}</span><span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>{statusLabel}</span></div>
    </section>
    <section className="mt-6 rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8"><dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[
      ["会社名", member.company_name], ["メールアドレス", member.email], ["電話番号", member.phone || "—"], ["会員種別", member.role], ["承認状態", member.approval_status], ["管理ショップ", linkedShop?.shop_name || "未設定"]
    ].map(([label,value]) => <div key={label}><dt className="text-xs text-stone-400">{label}</dt><dd className="mt-1 break-all text-sm font-medium text-stone-800">{value}</dd></div>)}</dl></section>
    {isShopManager ? <ShopManagerControls memberId={member.id} currentShopId={member.shop_id} approvalStatus={member.approval_status} isActive={member.is_active} shops={shops ?? []} /> : member.role === "buyer" ? <BuyerRoleControls memberId={member.id} shops={shops ?? []} /> : <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">この会員種別に利用できる権限変更操作はありません。</section>}
  </div>;
}
