function RolePill({ role }) {
  const isAdmin = role === "BRAND_ADMIN";
  return (
    <span
      className={[
        "text-xs px-2 py-1 rounded-full border shrink-0",
        isAdmin
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-gray-50 border-gray-200 text-gray-700",
      ].join(" ")}
    >
      {isAdmin ? "ADMIN" : "MARKETER"}
    </span>
  );
}

function Chip({ children }) {
  return (
    <span className="text-xs bg-gray-100 border rounded-full px-2.5 py-1 text-gray-700">
      {children}
    </span>
  );
}

function KeywordPreview({ keywords = [] }) {
  const shown = keywords.slice(0, 6);
  const rest = keywords.length - shown.length;
  return (
    <div className="flex flex-wrap gap-2">
      {shown.map((k) => (
        <Chip key={k}>#{k}</Chip>
      ))}
      {rest > 0 && <span className="text-xs text-gray-500">+{rest}</span>}
    </div>
  );
}

export default function BrandListComponent({
  brands,
  total,
  loading,
  query,
  setQuery,
  onCreate,
  onSelect,
}) {
  return (
    <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">브랜드</h2>
            <p className="text-sm text-gray-600 mt-1">
              전체 <b>{total}</b>개 / 현재 <b>{brands.length}</b>개 표시
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCreate}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              + 브랜드 추가
            </button>
          </div>
        </div>

        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색: 브랜드명/설명/키워드/역할"
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="p-2">
        <div className="hidden md:grid grid-cols-[220px_1fr_260px_90px] gap-3 px-4 py-3 text-xs font-semibold text-gray-500">
          <div>브랜드</div>
          <div>설명</div>
          <div>키워드</div>
          <div className="text-right">권한</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-600">목록 불러오는 중…</div>
        ) : brands.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl border bg-gray-50 px-4 py-6 text-sm text-gray-700">
              검색 결과가 없어요. 조건을 줄이거나 새 브랜드를 추가해보세요.
            </div>
          </div>
        ) : (
          <ul className="divide-y">
            {brands.map((b) => (
              <li
                key={b.brandId}
                onClick={() => onSelect(b.brandId)}
                className="cursor-pointer hover:bg-gray-50 rounded-xl mx-2 my-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_260px_90px] gap-3 px-4 py-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {b.name}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    {b.description ? (
                      <p className="line-clamp-2">{b.description}</p>
                    ) : (
                      <p className="text-gray-400">설명 없음</p>
                    )}
                  </div>

                  <div>
                    {(b.keywords || []).length ? (
                      <KeywordPreview keywords={b.keywords} />
                    ) : (
                      <p className="text-sm text-gray-400">키워드 없음</p>
                    )}
                  </div>
                  <div className="flex md:justify-end">
                    <RolePill role={b.role} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
