import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export async function GET() {
  let buildId = "unknown";

  try {
    buildId = (await readFile(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8")).trim();
  } catch {}

  return NextResponse.json(
    { buildId },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
