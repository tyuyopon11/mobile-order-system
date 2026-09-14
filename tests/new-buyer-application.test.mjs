import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);

function load(file, mocks, globals = {}) {
  const source = ts.transpileModule(readFileSync(new URL(file, root), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (name) => name in mocks ? mocks[name] : require(name),
    Date, AbortSignal, FormData, ...globals,
  });
  return exports;
}

function setup(options = {}) {
  const started = Date.now() - 100;
  const created = new Date(started + 50).toISOString();
  const user = { id: "test-auth-id", created_at: created, identities: [{}], ...options.user };
  const application = {
    id: "test-application-id", role: "buyer", approval_status: "pending",
    is_active: false, created_at: created, ...options.application,
  };
  const pushes = [];
  const logs = [];
  const queries = [];
  let lookupSignal;
  const builder = {
    select(value) { queries.push(["select", value]); return this; },
    eq(...value) { queries.push(["eq", ...value]); return this; },
    abortSignal(value) { lookupSignal = value; return this; },
    async maybeSingle() {
      if (options.lookupThrow) throw new Error("secret applicant details");
      if (options.lookupTimeout) return waitForAbort(lookupSignal);
      return { data: options.missing ? null : application, error: options.lookupError };
    },
  };
  const env = {
    LINE_CHANNEL_ACCESS_TOKEN: "fake-secret-token",
    CIRQNEX_ADMIN_LINE_USER_ID: "fake-secret-recipient",
    ...options.env,
  };
  const { notifyNewBuyerApplication: notify } = load(
    "src/lib/notifications/new-buyer-application.ts",
    {
      "server-only": {},
      "@/lib/supabase/admin": { createAdminClient() {
        if (options.adminThrow) throw new Error("secret config");
        return { from(table) { queries.push(["from", table]); return builder; } };
      } },
    },
    {
      process: { env },
      console: { warn: (...args) => logs.push(args) },
      fetch: async (url, init) => {
        pushes.push({ url, ...init });
        if (options.pushTimeout) return waitForAbort(init.signal);
        if (options.pushThrow) throw new Error("fake-secret-token fake-secret-recipient applicant");
        return new Response(null, {
          status: options.status ?? 200,
          headers: options.accepted ? { "x-line-accepted-request-id": "test" } : {},
        });
      },
    },
  );
  return { notify, started, user, pushes, logs, queries, get lookupSignal() { return lookupSignal; } };
}

function waitForAbort(signal) {
  return new Promise((resolve, reject) => {
    // Keep the test process alive while the real 5-second AbortSignal timer runs.
    const timer = setTimeout(() => reject(new Error("deadline not enforced")), 6500);
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
}

test("saved new pending inactive buyer sends exactly the fixed text", async () => {
  const h = setup();
  await h.notify(h.user, h.started);
  assert.equal(h.pushes.length, 1);
  const request = h.pushes[0];
  assert.equal(request.url, "https://api.line.me/v2/bot/message/push");
  assert.equal(request.method, "POST");
  assert.equal(request.redirect, "error");
  assert.equal(request.signal, h.lookupSignal);
  assert.deepEqual(JSON.parse(request.body), {
    to: "fake-secret-recipient",
    messages: [{ type: "text", text: "🔔 CIRQNEX\n新規利用申請があります。\n管理画面から確認してください。" }],
  });
  assert.equal(h.logs.length, 0);
  assert.deepEqual(h.queries, [
    ["from", "platform_users"],
    ["select", "id, role, approval_status, is_active, created_at"],
    ["eq", "auth_user_id", "test-auth-id"],
  ]);
});

test("concurrent attempts share a UUID retry key; another application differs", async () => {
  const h = setup();
  await Promise.all([h.notify(h.user, h.started), h.notify(h.user, h.started)]);
  const key = h.pushes[0].headers["X-Line-Retry-Key"];
  assert.match(key, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-8[a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.equal(key, h.pushes[1].headers["X-Line-Retry-Key"]);
  const other = setup({ application: { id: "other-application" } });
  await other.notify(other.user, other.started);
  assert.notEqual(key, other.pushes[0].headers["X-Line-Retry-Key"]);
});

for (const [name, options] of Object.entries({
  "existing unconfirmed user": { user: { created_at: "2020-01-01T00:00:00Z" } },
  "obfuscated existing user": { user: { identities: [] } },
  "missing identities": { user: { identities: undefined } },
  "invalid auth timestamp": { user: { created_at: "invalid" } },
  "future auth timestamp": { user: { created_at: "2099-01-01T00:00:00Z" } },
  "missing saved row": { missing: true },
  "admin": { application: { role: "admin" } },
  "shop": { application: { role: "shop" } },
  "approved": { application: { approval_status: "approved" } },
  "rejected": { application: { approval_status: "rejected" } },
  "active": { application: { is_active: true } },
  "ambiguous active flag": { application: { is_active: null } },
  "old saved row": { application: { created_at: "2020-01-01T00:00:00Z" } },
  "invalid saved timestamp": { application: { created_at: "invalid" } },
  "missing token": { env: { LINE_CHANNEL_ACCESS_TOKEN: "" } },
  "missing recipient": { env: { CIRQNEX_ADMIN_LINE_USER_ID: "" } },
  "lookup error": { lookupError: { message: "secret details" } },
  "lookup exception": { lookupThrow: true },
  "missing Supabase config": { adminThrow: true },
})) {
  test(`${name} does not send and does not throw`, async () => {
    const h = setup(options);
    await h.notify(h.user, h.started);
    assert.equal(h.pushes.length, 0);
    assert.doesNotMatch(JSON.stringify(h.logs), /secret|applicant|recipient/);
  });
}

for (const status of [400, 401, 403, 409, 429, 500]) {
  test(`HTTP ${status} is contained and logs no response payload`, async () => {
    const h = setup({ status });
    await h.notify(h.user, h.started);
    assert.equal(h.pushes.length, 1);
    assert.equal(h.logs[0][1].kind, "push_rejected");
    assert.equal(h.logs[0][1].status, status);
    assert.doesNotMatch(JSON.stringify(h.logs), /secret|applicant|recipient/);
  });
}

test("LINE already-accepted retry is treated as success", async () => {
  const h = setup({ status: 409, accepted: true });
  await h.notify(h.user, h.started);
  assert.equal(h.logs.length, 0);
});

test("network exception is contained without logging its message", async () => {
  const h = setup({ pushThrow: true });
  await h.notify(h.user, h.started);
  assert.equal(h.logs[0][1].kind, "notification_failed");
  assert.doesNotMatch(JSON.stringify(h.logs), /secret|applicant|recipient/);
});

test("lookup and push each obey the actual five-second deadline", async () => {
  await Promise.all(["lookupTimeout", "pushTimeout"].map(async (mode) => {
    const h = setup({ [mode]: true });
    const before = Date.now();
    await h.notify(h.user, h.started);
    assert.ok(Date.now() - before >= 4900);
    assert.ok(Date.now() - before < 6300);
    assert.equal(h.logs[0][1].kind, "timeout");
  }));
});

test("registration remains successful for every contained notification failure", async () => {
  for (const options of [
    { pushThrow: true }, { status: 500 }, { lookupError: {} },
    { env: { LINE_CHANNEL_ACCESS_TOKEN: "" } }, { adminThrow: true },
  ]) {
    const h = setup(options);
    const events = [];
    const { register } = load("app/platform/register/actions.ts", {
      "@/lib/supabase/server": { createClient: async () => ({ auth: {
        signUp: async () => {
          events.push("saved");
          // Newly-created timestamps must be within this registration call.
          h.user.created_at = new Date().toISOString();
          return { data: { user: h.user }, error: null };
        },
        signOut: async () => { events.push("signed-out"); return { error: null }; },
      } }) },
      "@/lib/notifications/new-buyer-application": {
        notifyNewBuyerApplication: async (user, started) => {
          events.push("notification");
          // Helper failure behavior tested above; allow this mocked saved row's timestamp.
          await h.notify(user, Math.min(started, h.started));
        },
      },
    });
    const form = new FormData();
    for (const [key, value] of Object.entries({
      companyName: "Test", name: "Test", email: "test@example.invalid",
      password: "test-password", passwordConfirm: "test-password",
    })) form.set(key, value);
    const result = await register({}, form);
    assert.equal(result.success, true);
    assert.deepEqual(events, ["saved", "signed-out", "notification"]);
  }
});

test("failed Auth registration never invokes notification", async () => {
  let notifications = 0;
  const { register } = load("app/platform/register/actions.ts", {
    "@/lib/supabase/server": { createClient: async () => ({ auth: {
      signUp: async () => ({ data: { user: null }, error: { message: "Already registered" } }),
    } }) },
    "@/lib/notifications/new-buyer-application": {
      notifyNewBuyerApplication: async () => { notifications++; },
    },
  }, { console: { error() {} } });
  const form = new FormData();
  for (const [key, value] of Object.entries({
    companyName: "Test", name: "Test", email: "test@example.invalid",
    password: "test-password", passwordConfirm: "test-password",
  })) form.set(key, value);
  assert.equal((await register({}, form)).success, false);
  assert.equal(notifications, 0);
});
