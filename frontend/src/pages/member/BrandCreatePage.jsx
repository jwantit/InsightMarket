// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import BrandFormComponent from "../../components/brand/BrandFormComponent";
// import { createBrand } from "../../api/brandApi";

// const trim = (v) => (v ?? "").trim();

// const BrandCreatePage = () => {
//   const navigate = useNavigate();

//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     keywords: [],
//     competitors: [],
//   });

//   const canSubmit = useMemo(() => {
//     return !!trim(form.name);
//   }, [form.name]);

//   const onCancel = () => {
//     // 브랜드 0개일 때 들어온 페이지라면 "취소"는 보통 로그아웃 또는 안내로 처리하는 편이 자연스러움
//     navigate("/member/login", { replace: true });
//   };

//   const onSubmit = async () => {
//     if (!canSubmit || saving) return;

//     try {
//       setSaving(true);

//       const payload = {
//         name: trim(form.name),
//         description: trim(form.description),
//         keywords: form.keywords || [],
//         competitors: form.competitors || [],
//       };

//       const created = await createBrand(payload);
//       const nextBrandId = created?.brandId;

//       alert("브랜드가 생성되었습니다.");

//       if (nextBrandId) {
//         navigate(`/app/${nextBrandId}`, { replace: true });
//       } else {
//         navigate("/member/brand-select", { replace: true });
//       }
//     } catch (e) {
//       console.error(e);
//       alert("브랜드 생성에 실패했습니다.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6">
//       {/* 카드 컨테이너 */}
//       <div className="w-full max-w-3xl">
//         {/* 상단 타이틀 */}
//         <div className="mb-4 sm:mb-6">
//           <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
//             브랜드 생성
//           </h1>
//           <p className="mt-1 text-sm text-gray-500">
//             처음 사용할 브랜드 정보를 입력해주세요.
//           </p>
//         </div>

//         {/* 폼 영역 */}
//         <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
//           <BrandFormComponent
//             mode="CREATE"
//             loading={false}
//             saving={saving}
//             canSubmit={canSubmit}
//             form={form}
//             setForm={setForm}
//             onCancel={onCancel}
//             onSubmit={onSubmit}
//           />
//         </div>

//         {/* 하단 힌트(선택) */}
//         <p className="mt-3 text-xs text-gray-400">
//           생성 후 바로 해당 브랜드로 이동합니다.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default BrandCreatePage;
