import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../services/productService";

const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getAllProducts(params),
  });
};

export default useProducts;
