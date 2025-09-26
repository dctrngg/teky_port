import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { fetchPageText } from "../../../lib/fetchPageText";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const BodySchema = z.object({
  url: z.string().url(),
  studentName: z.string().min(1).max(100).optional(),
  language: z.enum(["vi", "en"]).default("vi"),
});

type ParsedSections = { section1: string; section2: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const { url, studentName, language } = BodySchema.parse(body);

    const pageText = await fetchPageText(url);
    const prompt = buildPrompt({ url, pageText, studentName, language });

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // ✅ rawText không bị gán lại → dùng const để hết prefer-const
    const rawText = result.response.text();

    // Làm sạch cơ bản (KHÔNG thêm '-' ở bước này)
    const cleaned = rawText
      .replace(/\*/g, "")                  // bỏ dấu *
      .replace(/\(?giả định\)?/gi, "")     // bỏ (giả định)/giả định
      .replace(/[ \t]+\n/g, "\n")
      .trim();

    // Tách 2 phần trước
    const parsed = parseTwoSections(cleaned);

    // Chuẩn hoá bullet sau khi đã tách
    const section1 = normalizeBullets(parsed.section1, /Noi dung bai hoc/i);
    const section2 = normalizeBullets(parsed.section2, /Nhan xet hoc sinh/i);

    return NextResponse.json({ ok: true, section1, section2 });
  } catch (err: unknown) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

function buildPrompt({
  url,
  pageText,
  studentName,
  language,
}: {
  url: string;
  pageText: string;
  studentName?: string;
  language: "vi" | "en";
}): string {
  const name = studentName ? `Tên học sinh: ${studentName}` : "";
  const langIntro = language === "vi" ? "Hãy trả lời bằng tiếng Việt." : "Reply in English.";

  return `Bạn là giáo viên bộ môn CNTT, đang được yêu cầu viết báo cáo nhận xét dựa trên porfolio (đường link: ${url}). ${langIntro}

Dưới đây là văn bản đã trích xuất từ trang porfolio (rút gọn, có thể có thiếu sót):
---
${pageText.slice(0, 14000)}
---

Yêu cầu đầu ra: Viết đúng 2 phần lớn, theo thứ tự như sau (không thêm phần mở đầu/kết):

1) Noi dung bai hoc
- Tóm tắt các kiến thức/kỹ năng mà học sinh đã học hoặc áp dụng qua porfolio này (ví dụ: công nghệ, công cụ, quy trình, tư duy thiết kế, kỹ năng mềm).
- Liệt kê có cấu trúc, súc tích, song vẫn đủ chiều sâu, trích dẫn ví dụ cụ thể từ porfolio.

2) Nhan xet hoc sinh
- Đánh giá chung: kỹ thuật, thẩm mỹ, cách trình bày, mức độ hoàn thiện, tính sáng tạo.
- Góp ý cải thiện: rõ ràng, khả năng mở rộng, tổ chức code/nội dung, kiểm thử, hiệu năng, bảo mật, khả năng trình bày.
- Đưa ra 3-5 việc làm cụ thể để nâng cấp porfolio trong 1-2 tuần tới.

Yêu cầu trình bày:
- Hãy trả lời bằng giọng văn của một giáo viên giàu kinh nghiệm, khách quan, mang tính xây dựng.
- Tránh nói quá chung chung, hãy cụ thể và thực tế.
- Tránh sử dụng các cụm từ như "Dựa trên porfolio của em", "Từ những gì em đã chia sẻ", "Có thể thấy rằng", v.v.
- Không thêm phần mở đầu/kết luận.
- Viết bằng tiếng Việt phổ thông, lịch sự, khách quan.
- Dùng gạch đầu dòng, tiêu đề rõ ràng.
- Gọi học sinh bằng "em".
- Kết quả **phải** chứa đúng hai phần, đánh dấu rõ bằng tiêu đề: "Noi dung bai hoc" và "Nhan xet hoc sinh".

${name}`;
}

/** Regex linh hoạt cho tiêu đề */
const TITLE_1 = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:1\)|\d+\.)?\s*Noi dung bai hoc\b/i;
const TITLE_2 = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:2\)|\d+\.)?\s*Nhan xet hoc sinh\b/i;

function parseTwoSections(raw: string): ParsedSections {
  const m1 = TITLE_1.exec(raw);
  const m2 = TITLE_2.exec(raw);

  if (m1 && m2) {
    const start1 = m1.index;
    const start2 = m2.index;
    if (start1 <= start2) {
      const part1 = raw.slice(start1, start2).trim();
      const part2 = raw.slice(start2).trim();
      return { section1: part1, section2: part2 };
    }
  }

  const altSplit =
    raw.split(/(?:^|\n)\s*(?:#{1,6}\s*)?(?:2\)|\d+\.)?\s*Nhan\s*xet\s*hoc\s*sinh\b/i);
  if (altSplit.length === 2) {
    const left = altSplit[0].trim();
    const right = raw.slice(raw.length - altSplit[1].length).trim();
    return {
      section1: left,
      section2: right.startsWith("Nhan xet hoc sinh") ? right : `Nhan xet hoc sinh\n${right}`,
    };
  }

  return { section1: raw.trim(), section2: "" };
}

/** Thêm '-' cho nội dung, bỏ dòng tiêu đề */
function normalizeBullets(block: string, headerPattern: RegExp): string {
  const lines = block.split("\n");
  return lines
    .map((l, idx) => {
      const line = l.trim();
      if (!line) return "";
      if (headerPattern.test(line)) return "";

      // Nếu dòng đã có bullet/number thì giữ nguyên
      if (/^(-|\*|\u2022|\d+[\.\)])\s+/.test(line)) return line;

      // Thêm dấu '-' cho các dòng nội dung thường
      return `- ${line}`;
    })
    .filter(Boolean) // loại bỏ string rỗng
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
