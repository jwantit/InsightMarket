import { useCallback, useEffect, useMemo, useState } from "react";
import {
    createBrand,
    deleteBrand,
    getBrandDetail,
    getBrandList,
    updateBrand,
} from "../../api/brandApi";
import BrandListComponent from "./BrandListComponent";
import BrandDetailComponent from "./BrandDetailComponent";
import BrandFormComponent from "./BrandFormComponent";

const initBrandForm = { name: "", description: "", keywords: [], competitors: [] };
const trim = (v) => (v ?? "").trim();
const uniq = (arr) => Array.from(new Set(arr));

export default function BrandComponent() {
    const [screen, setScreen] = useState("LIST");
    const [brands, setBrands] = useState([]);

    const [selectedId, setSelectedId] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);

    const [formMode, setFormMode] = useState("CREATE");
    const [form, setForm] = useState(initBrandForm);

    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [query, setQuery] = useState("");
    const [onlyAdmin, setOnlyAdmin] = useState(false);

    const canSubmit = useMemo(() => trim(form.name).length > 0, [form.name]);

    const fetchList = useCallback(async () => {
        setLoadingList(true);
        setErrorMsg(null);
        try {
            const data = await getBrandList();
            setBrands(data || []);
        } catch (e) {
            setErrorMsg(e?.message || "브랜드 목록을 불러오지 못했어요.");
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => { fetchList(); }, [fetchList]);

    const filteredBrands = useMemo(() => {
        const q = trim(query).toLowerCase();
        return (brands || [])
            .filter((b) => (onlyAdmin ? b.role === "BRAND_ADMIN" : true))
            .filter((b) => {
                if (!q) return true;
                const hay = [
                    b?.name,
                    b?.description,
                    ...(b?.keywords || []),
                    b?.role,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q);
            });
    }, [brands, onlyAdmin, query]);

    const goList = useCallback(() => {
        setScreen("LIST");
        setSelectedId(null);
        setSelectedBrand(null);
        setErrorMsg(null);
    }, []);

    const openCreate = useCallback(() => {
        setFormMode("CREATE");
        setForm(initBrandForm);
        setErrorMsg(null);
        setScreen("FORM");
    }, []);

    const openDetail = useCallback(async (brandId) => {
        setSelectedId(brandId);
        setLoadingDetail(true);
        setErrorMsg(null);
        try {
            const detail = await getBrandDetail(brandId);
            console.log("상세 페이지 로드된 데이터:", detail);
            console.log("경쟁사 데이터:", detail?.competitors);
            setSelectedBrand(detail);
            setScreen("DETAIL");
        } catch (e) {
            console.error("상세 정보 로드 오류:", e);
            setErrorMsg(e?.message || "상세 정보를 불러오지 못했어요.");
            setScreen("LIST");
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    const openEdit = useCallback(async (brandId) => {
        setFormMode("EDIT");
        setSaving(false);
        setErrorMsg(null);
        setLoadingDetail(true);

        try {
            const detail = await getBrandDetail(brandId);
            console.log("수정 화면 로드 - 전체 데이터:", detail);
            console.log("수정 화면 로드 - 경쟁사 데이터:", detail?.competitors);
            
            // 경쟁사 데이터 구조 확인 및 정규화
            const normalizedCompetitors = (detail?.competitors || []).map((c) => {
                console.log("경쟁사 원본 데이터:", c);
                console.log("경쟁사 competitorId 값:", c?.competitorId, "타입:", typeof c?.competitorId);
                return {
                    competitorId: c?.competitorId ?? null, // 필드명이 competitorId로 확인됨
                    name: c?.name ?? "",
                    enabled: c?.enabled ?? true,
                    keywords: c?.keywords ?? [],
                };
            });
            console.log("정규화된 경쟁사 데이터:", normalizedCompetitors);
            
            setSelectedId(brandId);
            setSelectedBrand(detail);
            setForm({
                name: detail?.name ?? "",
                description: detail?.description ?? "",
                keywords: detail?.keywords ?? [],
                competitors: normalizedCompetitors,
            });
            setScreen("FORM");
        } catch (e) {
            setErrorMsg(e?.message || "수정 화면을 열지 못했어요.");
            setScreen("LIST");
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) {
            setErrorMsg("브랜드명을 입력하세요.");
            return;
        }

        const competitorsData = (form.competitors || [])
            .map((c) => ({
                competitorId: c?.competitorId ?? null, // null이면 신규 생성, 값이 있으면 수정
                name: trim(c?.name),
                enabled: !!c?.enabled,
                keywords: uniq((c?.keywords || []).map(trim).filter(Boolean)),
            }))
            .filter((c) => c.name.length > 0); // 빈 이름의 경쟁사는 제외

            const payload = {
                name: trim(form.name),
                description: trim(form.description),
                keywords: uniq((form.keywords || []).map(trim).filter(Boolean)),
                competitors: competitorsData, 
              };
              

        // 디버깅: 전송되는 payload 확인
        console.log("저장할 브랜드 데이터:", payload);
        console.log("저장할 경쟁사 데이터 상세:", competitorsData);
        console.log("경쟁사 개수:", competitorsData.length);
        competitorsData.forEach((c, idx) => {
            console.log(`경쟁사 ${idx + 1}:`, c, `competitorId 포함 여부: ${c.hasOwnProperty('competitorId')}`);
        });

        setSaving(true);
        setErrorMsg(null);
        try {
            if (formMode === "EDIT" && selectedId != null) {
                await updateBrand(selectedId, payload);
                // 저장 후 최신 데이터 다시 로드
                const detail = await getBrandDetail(selectedId);
                console.log("수정 후 상세 데이터:", detail);
                setSelectedBrand(detail);
                setScreen("DETAIL");
                await fetchList();
            } else {
                const result = await createBrand(payload);
                console.log("생성 API 응답:", result);
                // API 응답이 ID만 반환하는지, 전체 객체를 반환하는지 확인
                const newId = result?.brandId ?? result?.id ?? result;
                await fetchList();
                if (newId) {
                    const detail = await getBrandDetail(newId);
                    console.log("생성 후 상세 데이터:", detail);
                    setSelectedBrand(detail);
                    setScreen("DETAIL");
                } else {
                    setScreen("LIST");
                }
            }
        } catch (e) {
            console.error("저장 오류:", e);
            const errorMessage = e?.response?.data?.message || e?.message || "저장에 실패했어요.";
            setErrorMsg(errorMessage);
        } finally {
            setSaving(false);
        }
    }, [canSubmit, fetchList, form, formMode, openDetail, selectedId]);

    const handleDelete = useCallback(
        async (brandId) => {
            if (!confirm("정말 삭제하시겠습니까?")) return;
            setSaving(true);
            setErrorMsg(null);
            try {
                await deleteBrand(brandId);
                await fetchList();
                goList();
            } catch (e) {
                setErrorMsg(e?.message || "삭제에 실패했어요.");
            } finally {
                setSaving(false);
            }
        },
        [fetchList, goList]
    );

    return (
        <div className="space-y-4">
            {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                </div>
            )}

            {screen === "LIST" && (
                <BrandListComponent
                    brands={filteredBrands}
                    total={brands.length}
                    loading={loadingList}
                    query={query}
                    setQuery={setQuery}
                    onlyAdmin={onlyAdmin}
                    setOnlyAdmin={setOnlyAdmin}
                    onRefresh={fetchList}
                    onCreate={openCreate}
                    onSelect={(id) => openDetail(id)}
                />
            )}

            {screen === "DETAIL" && (
                <BrandDetailComponent
                    loading={loadingDetail}
                    brand={selectedBrand}
                    onBack={goList}
                    onEdit={() => openEdit(selectedId)}
                    onDelete={() => handleDelete(selectedId)}
                />
            )}

            {screen === "FORM" && (
                <BrandFormComponent
                    mode={formMode}
                    loading={loadingDetail}
                    saving={saving}
                    canSubmit={canSubmit}
                    form={form}
                    setForm={setForm}
                    onCancel={() => (formMode === "EDIT" ? setScreen("DETAIL") : goList())}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
