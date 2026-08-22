"use client";

import { useSearchParams } from "next/navigation";
import { LineArtCoverBg } from "@/components/LineArtCoverBg";
import {
  WALLPAPER_PATTERN_IDS,
  type WallpaperPatternId,
} from "@/lib/line-art-wallpapers";

function isPattern(v: string | null): v is WallpaperPatternId {
  return !!v && (WALLPAPER_PATTERN_IDS as string[]).includes(v);
}

/** `/?bg=monogram` などで入場背景を切替（実機見比べ用） */
export function HomeEntryBg({
  defaultPattern = "scatterDense",
}: {
  defaultPattern?: WallpaperPatternId;
}) {
  const params = useSearchParams();
  const raw = params.get("bg");
  const pattern = isPattern(raw) ? raw : defaultPattern;
  return <LineArtCoverBg pattern={pattern} />;
}
