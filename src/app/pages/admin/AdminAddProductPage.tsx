import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";
import { ImageDropzone } from "../../components/admin/ImageDropzone";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
}

interface PackageGroup {
  id: string;
  groupName: string;
  packages: Package[];
}

interface CustomField {
  name: string;
  type: "text" | "email" | "tel" | "number";
  helper: string;
}

export function AdminAddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    categoryId: "",
    status: "active",
  });

  const [packageGroups, setPackageGroups] = useState<PackageGroup[]>([
    {
      id: `group${Date.now()}`,
      groupName: "",
      packages: [{ id: `pkg${Date.now()}`, name: "", price: 0 }],
    },
  ]);

  const [customFields, setCustomFields] = useState<CustomField[]>([
    { name: "", type: "text" as const, helper: "" },
  ]);

  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    initStorage();
    fetchCategories();

    if (isEditMode) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [navigate, isEditMode, id]);

  const initStorage = async () => {
    try {
      await fetch(`${API_BASE_URL}/init-product-storage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
    } catch (error) {
      console.error("Error initializing storage:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success && data.product) {
        const product = data.product;
        setFormData({
          name: product.name || "",
          description: product.description || "",
          image: product.image || "",
          categoryId: product.categoryId || "",
          status: product.status || "active",
        });
        setPreviewImage(product.image || "");

        // Handle both packageGroups and legacy flat packages format
        let groups: PackageGroup[] = [];
        if (product.packageGroups && product.packageGroups.length > 0) {
          groups = product.packageGroups;
        } else if (product.packages && product.packages.length > 0) {
          // Convert flat packages array to a single group
          groups = [{
            id: `group${Date.now()}`,
            groupName: "",
            packages: product.packages.map((pkg: any) => ({
              id: pkg.id || `pkg${Date.now()}`,
              name: pkg.name || "",
              price: pkg.price || 0,
            })),
          }];
        }

        setPackageGroups(
          groups.length > 0
            ? groups
            : [{ id: `group${Date.now()}`, groupName: "", packages: [{ id: `pkg${Date.now()}`, name: "", price: 0 }] }]
        );

        const fields = product.customFields;
        setCustomFields(
          Array.isArray(fields) && fields.length > 0
            ? fields
            : [{ name: "", type: "text" as const, helper: "" }]
        );
      } else {
        toast.error("Failed to load product");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PNG, JPG, and WEBP are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-product-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, image: data.url });
        setPreviewImage(data.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-image.png", { type: imageType });
          handleImageUpload(file);
          return;
        }
      }
      
      toast.error("No image found in clipboard");
    } catch (error) {
      console.error("Error pasting image:", error);
      toast.error("Failed to paste image. Please try uploading instead.");
    }
  };

  const handleAddPackage = (groupId: string) => {
    const updatedGroups = packageGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            packages: [
              ...group.packages,
              { id: `pkg${Date.now()}`, name: "", price: 0 },
            ],
          }
        : group
    );
    setPackageGroups(updatedGroups);
  };

  const handleRemovePackage = (groupId: string, index: number) => {
    const group = packageGroups.find((g) => g.id === groupId);
    if (!group) return;

    if (group.packages.length === 1) {
      toast.error("At least one item is required");
      return;
    }

    const updatedGroups = packageGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            packages: g.packages.filter((_, i) => i !== index),
          }
        : g
    );
    setPackageGroups(updatedGroups);
  };

  const handlePackageChange = (
    groupId: string,
    index: number,
    field: "name" | "price",
    value: string | number
  ) => {
    const updatedGroups = packageGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            packages: group.packages.map((pkg, i) =>
              i === index
                ? {
                    ...pkg,
                    [field]: field === "price" ? Number(value) : value,
                  }
                : pkg
            ),
          }
        : group
    );
    setPackageGroups(updatedGroups);
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { name: "", type: "text", helper: "" }]);
  };

  const handleRemoveCustomField = (index: number) => {
    if (customFields.length === 1) {
      toast.error("At least one custom field is required");
      return;
    }
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (
    index: number,
    field: "name" | "type" | "helper",
    value: string
  ) => {
    const updatedFields = [...customFields];
    if (field === "type") {
      updatedFields[index][field] = value as
        | "text"
        | "email"
        | "tel"
        | "number";
    } else {
      updatedFields[index][field] = value;
    }
    setCustomFields(updatedFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.categoryId) {
      toast.error("Please select a package category");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!formData.image && !isEditMode) {
      toast.error("Please upload a package image");
      return;
    }

    // Validate packages (items) — allow price >= 0 (e.g. Rs.1 is fine)
    const validPackageGroups = packageGroups.map((group) => ({
      ...group,
      packages: group.packages.filter((pkg) => pkg.name.trim() && pkg.price >= 0),
    }));

    if (validPackageGroups.some((group) => group.packages.length === 0)) {
      toast.error("At least one valid item is required in each package group");
      return;
    }

    // Validate custom fields — helper is optional
    const validCustomFields = customFields.filter(
      (field) => field.name.trim()
    );

    if (validCustomFields.length === 0) {
      toast.error("At least one valid custom field is required");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/products/${id}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          ...formData,
          packageGroups: validPackageGroups,
          customFields: validCustomFields,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          isEditMode
            ? "Package updated successfully!"
            : "Package added successfully!"
        );
        navigate("/admin/products");
      } else {
        toast.error(data.error || "Failed to save package");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-[1400px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Products</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isEditMode ? "Edit Package" : "Add New Package"}
          </h1>
          <p className="text-sm text-gray-600">
            {isEditMode
              ? "Update package information and items"
              : "Create a new package with items and custom fields"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Category */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Package Category
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Category <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Choose the category this product belongs to
              </p>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Product Information
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              This information will be shared across all packages
            </p>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Netflix Premium"
                  required
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the product"
                  rows={3}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900 resize-none"
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Image <span className="text-red-600">*</span>
                </label>

                {previewImage ? (
                  <div className="relative">
                    <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: "" });
                        setPreviewImage("");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <label className="absolute bottom-2 right-2 px-3 py-2 bg-[#0A64BC] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                      />
                      <Upload className="w-4 h-4" />
                      Change
                    </label>
                  </div>
                ) : (
                  <ImageDropzone
                    onDrop={handleImageUpload}
                    uploading={uploadingImage}
                    className="w-full h-64"
                    maxSize={5242880}
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 800x600px or higher. This image will be used for all packages.
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Packages <span className="text-red-600">*</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Add different pricing options for this product
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPackageGroups([
                    ...packageGroups,
                    {
                      id: `group${Date.now()}`,
                      groupName: "",
                      packages: [{ id: `pkg${Date.now()}`, name: "", price: 0 }],
                    },
                  ])
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Package Group
              </button>
            </div>

            <div className="space-y-3">
              {packageGroups.map((group) => (
                <div key={group.id} className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={group.groupName}
                        onChange={(e) => {
                          const updatedGroups = packageGroups.map((g) =>
                            g.id === group.id
                              ? { ...g, groupName: e.target.value }
                              : g
                          );
                          setPackageGroups(updatedGroups);
                        }}
                        placeholder="Package Group Name (e.g., Duration Plans, Account Types)"
                        className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none transition-colors text-sm font-semibold"
                      />
                    </div>
                    {packageGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (packageGroups.length === 1) {
                            toast.error("At least one package group is required");
                            return;
                          }
                          setPackageGroups(
                            packageGroups.filter((g) => g.id !== group.id)
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {group.packages.map((pkg, index) => (
                      <div
                        key={pkg.id}
                        className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-gray-200"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Package Name
                            </label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) =>
                                handlePackageChange(
                                  group.id,
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Basic, Premium, Family"
                              className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                              Price (Rs.)
                            </label>
                            <input
                              type="number"
                              value={pkg.price || ""}
                              onChange={(e) =>
                                handlePackageChange(
                                  group.id,
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              min="0"
                              className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePackage(group.id, index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddPackage(group.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-200 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Custom Fields <span className="text-red-600">*</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Fields users need to fill when purchasing
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Email, Player ID"
                          className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "type",
                              e.target.value
                            )
                          }
                          className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                          <option value="number">Number</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Helper Text
                      </label>
                      <input
                        type="text"
                        value={field.helper}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            index,
                            "helper",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Enter your email address"
                        className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-[#0A64BC] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="flex-1 h-12 px-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-12 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update Package"
                : "Add Package"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}