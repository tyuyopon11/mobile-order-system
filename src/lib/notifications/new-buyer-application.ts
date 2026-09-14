import "server-only";

import { createHash } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const MESSAGE = "🔔 CIRQNEX\n新規利用申請があります。\n管理画面から確認してください。";

// Stable, notification-specific UUID: concurrent requests use the same LINE key.
function retryKey(applicationId: string): string {
  const hex = createHash("sha256")
    .update(`cirqnex:new-buyer-application:${applicationId}`)
    .digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Best effort only. Never propagate notification/lookup failures to registration. */
export async function notifyNewBuyerApplication(
  user: Pick<User, "id" | "created_at" | "identities">,
  signUpStartedAt: number,
): Promise<void> {
  let applicationId: string | undefined;
  let signal: AbortSignal | undefined;
  try {
    // Supabase can return a successful response for an existing account.
    // Fail closed on ambiguous timestamps/identities, including unconfirmed resubmits.
    const createdAt = Date.parse(user.created_at);
    if (
      !user.identities?.length ||
      !Number.isFinite(signUpStartedAt) ||
      !Number.isFinite(createdAt) ||
      createdAt < signUpStartedAt ||
      createdAt > Date.now()
    ) return;

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const recipient = process.env.CIRQNEX_ADMIN_LINE_USER_ID;
    if (!token || !recipient) {
      console.warn("[CIRQNEX LINE]", { kind: "missing_env" });
      return;
    }

    // One shared deadline bounds both the saved-profile check and the push.
    signal = AbortSignal.timeout(5_000);
    const { data: application, error } = await createAdminClient()
      .from("platform_users")
      .select("id, role, approval_status, is_active, created_at")
      .eq("auth_user_id", user.id)
      .abortSignal(signal)
      .maybeSingle();

    if (error) {
      console.warn("[CIRQNEX LINE]", {
        kind: signal.aborted ? "timeout" : "profile_lookup_failed",
      });
      return;
    }
    if (
      !application ||
      typeof application.id !== "string" ||
      application.role !== "buyer" ||
      application.approval_status !== "pending" ||
      application.is_active !== false ||
      !Number.isFinite(Date.parse(application.created_at)) ||
      Date.parse(application.created_at) < signUpStartedAt ||
      Date.parse(application.created_at) > Date.now()
    ) return;

    applicationId = application.id;
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Line-Retry-Key": retryKey(applicationId),
      },
      body: JSON.stringify({
        to: recipient,
        messages: [{ type: "text", text: MESSAGE }],
      }),
      signal,
      cache: "no-store",
      redirect: "error",
    });

    // 409 with an accepted request ID means LINE already accepted this key.
    if (!response.ok && !(
      response.status === 409 && response.headers.has("x-line-accepted-request-id")
    )) {
      console.warn("[CIRQNEX LINE]", {
        kind: "push_rejected", status: response.status, applicationId,
      });
    }
    // Do not read/log the response body: it is unnecessary and may contain IDs.
  } catch {
    console.warn("[CIRQNEX LINE]", {
      kind: signal?.aborted ? "timeout" : "notification_failed", applicationId,
    });
  }
}
