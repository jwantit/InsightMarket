import { useEffect, useState } from "react";
import { getBrandList } from "../api/brandApi";

const useMyBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBrandList()
      .then((data) => {
        setBrands(
          data.map((b) => ({
            brandId: b.brandId,
            name: b.name,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return { brands, loading };
};

export default useMyBrands;
