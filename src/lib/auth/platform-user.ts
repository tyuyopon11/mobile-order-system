import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { logMission25Perf, startMission25Perf } from "@/lib/performance/mission25-perf";

export type PlatformUserRole =
  | "admin"
  | "buyer"
  | "shop"
  | "shop_admin"
  | "producer"
  | "vendor"
  | "corporate";

export function isShopRole(
  role: string | null | undefined
): role is "shop" | "shop_admin" {
  return role === "shop" || role === "shop_admin";
}

export type PlatformApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type PlatformUser = {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  company_name: string;
  buyer_no: string | null;
  branch_no: string | null;
  phone: string | null;
  shop_id: string | null;
  role: PlatformUserRole;
  approval_status: PlatformApprovalStatus;
  is_active: boolean;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformAccessState =
  | "unauthenticated"
  | "profile_missing"
  | "pending"
  | "rejected"
  | "inactive"
  | "approved";

export type PlatformAccessResult = {
  state: PlatformAccessState;
  authUserId: string | null;
  authEmail: string | null;
  platformUser: PlatformUser | null;
};

const PLATFORM_USER_COLUMNS = [
  "id",
  "auth_user_id",
  "email",
  "name",
  "company_name",
  "buyer_no",
  "branch_no",
  "phone",
  "shop_id",
  "role",
  "approval_status",
  "is_active",
  "approved_at",
  "approved_by",
  "rejected_at",
  "rejected_by",
  "rejection_reason",
  "last_login_at",
  "created_at",
  "updated_at",
].join(",");

export const getPlatformAccess = cache(async function getPlatformAccess(): Promise<PlatformAccessResult> {
  const supabase = await createClient();

  const authStartedAt = startMission25Perf();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  logMission25Perf("server.auth", authStartedAt);

  if (authError) {
    console.error(
      "[Lei Port] Supabase Auth user fetch failed:",
      authError.message
    );
  }

  if (!user) {
    return {
      state: "unauthenticated",
      authUserId: null,
      authEmail: null,
      platformUser: null,
    };
  }

  const platformUserStartedAt = startMission25Perf();
  const { data, error: profileError } = await supabase
    .from("platform_users")
    .select(PLATFORM_USER_COLUMNS)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  logMission25Perf("platform_user", platformUserStartedAt);

  if (profileError) {
    console.error(
      "[Lei Port] platform_users fetch failed:",
      profileError.message
    );

    return {
      state: "profile_missing",
      authUserId: user.id,
      authEmail: user.email ?? null,
      platformUser: null,
    };
  }

  const platformUser = data as PlatformUser | null;

  if (!platformUser) {
    console.warn(
      "[Lei Port] Auth user exists but platform_users record is missing:",
      user.id
    );

    return {
      state: "profile_missing",
      authUserId: user.id,
      authEmail: user.email ?? null,
      platformUser: null,
    };
  }

  if (platformUser.approval_status === "pending") {
    return {
      state: "pending",
      authUserId: user.id,
      authEmail: user.email ?? null,
      platformUser,
    };
  }

  if (platformUser.approval_status === "rejected") {
    return {
      state: "rejected",
      authUserId: user.id,
      authEmail: user.email ?? null,
      platformUser,
    };
  }

  if (!platformUser.is_active) {
    return {
      state: "inactive",
      authUserId: user.id,
      authEmail: user.email ?? null,
      platformUser,
    };
  }

  return {
    state: "approved",
    authUserId: user.id,
    authEmail: user.email ?? null,
    platformUser,
  };
});

export function isApprovedPlatformUser(
  access: PlatformAccessResult
): boolean {
  return access.state === "approved";
}

export function isApprovedPlatformAdmin(
  access: PlatformAccessResult
): boolean {
  return (
    access.state === "approved" &&
    access.platformUser?.role === "admin"
  );
}

export function isApprovedShopUser(access: PlatformAccessResult): boolean {
  return (
    access.state === "approved" &&
    isShopRole(access.platformUser?.role)
  );
}
