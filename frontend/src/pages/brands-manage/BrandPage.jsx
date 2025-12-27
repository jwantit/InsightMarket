import BrandComponent from "../../components/brand/BrandComponent";

const BrandPage = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">브랜드 관리</h1>
      <BrandComponent />
    </div>
  );
};

export default BrandPage;
