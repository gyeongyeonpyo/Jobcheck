import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { forms, schemaFor, type RequestKind } from "@/lib/requests";
import { rateLimit } from "@/lib/check/rateLimit.ts";

export const runtime = "nodejs";

// 베타 백엔드 (명세 12): 접수 내용을 웹훅으로 전달한다.
// SUBMISSIONS_WEBHOOK_URL 에 Slack·Make·Zapier 등 수신 주소를 등록하면 동작한다.
// TODO: Supabase 등 DB 저장으로 옮기면 이 함수만 바꾸면 된다.
async function deliver(kind: RequestKind, receipt: string, data: unknown): Promise<boolean> {
  const hook = process.env.SUBMISSIONS_WEBHOOK_URL;
  if (!hook) return false;
  const res = await fetch(hook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, receipt, receivedAt: new Date().toISOString(), data }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return Boolean(res?.ok);
}

function receiptNumber(kind: RequestKind) {
  const prefix = { verify: "V", guide: "G", match: "M", contact: "C" }[kind];
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()).replaceAll("-", "");
  return `${prefix}-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request, ctx: { params: Promise<{ kind: string }> }) {
  const { kind } = await ctx.params;
  if (!(kind in forms)) return NextResponse.json({ ok: false, message: "없는 접수 유형입니다." }, { status: 404 });
  const k = kind as RequestKind;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`req:${ip}`).ok) {
    return NextResponse.json({ ok: false, message: "요청이 많습니다. 잠시 뒤 다시 시도해 주세요." }, { status: 429 });
  }

  const parsed = schemaFor(k).safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = forms[k].fields.find((f) => f.name === first?.path[0]);
    const message = field
      ? `${field.label}을(를) 확인해 주세요.`
      : first?.path[0] === "consents"
        ? "필수 동의 항목에 체크해 주세요."
        : (first?.message ?? "입력값을 확인해 주세요.");
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const receipt = receiptNumber(k);
  const delivered = await deliver(k, receipt, parsed.data);
  if (!delivered) {
    // 저장소가 연결되지 않았으면 접수했다고 말하지 않는다
    return NextResponse.json(
      {
        ok: false,
        message: "온라인 접수를 준비하고 있습니다. 베타 오픈 후 다시 이용해 주세요.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, receipt, message: forms[k].done });
}
