import { useCallback, useMemo, useState } from "react";

const trim = (v) => (v ?? "").trim();
const uniq = (arr) => Array.from(new Set(arr));

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
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

export default function CompetitorCard({ competitor, index, onChange, onRemove }) {
  const [open, setOpen] = useState(true);

  const enabled = !!competitor?.enabled;
  const name = competitor?.name ?? "";
  const keywords = competitor?.keywords ?? [];
  const keywordCount = keywords.length;

  const label = useMemo(() => {
    const title = name ? name : `경쟁사 #${index + 1}`;
    return `${title} · 키워드 ${keywordCount}개`;
  }, [index, keywordCount, name]);

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-left flex-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{label}</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border",
                enabled
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              )}
            >
              {enabled ? "활성" : "비활성"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            클릭해서 {open ? "접기" : "펼치기"}
          </p>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove()}
            className="text-sm px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
          >
            제거
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              경쟁사 이름
            </label>
            <input
              value={name}
              onChange={(e) => onChange({ ...competitor, name: e.target.value })}
              placeholder="경쟁사 이름을 입력하세요"
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onChange({ ...competitor, enabled: e.target.checked })}
            />
            비교 페이지에서 포함(활성)
          </label>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              경쟁사 키워드
            </label>
            <ChipInput
              placeholder="키워드 입력 후 Enter"
              value={keywords}
              onChange={(nextKeywords) =>
                onChange({ ...competitor, keywords: nextKeywords })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
