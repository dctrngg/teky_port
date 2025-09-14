import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { fetchPageText } from "../../../lib/fetchPageText";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const BodySchema = z.object({
  url: z.string().url(),
  studentName: z.string().min(1).max(100).optional(),
  language: z.enum(["vi", "en"]).default("vi"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, studentName, language } = BodySchema.parse(body);

    const pageText = await fetchPageText(url);

    const prompt = buildPrompt({ url, pageText, studentName, language });

    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Văn bản thô trả về từ model
    const rawText = result.response.text();

    // =================== NEW: loại bỏ toàn bộ dấu * ===================
    // Nếu muốn chỉ xóa * đơn, giữ lại ** bôi đậm, đổi regex thành /(?<!\*)\*(?!\*)/g
    const cleanedText = rawText.replace(/\*/g, "");
    // ==================================================================

    // Tách 2 phần theo tiêu đề yêu cầu
    const parsed = parseTwoSections(cleanedText);

    return NextResponse.json({ ok: true, ...parsed });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 400 }
    );
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
}) {
  const name = studentName ? `Tên học sinh: ${studentName}` : "";
  const langIntro =
    language === "vi" ? "Hãy trả lời bằng tiếng Việt." : "Reply in English.";

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
- Đánh giá điểm mạnh: kỹ thuật, thẩm mỹ, cách trình bày, mức độ hoàn thiện, tính sáng tạo.
- Góp ý cải thiện: rõ ràng, khả năng mở rộng, tổ chức code/nội dung, kiểm thử, hiệu năng, bảo mật, khả năng trình bày.
- Đưa ra 3-5 việc làm cụ thể để nâng cấp porfolio trong 1-2 tuần tới.

Yêu cầu trình bày:
- Viết bằng tiếng Việt phổ thông, lịch sự, khách quan.
- Dùng gạch đầu dòng, tiêu đề rõ ràng.
- Gọi học sinh bằng "em".
- Nếu dữ liệu trang thiếu, hãy nêu giả định hợp lý và ghi chú "(giả định)".
- Kết quả **phải** chứa đúng hai phần, đánh dấu rõ bằng tiêu đề: "Noi dung bai hoc" và "Nhan xet hoc sinh".

${name}`;
}

function parseTwoSections(raw: string) {
  const s1 =
    /Noi dung bai hoc[\s\S]*?(?=\n\s*2\)|\n\s*Nhan xet hoc sinh|$)/i.exec(
      raw
    )?.[0]?.trim();
  const s2 = /Nhan xet hoc sinh[\s\S]*/i.exec(raw)?.[0]?.trim();
  return { section1: s1 || "", section2: s2 || "" };
}
