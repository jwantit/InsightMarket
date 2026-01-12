// src/components/member/BrandRegistrationModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import BrandFormComponent from "../brand/BrandFormComponent";
import { showAlert } from "../../hooks/common/useAlert";

const trim = (v) => (v ?? "").trim();

const initForm = {
  name: "",
  description: "",
  competitors: [],
};

const BrandRegistrationModal = ({ show, onClose, onSave, brands = [] }) => {
  const [form, setForm] = useState(initForm);
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  // brands 데이터를 form 형식으로 변환
  useEffect(() => {
    if (show && brands[0]) {
      const brand = brands[0];
      setForm({
        name: brand.brandName || "",
        description: brand.brandDescription || "",
        competitors: brand.competitorName
          ? [{ competitorId: null, name: brand.competitorName, enabled: true }]
          : [],
      });
      setImageFile(null);
      setRemoveImage(false);
    } else if (show) {
      // 모달이 열릴 때 빈 폼으로 초기화
      setForm(initForm);
      setImageFile(null);
      setRemoveImage(false);
    }
  }, [show, brands]);

  // 유효성 검사: 브랜드명이 필수
  const canSubmit = useMemo(() => trim(form.name).length > 0, [form.name]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      await showAlert("브랜드명을 입력해주세요.", "warning");
      return;
    }

    // form 데이터를 기존 brands 형식으로 변환하여 부모에게 전달
    const convertedBrands = [
      {
        brandName: form.name,
        brandDescription: form.description || "",
        competitorName: form.competitors[0]?.name || "",
        brandImageFile: imageFile, // 이미지 파일 추가 (brandImageFile로 명명)
      },
    ];

    onSave(convertedBrands);
  };

  const handleCancel = () => {
    setForm(initForm);
    setImageFile(null);
    setRemoveImage(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 relative">
        {/* 모달 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">브랜드 등록</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="닫기"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* BrandFormComponent를 모달 내부에 렌더링 */}
        <div className="px-8 pb-0 max-h-[calc(100vh-200px)] overflow-y-auto">
          <BrandFormComponent
            mode="CREATE"
            loading={false}
            saving={false}
            canSubmit={canSubmit}
            form={form}
            setForm={setForm}
            imageFile={imageFile}
            setImageFile={setImageFile}
            removeImage={removeImage}
            setRemoveImage={setRemoveImage}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandRegistrationModal;

