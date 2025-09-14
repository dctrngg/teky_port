"use client";
import { useState } from "react";

type ReviewResponse = {
  ok: boolean;
  error?: string;
  section1?: string;
  section2?: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [s1, setS1] = useState<string>("");
  const [s2, setS2] = useState<string>("");
  const [error, setError] = useState<string>("");

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
        body: JSON.stringify({ url, studentName, language: "vi" }),
      });

      const data: ReviewResponse = await res.json();
      if (!data.ok) throw new Error(data.error || "Request failed");

      setS1(data.section1 ?? "");
      setS2(data.section2 ?? "");
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
                <div className="brand-role">UX/UI DESIGNER</div>
              </div>
            </div>

            <a
              href="https://www.linkedin.com"
              target="_blank"
              className="nav-right"
              rel="noreferrer"
            >
              in
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
