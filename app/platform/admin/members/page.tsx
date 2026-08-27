import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import MemberActions from "./MemberActions";

type ApprovalStatus = "pending" | "approved" | "rejected";

type MemberRecord = {
  id: string;
  auth_user_id: string | null;
  email: string;
  name: string;
  company_name: string;
  buyer_no: string | null;
  branch_no: string | null;
  phone: string | null;
  role: string;
  approval_status: ApprovalStatus;
  is_active: boolean;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
};

type MembersPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

type MemberTab = {
  key: "pending" | "approved" | "inactive" | "rejected";
  label: string;
};

const tabs: MemberTab[] = [
  {
    key: "pending",
    label: "承認待ち",
  },
  {
    key: "approved",
    label: "承認済み",
  },
  {
    key: "inactive",
    label: "利用停止",
  },
  {
    key: "rejected",
    label: "却下",
  },
];

function getActiveTab(
  value: string | string[] | undefined
): MemberTab["key"] {
  const status = Array.isArray(value) ? value[0] : value;

  if (
    status === "approved" ||
    status === "inactive" ||
    status === "rejected"
  ) {
    return status;
  }

  return "pending";
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getBuyerCode(member: MemberRecord) {
  if (!member.buyer_no) {
    return "—";
  }

  if (!member.branch_no) {
    return member.buyer_no;
  }

  return `${member.buyer_no}-${member.branch_no}`;
}

function getStatusLabel(member: MemberRecord) {
  if (member.approval_status === "pending") return "承認待ち";
  if (member.approval_status === "rejected") return "却下";
  if (!member.is_active) return "利用停止";
  return "承認済み";
}

function getStatusClass(member: MemberRecord) {
  if (member.approval_status === "pending") return "bg-amber-50 text-amber-700";
  if (member.approval_status === "rejected") return "bg-red-50 text-red-700";
  if (!member.is_active) return "bg-stone-100 text-stone-600";
  return "bg-green-100 text-green-800";
}

export default async function MembersPage({
  searchParams,
}: MembersPageProps) {
  const query = await searchParams;
  const activeTab = getActiveTab(query.status);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("platform_users")
    .select(
      `
        id,
        auth_user_id,
        email,
        name,
        company_name,
        buyer_no,
        branch_no,
        phone,
        role,
        approval_status,
        is_active,
        approved_at,
        rejected_at,
        created_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[Lei Port Admin] Failed to load members:",
      error.message
    );
  }

  const members = (data ?? []) as MemberRecord[];

  const counts = {
    pending: members.filter((m) => m.approval_status === "pending").length,
    approved: members.filter((m) => m.approval_status === "approved" && m.is_active).length,
    inactive: members.filter((m) => m.approval_status === "approved" && !m.is_active).length,
    rejected: members.filter((m) => m.approval_status === "rejected").length,
  };

  const visibleMembers = members.filter((member) => {
    if (activeTab === "pending") return member.approval_status === "pending";
    if (activeTab === "approved") return member.approval_status === "approved" && member.is_active;
    if (activeTab === "inactive") return member.approval_status === "approved" && !member.is_active;
    return member.approval_status === "rejected";
  });

  return (
    <div>
      <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-green-800">
          MEMBER MANAGEMENT
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              会員管理
            </h1>

            <p className="mt-4 text-sm leading-7 text-stone-500 sm:text-base">
              Lei Port利用者の承認状態と利用状況を管理します。
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <Link href="/platform/admin/members/new" className="inline-flex items-center justify-center rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900">
              ＋ ショップ管理者登録
            </Link>
            <p className="text-sm text-stone-500">全会員<span className="ml-2 text-2xl font-semibold text-stone-900">{members.length}</span>件</p>
          </div>
        </div>
      </section>

      {error && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-800">
            会員情報を取得できませんでした。
          </p>
          <p className="mt-1 text-xs text-red-600">
            {error.message}
          </p>
        </section>
      )}

      <section className="mt-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Link
                key={tab.key}
                href={`/platform/admin/members?status=${tab.key}`}
                className={`rounded-2xl border px-5 py-4 transition ${
                  isActive
                    ? "border-green-700 bg-green-800 text-white shadow-sm"
                    : "border-stone-200 bg-white text-stone-700 hover:border-green-200 hover:bg-green-50"
                }`}
              >
                <p className="text-xs font-medium">
                  {tab.label}
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {counts[tab.key]}
                  <span className="ml-1 text-xs font-normal">
                    件
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-green-800">
              {tabs.find((tab) => tab.key === activeTab)?.label}
            </p>

            <h2 className="mt-1 text-xl font-semibold text-stone-900">
              会員一覧
            </h2>
          </div>

          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
            {visibleMembers.length}件
          </span>
        </div>

        {visibleMembers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl">🌿</div>
            <p className="mt-4 text-sm font-medium text-stone-700">
              該当する会員はいません
            </p>
            <p className="mt-2 text-xs text-stone-400">
              状態が変更されると、こちらに表示されます。
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {visibleMembers.map((member) => (
              <article
                key={member.id}
                className="px-6 py-6 sm:px-8"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-stone-900">
                        {member.company_name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          member
                        )}`}
                      >
                        {getStatusLabel(member)}
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {member.role}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <dt className="text-xs text-stone-400">
                          担当者
                        </dt>
                        <dd className="mt-1 font-medium text-stone-700">
                          {member.name}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-400">
                          メールアドレス
                        </dt>
                        <dd className="mt-1 break-all font-medium text-stone-700">
                          {member.email}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-400">
                          買参番号
                        </dt>
                        <dd className="mt-1 font-medium text-stone-700">
                          {getBuyerCode(member)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-400">
                          電話番号
                        </dt>
                        <dd className="mt-1 font-medium text-stone-700">
                          {member.phone || "—"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-400">
                          登録日時
                        </dt>
                        <dd className="mt-1 font-medium text-stone-700">
                          {formatDate(member.created_at)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-stone-400">
                          状態更新日時
                        </dt>
                        <dd className="mt-1 font-medium text-stone-700">
                          {formatDate(
                            member.approved_at ??
                              member.rejected_at
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-start gap-3">
                    {activeTab === "pending" && (
                      <MemberActions
                        memberId={member.id}
                        memberName={member.name}
                        companyName={member.company_name}
                      />
                    )}
                    <Link href={`/platform/admin/members/${member.id}`} className="inline-flex rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-900">詳細</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
