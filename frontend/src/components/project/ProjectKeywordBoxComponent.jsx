import { useState } from "react";

const ProjectKeywordBoxComponent = ({ form, setForm }) => {
  const [input, setInput] = useState("");
  const keywords = form.keywords || [];

  // 신규 키워드 추가
  const addKeyword = () => {
    const text = input.trim();
    if (!text) return;

    // 중복 방지 (기존 + 신규)
    const exists = keywords.some(
      (k) =>
        (k.keyword && k.keyword.toLowerCase() === text.toLowerCase()) ||
        (k.text && k.text.toLowerCase() === text.toLowerCase())
    );
    if (exists) {
      setInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      keywords: [
        ...(prev.keywords || []),
        {
          keywordId: null,  // 신규 생성 트리거
          text,             // 백엔드 생성용
          keyword: text,    // UI 표시용
          enabled: true,
        },
      ],
    }));

    setInput("");
  };

  // enabled 토글
  const toggle = (keywordId, text) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k) =>
        (k.keywordId === keywordId && keywordId != null) ||
        (k.keywordId == null && k.text === text)
          ? { ...k, enabled: !k.enabled }
          : k
      ),
    }));
  };

  // 키워드 제거
  const remove = (keywordId, text) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter(
        (k) =>
          !(
            (k.keywordId === keywordId && keywordId != null) ||
            (k.keywordId == null && k.text === text)
          )
      ),
    }));
  };

  return (
    <div className="space-y-3">
      {/* 신규 키워드 입력 */}
      <div className="rounded-lg border bg-gray-50 p-3">
        <div className="text-xs font-bold text-gray-600 mb-2">키워드 생성</div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="예) 여름세일"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            추가
          </button>
        </div>
      </div>

      {/* 키워드 리스트 */}
      {keywords.length ? (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <div
              key={k.keywordId ?? `new-${k.text}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold
                ${
                  k.enabled
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
            >
              <button
                type="button"
                onClick={() => toggle(k.keywordId, k.text)}
                className="flex items-center gap-2"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    k.enabled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
                {k.keyword}
              </button>

              <button
                type="button"
                onClick={() => remove(k.keywordId, k.text)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">연결된 키워드가 없습니다.</div>
      )}
    </div>
  );
};

export default ProjectKeywordBoxComponent;
