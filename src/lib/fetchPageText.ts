export async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    const html = await res.text();

    // bỏ script/style rồi tách text sạch
    const withoutScripts = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    const text = withoutScripts.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    return text;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    // throw để API route bắt lỗi
    throw new Error(`fetchPageText failed: ${message}`);
  }
}
