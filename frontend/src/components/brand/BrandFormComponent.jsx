import { useCallback, useMemo, useState } from "react";
import CompetitorCard from "./CompetitorCard";

const trim = (v) => (v ?? "").trim();
const uniq = (arr) => Array.from(new Set(arr));

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function Section({ title, desc, right, children }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {desc && <p className="text-sm text-gray-600 mt-1">{desc}</p>}
        </div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ChipInput({ placeholder, value, onChange }) {
  const [draft, setDraft] = useState("");

  const add = useCallback(() => {
    const v = trim(draft);
    if (!v) return;
    onChange(uniq([...(value || []), v]));
    setDraft("");
  }, [draft, onChange, value]);

  const remove = useCallback(
    (target) => {
      onChange((value || []).filter((x) => x !== target));
    },
    [onChange, value]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
        >
          추가
        </button>
      </div>

      {(value || []).length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-sm text-gray-800 border"
              title={k}
            >
              <span className="truncate max-w-[240px]">#{k}</span>
              <button
                type="button"
                onClick={() => remove(k)}
                className="text-gray-500 hover:text-gray-800"
                aria-label="remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">아직 키워드가 없어요.</p>
      )}
    </div>
  );
}

export default function BrandFormComponent({
  mode, // CREATE | EDIT
  loading,
  saving,
  canSubmit,
  form,
  setForm,
  onCancel,
  onSubmit,
}) {
  const keywordCount = (form.keywords || []).length;
  const competitorCount = (form.competitors || []).length;

  const enabledCompetitorCount = useMemo(
    () => (form.competitors || []).filter((c) => c.enabled).length,
    [form.competitors]
  );

  // ✅ 토글 버튼 문구 판단: 모두 활성 상태면 "전체 비활성", 아니면 "전체 활성"
  const allEnabled = useMemo(() => {
    const list = form.competitors || [];
    if (list.length === 0) return false;
    return list.every((c) => !!c.enabled);
  }, [form.competitors]);

  const toggleAllEnabled = useCallback(() => {
    const nextEnabled = !allEnabled;

    setForm((prev) => ({
      ...prev,
      competitors: (prev.competitors || []).map((c) => ({
        ...c,
        enabled: nextEnabled,
      })),
    }));
  }, [allEnabled, setForm]);

  const addCompetitor = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      competitors: [
        ...(prev.competitors || []),
        { competitorId: null, name: "", enabled: true, keywords: [] },
      ],
    }));
  }, [setForm]);

  // 검색/필터 제거 → index 그대로 원본에 대응
  const updateCompetitor = useCallback(
    (index, updated) => {
      setForm((prev) => {
        const all = [...(prev.competitors || [])];
        if (!all[index]) return prev;
        all[index] = updated;
        return { ...prev, competitors: all };
      });
    },
    [setForm]
  );

  const removeCompetitor = useCallback(
    (index) => {
      setForm((prev) => ({
        ...prev,
        competitors: (prev.competitors || []).filter((_, i) => i !== index),
      }));
    },
    [setForm]
  );

  const updateBasic = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      {/* 상단 고정 느낌의 헤더 */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="p-6 border-b flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === "EDIT" ? "브랜드 수정" : "브랜드 추가"}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || saving}
              className={cn(
                "px-5 py-2.5 rounded-lg text-white",
                !canSubmit || saving
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {saving ? "저장 중..." : mode === "EDIT" ? "수정 저장" : "추가 저장"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatPill label="브랜드 키워드" value={`${keywordCount}개`} />
            <StatPill label="경쟁사" value={`${competitorCount}개`} />
            <StatPill label="활성 경쟁사" value={`${enabledCompetitorCount}개`} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="text-sm text-gray-600">불러오는 중…</div>
        </div>
      )}

      {/* 기본 정보 */}
      <Section title="기본 정보" desc="브랜드명은 필수, 설명은 선택입니다.">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              브랜드명 <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => updateBasic("name", e.target.value)}
              placeholder="예: ACME"
              className={cn(
                "w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2",
                trim(form.name)
                  ? "focus:ring-blue-200"
                  : "border-red-200 focus:ring-red-100"
              )}
            />
            {!trim(form.name) && (
              <p className="text-xs text-red-600">브랜드명은 필수입니다.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => updateBasic("description", e.target.value)}
              placeholder="브랜드 설명을 입력하세요"
              rows={4}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
            />
          </div>
        </div>
      </Section>

      {/* 브랜드 키워드 */}
      <Section title="브랜드 키워드" desc="브랜드의 주요 키워드를 입력하세요.">
        <ChipInput
          placeholder="키워드 입력 후 Enter"
          value={form.keywords}
          onChange={(nextKeywords) =>
            setForm((prev) => ({ ...prev, keywords: nextKeywords }))
          }
        />
      </Section>

      {/* 경쟁사 */}
      <Section
        title="경쟁사"
        desc="비교할 경쟁사와 키워드를 입력하세요."
        right={
          <div className="flex items-center gap-2">
            {/* 전체 활성/비활성: 버튼 */}
            <button
              type="button"
              onClick={toggleAllEnabled}
              className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
              disabled={(form.competitors || []).length === 0}
              title={
                (form.competitors || []).length === 0
                  ? "경쟁사가 없어요"
                  : undefined
              }
            >
              {allEnabled ? "전체 비활성" : "전체 활성"}
            </button>

            <button
              type="button"
              onClick={addCompetitor}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              + 경쟁사 추가
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {(form.competitors || []).length === 0 ? (
            <div className="rounded-xl border bg-gray-50 px-4 py-6 text-sm text-gray-700">
              아직 경쟁사가 없어요. “+ 경쟁사 추가”로 등록해보세요.
            </div>
          ) : (
            <div className="space-y-3">
              {(form.competitors || []).map((c, i) => (
                <CompetitorCard
                  key={`${c?.competitorId ?? "new"}-${i}`}
                  competitor={c}
                  index={i}
                  onChange={(updated) => updateCompetitor(i, updated)}
                  onRemove={() => removeCompetitor(i)}
                />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
