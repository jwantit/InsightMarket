// src/components/brand/BrandComponent.jsx
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDispatch } from "react-redux";
import {
  createBrand,
  deleteBrand,
  getBrandDetail,
  getBrandList,
  updateBrand,
} from "../../api/brandApi";
import { setBrandList } from "../../store/slices/brandSlice";
import { getErrorMessage } from "../../util/errorUtil";
import { confirmAlert } from "../../hooks/common/useAlert";

// 하위 컴포넌트들
import BrandListComponent from "./BrandListComponent";
import BrandDetailComponent from "./BrandDetailComponent";
import BrandFormComponent from "./BrandFormComponent";

const initBrandForm = {
  name: "",
  description: "",
  competitors: [],
};

const trim = (v) => (v ?? "").trim();

const BrandComponent = forwardRef((props, ref) => {
  const dispatch = useDispatch();

  // --- 화면 및 데이터 상태 ---
  const [screen, setScreen] = useState("LIST"); // LIST, DETAIL, FORM
  const [brands, setBrands] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // --- 폼 상태 ---
  const [formMode, setFormMode] = useState("CREATE"); // CREATE, EDIT
  const [form, setForm] = useState(initBrandForm);
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false); // 이미지 삭제 플래그

  // --- 로딩 및 에러 상태 ---
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- 필터 상태 ---
  const [query, setQuery] = useState("");
  const [onlyAdmin, setOnlyAdmin] = useState(false);

  // --- 부모 컴포넌트(BrandPage)에 함수 노출 ---
  useImperativeHandle(ref, () => ({
    openCreate: () => {
      openCreate();
    },
    refreshList: () => {
      fetchList();
    },
  }));

  const canSubmit = useMemo(() => trim(form.name).length > 0, [form.name]);

  // --- 데이터 페칭 ---
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const data = await getBrandList();
      const list = data || [];
      setBrands(list);

      // 1. Topbar용 Redux 업데이트
      dispatch(
        setBrandList(
          list.map((b) => ({
            brandId: b.brandId,
            name: b.name,
            imageFileId: b.imageFileId || null,
          }))
        )
      );

      // 2. 부모(BrandPage)의 카운터 업데이트
      if (props.onCountChange) {
        props.onCountChange(list.length);
      }
    } catch (e) {
      setErrorMsg(getErrorMessage(e, "브랜드 목록을 불러오지 못했어요."));
    } finally {
      setLoadingList(false);
    }
  }, [dispatch, props]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // --- 필터링 로직 ---
  const filteredBrands = useMemo(() => {
    const q = trim(query).toLowerCase();
    return (brands || [])
      .filter((b) => (onlyAdmin ? b.role === "BRAND_ADMIN" : true))
      .filter((b) => {
        if (!q) return true;
        const hay = [b?.name, b?.description, b?.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [brands, onlyAdmin, query]);

  // --- 화면 전환 함수 ---
  const goList = useCallback(() => {
    setScreen("LIST");
    setSelectedId(null);
    setSelectedBrand(null);
    setErrorMsg(null);
  }, []);

  const openCreate = useCallback(() => {
    setFormMode("CREATE");
    setForm(initBrandForm);
    setImageFile(null);
    setRemoveImage(false);
    setErrorMsg(null);
    setScreen("FORM");
  }, []);

  const openDetail = useCallback(async (brandId) => {
    setSelectedId(brandId);
    setLoadingDetail(true);
    setErrorMsg(null);
    try {
      const detail = await getBrandDetail(brandId);
      setSelectedBrand(detail);
      setScreen("DETAIL");
    } catch (e) {
      setErrorMsg(getErrorMessage(e, "상세 정보를 불러오지 못했어요."));
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

      // 경쟁사 데이터 정규화
      const normalizedCompetitors = (detail?.competitors || []).map((c) => ({
        competitorId: c?.competitorId ?? null,
        name: c?.name ?? "",
        enabled: c?.enabled ?? true,
      }));

      setSelectedId(brandId);
      setSelectedBrand(detail);
      setForm({
        name: detail?.name ?? "",
        description: detail?.description ?? "",
        competitors: normalizedCompetitors,
        imageFileId: detail?.imageFileId ?? null,
      });
      setImageFile(null); // 수정 시에는 새 이미지 파일이 없으므로 null
      setRemoveImage(false); // 이미지 삭제 플래그 초기화
      setScreen("FORM");
    } catch (e) {
      setErrorMsg(getErrorMessage(e, "수정 화면을 열지 못했어요."));
      setScreen("LIST");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // --- 데이터 저장 및 삭제 ---
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      setErrorMsg("브랜드명을 입력하세요.");
      return;
    }

    const competitorsData = (form.competitors || [])
      .map((c) => ({
        competitorId: c?.competitorId ?? null,
        name: trim(c?.name),
        enabled: !!c?.enabled,
      }))
      .filter((c) => c.name.length > 0);

    const payload = {
      name: trim(form.name),
      description: trim(form.description),
      competitors: competitorsData,
    };
    
    // 수정 모드에서 이미지 삭제 플래그 추가
    if (formMode === "EDIT" && removeImage) {
      payload.removeImage = true;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      if (formMode === "EDIT" && selectedId != null) {
        // 수정 시: 이미지 파일이 있으면 전달, removeImage가 true이면 삭제, 둘 다 없으면 기존 이미지 유지
        await updateBrand(selectedId, payload, imageFile);
        const detail = await getBrandDetail(selectedId);
        setSelectedBrand(detail);
        setScreen("DETAIL");
        await fetchList();
      } else {
        // 생성 시: 이미지 파일이 있으면 전달
        const result = await createBrand(payload, imageFile);
        const newId = result?.brandId ?? result?.id ?? result;
        await fetchList();
        if (newId) {
          const detail = await getBrandDetail(newId);
          setSelectedBrand(detail);
          setScreen("DETAIL");
        } else {
          setScreen("LIST");
        }
      }
    } catch (e) {
      setErrorMsg(getErrorMessage(e, "저장에 실패했어요."));
    } finally {
      setSaving(false);
    }
  }, [canSubmit, fetchList, form, formMode, selectedId, imageFile, removeImage]);

  const handleDelete = useCallback(
    async (brandId) => {
      const confirmed = await confirmAlert("브랜드를 정말 삭제하시겠습니까?");
      if (!confirmed) return;
      setSaving(true);
      setErrorMsg(null);
      try {
        await deleteBrand(brandId);
        await fetchList();
        goList();
      } catch (e) {
        setErrorMsg(getErrorMessage(e, "삭제에 실패했어요."));
      } finally {
        setSaving(false);
      }
    },
    [fetchList, goList]
  );

  return (
    <div className="space-y-4">
      {/* 에러 메시지 상단 표시 */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">오류:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* 화면 전환 렌더링 */}
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
          imageFile={imageFile}
          setImageFile={setImageFile}
          removeImage={removeImage}
          setRemoveImage={setRemoveImage}
          onCancel={() =>
            formMode === "EDIT" ? setScreen("DETAIL") : goList()
          }
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
});

export default BrandComponent;
