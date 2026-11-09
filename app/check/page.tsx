import type { Metadata } from "next";
import CheckClient from "./CheckClient";
import { llmConfigured } from "@/lib/check/llm.ts";

export const metadata: Metadata = {
  title: "이 공고 안전한가? 구인공고 무료 확인",
  description: "지원하기 전에 구인공고가 안전한지 무료로 확인하세요. 확인 항목과 근거를 보여 드립니다.",
};

export const dynamic = "force-dynamic";

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-12 md:px-8 md:pb-28 md:pt-20">
      <div className="mx-auto max-w-[760px]">
        <h1 className="text-balance text-[28px] font-bold leading-[1.35] tracking-[-0.015em] md:text-[38px]">
          이 공고, 지원하기 전에 확인해 보세요.
        </h1>
        <p className="mt-4 text-ink-soft">
          구인광고의 확인 항목과 근거를 무료로 보여 드립니다. 안전한지 위험한지 판정하지 않고,
          무엇을 더 확인해야 하는지 알려 드립니다.
        </p>
        <CheckClient enabled={llmConfigured()} />
      </div>
    </div>
  );
}
