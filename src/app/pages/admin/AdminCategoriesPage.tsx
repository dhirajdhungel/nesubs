import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Search,
  X,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ImageDropzone } from "../../components/admin/ImageDropzone";

interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  createdAt: string;
}

export function AdminCategoriesPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
      return;
    }

    // Initialize storage bucket
    initStorage();
    fetchCategories();
  }, [navigate]);

  const initStorage = async () => {
    try {
      await fetch(`${API_BASE_URL}/init-storage`, {
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
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PNG, JPG, WEBP, and SVG are allowed");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2097152) {
      toast.error("File size exceeds 2MB limit");
      return;
    }

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload-category-icon`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, icon: data.url });
        setPreviewImage(data.url);
        toast.success("Icon uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload icon");
      }
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast.error("Failed to upload icon");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category added successfully!");
        setShowAddModal(false);
        setFormData({ name: "", icon: "" });
        setPreviewImage("");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category updated successfully!");
        setShowEditModal(false);
        setSelectedCategory(null);
        setFormData({ name: "", icon: "" });
        setPreviewImage("");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${selectedCategory.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category deleted successfully!");
        setShowDeleteModal(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setPreviewImage(category.icon);
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if icon is a URL (starts with http) or an emoji
  const isImageUrl = (icon: string) => icon.startsWith("http");

  const moveCategory = (dragIndex: number, hoverIndex: number) => {
    const newCategories = [...categories];
    const dragItem = newCategories[dragIndex];

    // Remove from old position
    newCategories.splice(dragIndex, 1);
    // Insert at new position
    newCategories.splice(hoverIndex, 0, dragItem);

    // Update order values for all categories
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }));

    setCategories(updatedCategories);

    // Debounce the API call
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }

    reorderTimeoutRef.current = setTimeout(() => {
      saveReorderedCategories(updatedCategories);
    }, 500);
  };

  const saveReorderedCategories = async (reorderedCategories: Category[]) => {
    try {
      const categoryIds = reorderedCategories.map(cat => cat.id);

      const response = await fetch(`${API_BASE_URL}/categories/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ categoryIds }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Categories reordered successfully!");
      } else {
        toast.error(data.error || "Failed to reorder categories");
        // Refresh to get correct order from server
        fetchCategories();
      }
    } catch (error) {
      console.error("Error reordering categories:", error);
      toast.error("Failed to reorder categories");
      // Refresh to get correct order from server
      fetchCategories();
    }
  };

  const CategoryItem = ({ category }: { category: Category }) => {
    const ref = useRef<HTMLTableRowElement>(null);
    const [{ isDragging }, drag] = useDrag({
      type: "category",
      item: { id: category.id, index: categories.findIndex((c) => c.id === category.id) },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const [{ isOver }, drop] = useDrop({
      accept: "category",
      hover(item: { id: string; index: number }) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = categories.findIndex((c) => c.id === category.id);
        if (dragIndex === hoverIndex) {
          return;
        }
        moveCategory(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });
    drag(drop(ref) as any);

    return (
      <tr
        ref={ref}
        key={category.id}
        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isDragging ? 'opacity-50' : ''}`}
      >
        <td className="py-4 px-6 text-sm text-gray-500">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </td>
        <td className="py-4 px-6">
          {isImageUrl(category.icon) ? (
            <img
              src={category.icon}
              alt={category.name}
              className="w-10 h-10 object-cover rounded-lg"
            />
          ) : (
            <span className="text-2xl">{category.icon}</span>
          )}
        </td>
        <td className="py-4 px-6 text-sm font-semibold text-gray-900">
          {category.name}
        </td>
        <td className="py-4 px-6 text-sm text-gray-600">
          {new Date(category.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => openEditModal(category)}
              className="p-2 text-gray-600 hover:text-[#0A64BC] hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(category)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <AdminLayout>
        <div className="p-6 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Categories Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage product categories and organize your services
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData({ name: "", icon: "" });
                  setPreviewImage("");
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
              />
            </div>
          </div>

          {/* Categories List */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? "No categories found" : "No categories yet"}
              </h2>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Start by adding your first category"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setFormData({ name: "", icon: "" });
                    setPreviewImage("");
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Category
                </button>
              )}
            </div>
          ) : (
            <DndProvider backend={HTML5Backend}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                          Order
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                          Icon
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="text-right py-3 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category) => (
                        <CategoryItem key={category.id} category={category} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DndProvider>
          )}

          {/* Add Category Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <h2 className="text-xl font-bold text-gray-900">Add Category</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setPreviewImage("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddCategory} className="p-6 space-y-5">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Streaming"
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
                    />
                  </div>

                  {/* Category Icon Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category Icon
                    </label>

                    {previewImage ? (
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200">
                          {isImageUrl(previewImage) ? (
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-6xl">{previewImage}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, icon: "" });
                            setPreviewImage("");
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <ImageDropzone
                        onDrop={handleImageUpload}
                        uploading={uploadingImage}
                        className="w-full h-48"
                        maxSize={2097152}
                      />
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Upload a square icon (recommended: 256x256px)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setPreviewImage("");
                      }}
                      className="flex-1 h-12 px-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formData.icon}
                      className="flex-1 h-12 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {submitting ? "Adding..." : "Add Category"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {showEditModal && selectedCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setPreviewImage("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEditCategory} className="p-6 space-y-5">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Streaming"
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none transition-colors text-gray-900"
                    />
                  </div>

                  {/* Category Icon Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category Icon
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    {previewImage ? (
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200">
                          {isImageUrl(previewImage) ? (
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-6xl">{previewImage}</span>
                          )}
                        </div>
                        <label className="absolute bottom-2 right-2 px-3 py-2 bg-[#0A64BC] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                          />
                          <Upload className="w-4 h-4" />
                          Change
                        </label>
                      </div>
                    ) : (
                      <ImageDropzone
                        onDrop={handleImageUpload}
                        uploading={uploadingImage}
                        className="w-full h-48"
                        maxSize={2097152}
                      />
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Upload a square icon (recommended: 256x256px)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setPreviewImage("");
                      }}
                      className="flex-1 h-12 px-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formData.icon}
                      className="flex-1 h-12 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Delete Category
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedCategory.name}
                    </span>
                    ? This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 h-12 px-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteCategory}
                      disabled={submitting}
                      className="flex-1 h-12 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
                    >
                      {submitting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}