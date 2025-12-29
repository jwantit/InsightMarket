import useMyBrands from "../../hooks/useMyBrands";
import { useBrand } from "../../hooks/useBrand";
import { useBrandNavigate } from "../../hooks/useBrandNavigate";

const TopBarBrandSelectComponent = () => {
  const { brands, loading } = useMyBrands();
  const { brandId } = useBrand();
  const { changeBrandKeepPath } = useBrandNavigate();

  if (loading) return null;

  const handleChange = (e) => {
    const nextBrandId = Number(e.target.value);
    if (nextBrandId === brandId) return;
    changeBrandKeepPath(nextBrandId);
  };

  return (
    <div className="relative">
      <select
        value={brandId ?? ""}
        onChange={handleChange}
        className="
          h-9 max-w-[200px]
          appearance-none rounded-lg border bg-white
          pl-3.5 pr-10
          text-sm font-medium text-gray-800 shadow-sm
          hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer
        "
      >
        {brands.map((b) => (
          <option key={b.brandId} value={b.brandId}>
            {b.name}
          </option>
        ))}
      </select>

      {/* Chevron Icon */}
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default TopBarBrandSelectComponent;
