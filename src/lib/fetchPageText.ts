import { request } from "undici";


export async function fetchPageText(url: string): Promise<string> {
try {
const res = await request(url, { method: "GET", headers: { "User-Agent": "GeminiReviewBot/1.0" } });
const html = await res.body.text();


// Very light text extraction; for production consider Readability or a proper parser.
const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
const text = noScript
.replace(/<[^>]+>/g, "\n")
.replace(/\n{3,}/g, "\n\n")
.replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g, " ")
.trim();


return text.slice(0, 18000); // keep prompt size manageable
} catch (e: any) {
console.error("fetchPageText error", e?.message);
return "(Không trích xuất được nội dung. Hãy dựa vào metadata/giả định hợp lý.)";
}
}