import { useQuery } from "@tanstack/react-query";
import { fetchApiJson } from "./auth-client";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  kkal: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  price: number;
  is_vegetarian: boolean;
  product_category_id: string;
  is_common: boolean;
  user_id: string;
  category: ProductCategory;
}

export interface ProductsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  data: Product[];
  meta: ProductsMeta;
}

function normalizeProductsResponse(
  raw: unknown,
  page: number,
  limit: number,
): ProductsResponse {
  const rows: Product[] = Array.isArray(raw)
    ? (raw as Product[])
    : Array.isArray((raw as ProductsResponse | null)?.data)
      ? (raw as ProductsResponse).data
      : [];

  const m = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as { meta?: Partial<ProductsMeta> }).meta
    : undefined;

  if (m && typeof m.total === "number") {
    return {
      data: rows,
      meta: {
        total: m.total,
        page: typeof m.page === "number" ? m.page : page,
        limit: typeof m.limit === "number" ? m.limit : limit,
        totalPages:
          typeof m.totalPages === "number"
            ? m.totalPages
            : Math.max(1, Math.ceil(m.total / (typeof m.limit === "number" ? m.limit : limit))),
      },
    };
  }

  return {
    data: rows,
    meta: {
      total: rows.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(rows.length / limit) || 1),
    },
  };
}

export interface UseProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export function useProducts(params: UseProductsParams = {}) {
  const { page = 1, limit = 20, search, categoryId } = params;

  return useQuery<ProductsResponse>({
    queryKey: ["products", page, limit, search, categoryId],
    queryFn: async () => {
      const urlParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search) urlParams.set("search", search);
      if (categoryId) urlParams.set("categoryId", categoryId);

      const raw = await fetchApiJson<unknown>(
        `/products?${urlParams.toString()}`,
      );
      return normalizeProductsResponse(raw, page, limit);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
