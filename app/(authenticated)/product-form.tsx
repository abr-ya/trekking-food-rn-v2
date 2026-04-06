import {
    useCreateProduct,
    useProduct,
    useProductCategories,
    useUpdateProduct,
} from "@hooks/use-product-data";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!params.id;

  // Data
  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(params.id);
  const { data: categories } = useProductCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const navigation = useNavigation();

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [kkal, setKkal] = useState("");
  const [proteins, setProteins] = useState("0");
  const [fats, setFats] = useState("0");
  const [carbohydrates, setCarbohydrates] = useState("0");
  const [price, setPrice] = useState("0");
  const [isVegetarian, setIsVegetarian] = useState(false);

  // Category picker
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setCategoryId(existingProduct.product_category_id);
      setKkal(String(existingProduct.kkal));
      setProteins(String(existingProduct.proteins));
      setFats(String(existingProduct.fats));
      setCarbohydrates(String(existingProduct.carbohydrates));
      setPrice(String(existingProduct.price));
      setIsVegetarian(existingProduct.is_vegetarian);
    }
  }, [existingProduct]);

  const isSaving = createProduct.isPending || updateProduct.isPending;

  // Validation
  const validate = (): boolean => {
    if (name.trim().length < 2) {
      Alert.alert("Validation Error", "Name must be at least 2 characters");
      return false;
    }
    if (!categoryId) {
      Alert.alert("Validation Error", "Please select a category");
      return false;
    }
    const kcalNum = Number(kkal);
    if (isNaN(kcalNum) || kcalNum < 0) {
      Alert.alert("Validation Error", "Calories must be a valid number >= 0");
      return false;
    }
    return true;
  };

  // Save handler
  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      product_category_id: categoryId,
      kkal: Number(kkal),
      proteins: Number(proteins) || 0,
      fats: Number(fats) || 0,
      carbohydrates: Number(carbohydrates) || 0,
      price: Number(price) || 0,
      is_vegetarian: isVegetarian,
    };

    try {
      if (isEditMode && params.id) {
        await updateProduct.mutateAsync({ id: params.id, data: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      Alert.alert(
        "Success",
        isEditMode ? "Product updated" : "Product created",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    }
  };

  // Dynamic header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? "Edit Product" : "Add Product",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{ marginRight: 16, opacity: isSaving ? 0.5 : 1 }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0066cc" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [isEditMode, isSaving, navigation, handleSave]);

  // Loading state (edit mode only)
  if (isEditMode && isLoadingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  const selectedCategory = categories?.find((c) => c.id === categoryId);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Product name"
          placeholderTextColor="#999"
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>Category *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text
            style={[
              styles.selectButtonText,
              !selectedCategory && { color: "#999" },
            ]}
          >
            {selectedCategory?.name || "Select category"}
          </Text>
          <Text style={styles.selectArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Kkal */}
      <View style={styles.field}>
        <Text style={styles.label}>Calories (kcal) *</Text>
        <TextInput
          style={styles.input}
          value={kkal}
          onChangeText={setKkal}
          placeholder="0"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      {/* Macros row */}
      <View style={styles.macrosRow}>
        <View style={[styles.field, styles.macroField]}>
          <Text style={styles.label}>Proteins (g)</Text>
          <TextInput
            style={styles.input}
            value={proteins}
            onChangeText={setProteins}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.field, styles.macroField]}>
          <Text style={styles.label}>Fats (g)</Text>
          <TextInput
            style={styles.input}
            value={fats}
            onChangeText={setFats}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </View>
      <View style={styles.macrosRow}>
        <View style={[styles.field, styles.macroField]}>
          <Text style={styles.label}>Carbs (g)</Text>
          <TextInput
            style={styles.input}
            value={carbohydrates}
            onChangeText={setCarbohydrates}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.field, styles.macroField]}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Vegetarian toggle */}
      <View style={[styles.field, styles.switchRow]}>
        <Text style={styles.label}>Vegetarian</Text>
        <Switch
          value={isVegetarian}
          onValueChange={setIsVegetarian}
          trackColor={{ false: "#ccc", true: "#038141" }}
          thumbColor={isVegetarian ? "#fff" : "#f4f4f4"}
        />
      </View>

      {/* Spacer at bottom */}
      <View style={{ height: 32 }} />

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {categories && categories.length > 0 ? (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      item.id === categoryId && styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setCategoryId(item.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        item.id === categoryId && styles.categoryItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.id === categoryId && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>No categories available</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  saveButtonText: {
    color: "#0066cc",
    fontSize: 16,
    fontWeight: "600",
  },
  field: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333",
  },
  selectArrow: {
    fontSize: 12,
    color: "#999",
  },
  macrosRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  macroField: {
    flex: 1,
    paddingTop: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalClose: {
    fontSize: 20,
    color: "#999",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryItemSelected: {
    backgroundColor: "#f0f7ff",
  },
  categoryItemText: {
    fontSize: 16,
    color: "#333",
  },
  categoryItemTextSelected: {
    color: "#0066cc",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 18,
    color: "#0066cc",
  },
  modalEmpty: {
    padding: 32,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 16,
    color: "#999",
  },
});
