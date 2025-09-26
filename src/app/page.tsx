"use client";
import { useState } from "react";

type ReviewResponse = {
  ok: boolean;
  error?: string;
  section1?: string;
  section2?: string;
};

const strengths = [
  "Em luôn tích cực phát biểu trong giờ học.",
  "Em hoàn thành bài tập đúng hạn và đảm bảo chất lượng.",
  "Em hợp tác tốt với các bạn trong các hoạt động nhóm.",
  "Em thường đưa ra những ý tưởng sáng tạo và mới mẻ.",
  "Em có tinh thần tự giác trong học tập.",
  "Em giữ thái độ học tập nghiêm túc và tôn trọng thầy cô.",
  "Em thể hiện sự kiên nhẫn khi giải quyết vấn đề khó.",
  "Em có khả năng tiếp thu kiến thức nhanh.",
  "Em biết lắng nghe góp ý và điều chỉnh kịp thời.",
  "Em thể hiện sự chủ động trong việc tìm kiếm và mở rộng kiến thức."
];

const weaknesses = [
  "Em đôi khi chưa tập trung trong giờ học.",
  "Em vẫn có tình trạng nộp bài muộn ở một số môn.",
  "Em cần cải thiện thêm kỹ năng trình bày ý tưởng.",
  "Em còn thiếu sự tự tin khi phát biểu trước lớp.",
  "Em chưa quản lý thời gian học tập thật hiệu quả.",
  "Em dễ bị phân tâm bởi môi trường xung quanh.",
  "Em chưa thường xuyên đặt câu hỏi khi chưa hiểu bài.",
  "Em còn ngại tham gia thảo luận nhóm.",
  "Em cần rèn luyện thêm khả năng viết báo cáo mạch lạc.",
  "Em chưa duy trì được thói quen ôn tập đều đặn."
];


export default function Home() {
  const [url, setUrl] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [s1, setS1] = useState<string>("");
  const [s2, setS2] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);

  const toggleStrength = (s: string) => {
    setSelectedStrengths((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleWeakness = (w: string) => {
    setSelectedWeaknesses((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
    );
  };

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");
  setS1("");
  setS2("");
  setLoading(true);

  try {
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        studentName,
        language: "vi",
        strengths: selectedStrengths,
        weaknesses: selectedWeaknesses,
      }),
    });

    const data: ReviewResponse = await res.json();
    if (!data.ok) throw new Error(data.error || "Request failed");

    // ===== CHUẨN BỊ PHẦN GIÁO VIÊN =====
    const strengthsList = selectedStrengths.length
      ? selectedStrengths.map((s) => `- ${s}`).join("\n")
      : "- Không có";
    const weaknessesList = selectedWeaknesses.length
      ? selectedWeaknesses.map((w) => `- ${w}`).join("\n")
      : "- Không có";

    // Tạo block ưu nhược điểm của giáo viên
    const teacherReview = ` Ưu điểm:\n${strengthsList}\n\n Nhược điểm:\n${weaknessesList}\n`;

    // Ghép: tick giáo viên trước, AI sau
    const reviewText = `\n\n${teacherReview}\n${data.section2 ?? ""}`;

    setS1(data.section1 ?? "");
    setS2(reviewText.trim());
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Lỗi không xác định";
    setError(msg);
  } finally {
    setLoading(false);
  }
}


  const copyText = (t: string) => {
    void navigator.clipboard.writeText(t);
  };
  const hasResults = Boolean(s1 || s2);

  return (
    <main>
      {/* ===== HERO ===== */}
      <div className="hero">
        <div className="wrapper">
          {/* NAV */}
          <nav className="nav">
            <div className="brand">
              <div className="brand-badge" />
              <div className="brand-text">
                <div className="brand-name">dctrng</div>
                <div className="brand-role">qack qack</div>
              </div>
            </div>

            <a
              href="https://www.linkedin.com"
              target="_blank"
              className="nav-right"
              rel="noreferrer"
            >
              
            </a>
          </nav>

          {/* HEADING */}
          <div className="hero-inner">
            <h1 className="hero-headline">Teky Portfolio</h1>
            <p className="hero-sub">
              một công cụ trợ giúp giáo viên tạo nhận xét portfolio học sinh nhanh hơn.
            </p>
          </div>
        </div>
      </div>

      {/* ===== FORM + KẾT QUẢ ===== */}
      <div className="section">
        <div className="wrapper">
          <section className="grid">
            {/* FORM */}
            <div className="card span-form">
              <h2>Tạo nhận xét</h2>
              <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 16 }}>
                <div>
                  <label htmlFor="url" className="label">
                    Đường link portfolio
                  </label>
                  <input
                    id="url"
                    type="url"
                    required
                    placeholder="https://..."
                    className="input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                    Ví dụ: https://tensite.vercel.app, Google Sites, Notion…
                  </div>
                </div>

                <div>
                  <label htmlFor="studentName" className="label">
                    Tên học sinh (tuỳ chọn)
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="input"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>

                <div className="row">
                  <button className="btn btn-primary" disabled={loading} type="submit">
                    {loading ? "Đang tạo…" : "Tạo nhận xét"}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setUrl("");
                      setStudentName("");
                      setS1("");
                      setS2("");
                      setError("");
                      setSelectedStrengths([]);
                      setSelectedWeaknesses([]);
                    }}
                  >
                    Xoá nội dung
                  </button>
                </div>

                {error && <div className="alert-error">{error}</div>}
              </form>
            </div>
              {/* TIPS */}
            <div className="card span-tips">
              <h2>Mẹo tối ưu đầu vào</h2>
              <div style={{ marginTop: 12, color: "#334155", fontSize: 14, lineHeight: 1.6 }}>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  <li>Dùng URL public, nội dung có tiêu đề/heading rõ.</li>
                  <li>Có phần kỹ năng/công nghệ và ví dụ dự án.</li>
                  <li>Nếu site dài, để mục lục giúp trích xuất chuẩn hơn.</li>
                </ul>
                <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                  Lưu ý: API đã loại bỏ dấu <code>*</code> trong kết quả để tránh markdown không mong muốn.
                </div>
              </div>
            </div>

            {/* ƯU ĐIỂM */}
<div className="card span-result">
  <h2>Ưu điểm</h2>
  <div style={{ marginTop: 12 }}>
    {strengths.map((s) => (
      <label key={s} style={{ display: "block", marginTop: 4 }}>
        <input
          type="checkbox"
          checked={selectedStrengths.includes(s)}
          onChange={() => toggleStrength(s)}
        />{" "}
        {s}
      </label>
    ))}
  </div>
</div>

{/* NHƯỢC ĐIỂM */}
<div className="card span-result">
  <h2>Nhược điểm</h2>
  <div style={{ marginTop: 12 }}>
    {weaknesses.map((w) => (
      <label key={w} style={{ display: "block", marginTop: 4 }}>
        <input
          type="checkbox"
          checked={selectedWeaknesses.includes(w)}
          onChange={() => toggleWeakness(w)}
        />{" "}
        {w}
      </label>
    ))}
  </div>
</div>


            {/* KẾT QUẢ 1 */}
            <div className="card span-result">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h2>Nội dung bài học</h2>
                <button className="btn" type="button" onClick={() => copyText(s1)} disabled={!s1}>
                  Copy
                </button>
              </div>
              <div className="pretty-text" style={{ marginTop: 12 }}>
                {s1 || (
                  <div>
                    <div className="skeleton-line w60" />
                    <div className="skeleton-line w80" style={{ marginTop: 10 }} />
                    <div className="skeleton-line w66" style={{ marginTop: 10 }} />
                  </div>
                )}
              </div>
            </div>

            {/* KẾT QUẢ 2 */}
            <div className="card span-result">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h2>Nhận xét học sinh</h2>
                <button className="btn" type="button" onClick={() => copyText(s2)} disabled={!s2}>
                  Copy
                </button>
              </div>
              <div className="pretty-text" style={{ marginTop: 12 }}>
                {s2 || (
                  <div>
                    <div className="skeleton-line w60" />
                    <div className="skeleton-line w80" style={{ marginTop: 10 }} />
                    <div className="skeleton-line w50" style={{ marginTop: 10 }} />
                  </div>
                )}
              </div>
            </div>

            {/* STATUS */}
            <div className="card span-wide">
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>Trạng thái</div>
                  <div style={{ marginTop: 6, color: "#475569", fontSize: 14 }}>
                    {loading
                      ? "Đang gọi API Gemini…"
                      : hasResults
                      ? "Hoàn tất. Bạn có thể copy từng phần."
                      : "Chưa có kết quả. Hãy nhập URL và bấm Tạo nhận xét."}
                  </div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>
                  © {new Date().getFullYear()} – Công cụ trợ giúp nhận xét portfolio
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
