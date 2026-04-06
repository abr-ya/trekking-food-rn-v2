import {
  useProducts,
  type Product
} from "@hooks/use-product-data";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
      </View>
      {product.category && (
        <Text style={styles.category}>{product.category.name}</Text>
      )}
      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionText}>
          {product.kkal} kcal
        </Text>
        <Text style={styles.nutritionText}>
          P: {product.proteins}g
        </Text>
        <Text style={styles.nutritionText}>
          F: {product.fats}g
        </Text>
        <Text style={styles.nutritionText}>
          C: {product.carbohydrates}g
        </Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>Price: {product.price.toFixed(2)}</Text>
        {product.is_vegetarian && (
          <Text style={styles.vegBadge}>🌿 Vegetarian</Text>
        )}
      </View>
    </View>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data, isLoading, error, refetch } = useProducts({
    search: submittedSearch || undefined,
    page: 1,
    limit: 20,
  });

  const handleSearch = () => {
    setSubmittedSearch(search.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error: {(error as Error).message}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {data?.meta != null && (
        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            {`Found: ${data.meta.total} products (page ${data.meta.page}/${data.meta.totalPages})`}
          </Text>
        </View>
      )}

      {data?.data && data.data.length > 0 && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}

      {data != null && (data.data?.length ?? 0) === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nothing found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchRow: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#e63e11",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    padding: 8,
  },
  retryText: {
    color: "#0066cc",
    fontSize: 14,
    fontWeight: "600",
  },
  resultInfo: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultText: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
  },
  category: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 14,
    color: "#555",
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#038141",
  },
  vegBadge: {
    fontSize: 14,
    color: "#038141",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
});
