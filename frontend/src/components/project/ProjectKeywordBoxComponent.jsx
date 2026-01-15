import { useState } from "react";
import { Plus, X, CheckCircle2, Circle } from "lucide-react";

const ProjectKeywordBoxComponent = ({ form, setForm }) => {
  const [input, setInput] = useState("");
  const keywords = form.keywords || [];

  // 신규 키워드 추가
  const addKeyword = () => {
    const text = input.trim();
    if (!text) return;

    // 중복 방지 (기존 + 신규)
    const exists = keywords.some(
      (k) => k.keyword && k.keyword.toLowerCase() === text.toLowerCase()
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
          projectKeywordId: null, // 신규 생성 트리거
          keyword: text, // UI 표시용 및 백엔드 전송용
          enabled: true,
        },
      ],
    }));

    setInput("");
  };

  // enabled 토글
  const toggle = (projectKeywordId, keyword) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k) =>
        (k.projectKeywordId === projectKeywordId && projectKeywordId != null) ||
        (k.projectKeywordId == null && k.keyword === keyword)
          ? { ...k, enabled: !k.enabled }
          : k
      ),
    }));
  };

  // 키워드 제거
  const remove = (projectKeywordId, keyword) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter(
        (k) =>
          !(
            (k.projectKeywordId === projectKeywordId && projectKeywordId != null) ||
            (k.projectKeywordId == null && k.keyword === keyword)
          )
      ),
    }));
  };

  return (
    <div className="space-y-4">
      {/* 신규 키워드 입력 */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          키워드 추가
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="예: 여름세일, 프로모션"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            <Plus size={16} />
            추가
          </button>
        </div>
      </div>

      {/* 키워드 리스트 */}
      {keywords.length ? (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <div
              key={k.projectKeywordId ?? `new-${k.keyword}`}
              className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-all ${
                k.enabled
                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(k.projectKeywordId, k.keyword)}
                className="flex items-center gap-2"
              >
                {k.enabled ? (
                  <CheckCircle2 size={14} className="text-blue-600" />
                ) : (
                  <Circle size={14} className="text-slate-400" />
                )}
                <span>#{k.keyword}</span>
              </button>

              <button
                type="button"
                onClick={() => remove(k.projectKeywordId, k.keyword)}
                className="text-slate-400 hover:text-red-500 transition-colors ml-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
          <p className="text-sm font-bold text-slate-400">
            등록된 키워드가 없습니다.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            상단의 입력란에 키워드를 추가하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectKeywordBoxComponent;
