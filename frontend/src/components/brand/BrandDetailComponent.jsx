function Chip({ children }) {
    return (
      <span className="text-xs bg-gray-100 border rounded-full px-2.5 py-1 text-gray-700">
        {children}
      </span>
    );
  }
  
  function Section({ title, children }) {
    return (
      <div className="rounded-xl border bg-white">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  }
  
  export default function BrandDetailComponent({
    loading,
    brand,
    onBack,
    onEdit,
    onDelete,
  }) {
    if (loading) {
      return (
        <section className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="text-sm text-gray-600">상세 불러오는 중…</div>
        </section>
      );
    }
  
    if (!brand) {
      return (
        <section className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="text-sm text-gray-600">표시할 브랜드가 없어요.</div>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            목록으로
          </button>
        </section>
      );
    }
  
    const isAdmin = brand.role === "BRAND_ADMIN";
    const competitors = brand.competitors || [];
  
    return (
      <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← 목록
            </button>
            <div className="mt-2 flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{brand.name}</h2>
              <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                {brand.role}
              </span>
            </div>
            {brand.description && (
              <p className="text-sm text-gray-700 mt-2">{brand.description}</p>
            )}
          </div>
  
          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onEdit}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
              >
                수정
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>
  
        {/* 본문: 카드 섹션 */}
        <div className="p-6 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500">브랜드 키워드</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {(brand.keywords || []).length}개
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500">경쟁사</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {competitors.length}개
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500">활성 경쟁사</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {competitors.filter((c) => c.enabled).length}개
              </p>
            </div>
          </div>
  
          <Section title="브랜드 키워드">
            {(brand.keywords || []).length === 0 ? (
              <p className="text-sm text-gray-500">키워드가 없어요.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {brand.keywords.map((k) => (
                  <Chip key={k}>#{k}</Chip>
                ))}
              </div>
            )}
          </Section>
  
          <Section title="경쟁사">
            {competitors.length === 0 ? (
              <p className="text-sm text-gray-500">경쟁사가 없어요.</p>
            ) : (
              <div className="space-y-3">
                {competitors.map((c) => (
                  <div key={c.competitorId} className="rounded-xl border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          키워드 {(c.keywords || []).length}개
                        </p>
                      </div>
                      <span
                        className={[
                          "text-xs px-2 py-1 rounded-full border",
                          c.enabled
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-gray-50 border-gray-200 text-gray-600",
                        ].join(" ")}
                      >
                        {c.enabled ? "활성" : "비활성"}
                      </span>
                    </div>
  
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(c.keywords || []).length === 0 ? (
                        <p className="text-sm text-gray-400">키워드 없음</p>
                      ) : (
                        c.keywords.slice(0, 10).map((k) => <Chip key={k}>#{k}</Chip>)
                      )}
                      {(c.keywords?.length || 0) > 10 && (
                        <span className="text-xs text-gray-500">
                          +{c.keywords.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </section>
    );
  }
  