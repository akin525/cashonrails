"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { TableDetailSkeleton } from "@/components/loaders";
import { Dialog, DialogTitle } from "@headlessui/react";
import classNames from "classnames";
type ProductVariation = {
    name: string;
    value: string;
};
type Category = {
    id: number;
    name: string;
};
interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    newProduct: any;
    setNewProduct: (data: any) => void;
    categories: any[];
    handleImageUploads: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadedImageIds: any[];
    uploading: boolean;
    removeUploadedImage: (index: number) => void;
    productVariations: any[];
    handleVariationChange: (index: number, field: string, value: string) => void;
    addVariation: () => void;
    handleProductSubmit: () => void;
    isSubmitting: boolean;
}



const StoreDetailsPage = ({ params }: { params: { id: string } }) => {
    const { authState } = useAuth();
    const [store, setStore] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("products");
    const [uploadedImageIds, setUploadedImageIds] = useState<{ id: number, url: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    // const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editProduct, setEditProduct] = useState<any>({});

    // Form states
    // const [newProduct, setNewProduct] = useState<any>({ name: "", price: "", description: "", category_id: "", images: [] });
    const [newCategory, setNewCategory] = useState<string>("");
    // const [uploading, setUploading] = useState(false);
    // const [uploadedImageIds, setUploadedImageIds] = useState<number[]>([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        stock: "",
        price: "",
        weight: "",
        currency: "",
        description: "",
        category_id: "",
        images: [] as File[],
    });

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await axiosInstance.get(`/list-order`, {
                params:{
                  'store_id':params.id,
                },
                headers: { Authorization: `Bearer ${authState?.token}` },
            });

            if (response.data.status) {
                setOrders(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to load orders.");
            }
        } catch (error) {
            toast.error("Error fetching orders.");
        } finally {
            setLoadingOrders(false);
        }
    };
    useEffect(() => {
        if (activeTab === "orders" && authState?.token) {
            fetchOrders();
        }
    }, [activeTab, authState?.token]);

    const handleEditClick = () => {
        if (!selectedProduct) return;

        setEditProduct({
            name: selectedProduct.name || "",
            price: selectedProduct.price?.toString() || "",
            stock: selectedProduct.quantity?.toString() || "",
            weight: selectedProduct.weight?.toString() || "",
            currency: selectedProduct.currency || "",
            description: selectedProduct.description || "",
            category_id: selectedProduct.category_id?.toString() || "",
        });
        setIsEditing(true);
    };


    const handleProductUpdate = async () => {
        setIsUpdating(true);
        try {
            const payload = {
                ...editProduct,
                quantity: parseInt(editProduct.stock),
                weight: parseFloat(editProduct.weight),
            };

            const res = await axiosInstance.post(
                `/update-product/${selectedProduct.id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );

            if (res.data.status) {
                toast.success("Product updated");
                setSelectedProduct(null);
                setIsEditing(false);
            } else {
                toast.error(res.data.message || "Update failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchStoreDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/get-store/${params.id}`, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });

            if (response.data.status) {
                setStore(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to load store.");
            }
        } catch {
            toast.error("Error fetching store.");
        } finally {
            setIsLoading(false);
        }
    };
    const [productVariations, setProductVariations] = useState<ProductVariation[]>([
        { name: "", value: "" },
    ]);

    const handleProductSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Format variations for backend
            const formattedVariations = productVariations
                .filter((v) => v.name && v.value)
                .map((v) => ({
                    name: v.name,
                    values: [v.value],
                }));

            const payload = {
                name: newProduct.name,
                description: newProduct.description,
                price: newProduct.price,
                currency: newProduct.currency,
                quantity: parseInt(newProduct.stock),
                weight: parseFloat(newProduct.weight),
                category_id: newProduct.category_id,
                image: uploadedImageIds, // assuming this is array of file ids
                variations: formattedVariations.length > 0 ? formattedVariations : undefined,
            };

            let res;
            if (selectedProduct) {
                // Editing product
                res = await axiosInstance.put(
                    `/update-product/${selectedProduct.id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${authState.token}`,
                        },
                    }
                );
            } else {
                // Adding new product
                res = await axiosInstance.post(
                    `/add-product/${params.id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${authState.token}`,
                        },
                    }
                );
            }

            if (res.data.status) {
                toast.success(
                    selectedProduct ? "Product updated successfully" : "Product added successfully"
                );

                // Reset form
                setNewProduct({
                    name: "",
                    stock: "",
                    price: "",
                    weight: "",
                    currency: "",
                    description: "",
                    category_id: "",
                    images: [],
                });
                setUploadedImageIds([]);
                setProductVariations([]);
                setSelectedProduct(null); // Exit edit mode
            } else {
                toast.error(res.data.message || "Operation failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };



    const addVariation = () => {
        setProductVariations([...productVariations, { name: "", value: "" }]);
    };





    const handleCategorySubmit = async () => {
        try {
            const res = await axiosInstance.post("/create-category", {
                name: newCategory,
                store_id: params.id,
            }, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });

            if (res.data.status) {
                toast.success("Category created");
                setNewCategory("");
                fetchStoreDetails();
                setActiveTab("products");
            } else {
                toast.error(res.data.message || "Failed to add category.");
            }
        } catch {
            toast.error("Error creating category.");
        }
    };
    useEffect(() => {
        axiosInstance
            .get(`/list-category/${params.id}`, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            })
            .then((res) => setCategories(res.data.data || []))
            .catch((err) => console.error("Failed to load categories", err));
    }, []);

    useEffect(() => {
        if (authState?.token && params.id) fetchStoreDetails();
    }, [authState?.token, params.id]);

    if (isLoading) return <TableDetailSkeleton />;
    if (!store) return <p className="p-6 text-gray-600 dark:text-gray-300">Store not found.</p>;

    const handleImageUploads = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploading(true);

        try {
            const uploaded = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append("type", "product-media");
                    formData.append("file", file);

                    const res = await axiosInstance.post(`/file-upload/${params.id}`, formData, {
                        headers: {
                            Authorization: `Bearer ${authState.token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    });

                    if (res.data.success) {
                        return { id: res.data.data.id, url: res.data.data.path };
                    } else {
                        toast.error(res.data.message);
                        return null;
                    }
                })
            );

            setUploadedImageIds((prev) => [
                ...prev,
                ...uploaded.filter((item): item is { id: number; url: string } => item !== null)
            ]);

        } catch (err: any) {
            toast.error(err.message || "Upload error");
        } finally {
            setUploading(false);
        }
    };

    const removeUploadedImage = (index: number) => {
        setUploadedImageIds((prev) => prev.filter((_, i) => i !== index));
    };
    const handleVariationChange = (
        index: number,
        key: keyof ProductVariation,
        value: string
    ) => {
        const updated = [...productVariations];
        updated[index] = { ...updated[index], [key]: value };
        setProductVariations(updated);
    };



    return (
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
            {isSubmitting && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-md flex flex-col md:flex-row gap-6 items-center">
                <div>
                    {store.logo ? (
                        <img src={store.logo.file} alt="Store Logo" className="w-28 h-28 object-cover rounded-xl border dark:border-neutral-700" />
                    ) : (
                        <div className="w-28 h-28 rounded-xl bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-sm text-gray-400">
                            No Logo
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{store.name}</h2>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${store.status === 1 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
              {store.status === 1 ? "Active" : "Inactive"}
            </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">{store.domain}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created on {new Date(store.created_at).toLocaleDateString("en-NG")}</p>
                    {store.description && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{store.description}</p>}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 text-sm border-b dark:border-neutral-700 pb-2">
                {["products", "orders", "add-product", "add-category"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={classNames(
                            "px-4 py-2 rounded-t-md font-medium",
                            activeTab === tab
                                ? "bg-white dark:bg-neutral-900 border dark:border-neutral-700 border-b-0"
                                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                        )}
                    >
                        {tab.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "products" && (
                <section>
                    {!store.products?.length ? (
                        <div
                            className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow text-gray-500 dark:text-gray-400">
                            No products available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {store.products.map((product: any) => {
                                const imageUrl = product.images?.[0]?.file;
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsEditing(false);
                                        }}
                                        className="cursor-pointer group transition-all duration-200 bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border hover:shadow-xl dark:hover:shadow-lg"
                                    >
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={product.name}
                                                 className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"/>
                                        ) : (
                                            <div
                                                className="w-full h-44 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <div className="p-4 space-y-1">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{product.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">₦{parseFloat(product.price).toLocaleString()}</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">{product.category?.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{product.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {activeTab === "orders" && (
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">
                    {loadingOrders ? (
                        <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-300">No orders found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Order
                                        ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Customer</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Phone</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Address</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                                </tr>
                                </thead>
                                <tbody
                                    className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{order.id}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{order.name || "N/A"}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{order.phone}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {order.address}, {order.city}, {order.state}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            {order.currency === "NGN" ? "₦" : order.currency} {parseFloat(order.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        order.status === 1
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}>
                                        {order.status === 1 ? "Completed" : "Pending"}
                                    </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "add-product" && (
                <div className="w-full min-h-screen bg-white dark:bg-neutral-900 p-8 space-y-8">
                    <h2 className="text-3xl font-bold dark:text-white">Add Product</h2>

                    {/* Grid Layout for Basic Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div>
                            <label className="block mb-1 text-sm font-medium dark:text-white">Product Name</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block mb-1 text-sm font-medium dark:text-white">Price</label>
                            <input
                                type="number"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            />
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block mb-1 text-sm font-medium dark:text-white">Stock Quantity</label>
                            <input
                                type="number"
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Reflect actual inventory.</p>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block mb-1 text-sm font-medium dark:text-white">Weight (kg)</label>
                            <input
                                type="number"
                                value={newProduct.weight}
                                onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Important for shipping.</p>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block mb-1 text-sm font-medium dark:text-white">Currency</label>
                            <select
                                value={newProduct.currency}
                                onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            >
                                <option value="">Select currency</option>
                                <option value="USD">USD ($)</option>
                                <option value="NGN">NGN (₦)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block mb-1 text-sm font-medium dark:text-white">Category</label>
                            <select
                                value={newProduct.category_id}
                                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-1 text-sm font-medium dark:text-white">Description</label>
                        <textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block mb-2 text-sm font-medium dark:text-white">Upload Images</label>
                        <input type="file" multiple onChange={handleImageUploads} />
                        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading images...</p>}
                        {uploadedImageIds.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                {uploadedImageIds.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24">
                                        <img src={img.url} alt="Uploaded" className="w-full h-full object-cover rounded-md" />
                                        <button
                                            onClick={() => removeUploadedImage(idx)}
                                            className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-bl-md"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Variations */}
                    <div>
                        <h3 className="text-xl font-semibold mb-2 dark:text-white">Product Variations</h3>
                        <div className="space-y-3">
                            {productVariations.map((variation, index) => (
                                <div key={index} className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Variation Name"
                                        value={variation.name}
                                        onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Variation Value"
                                        value={variation.value}
                                        onChange={(e) => handleVariationChange(index, "value", e.target.value)}
                                        className="w-1/2 px-3 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={addVariation}
                                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                + Add Variation
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            onClick={handleProductSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-md text-lg font-medium ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {isSubmitting ? "Submitting..." : "Add Product"}
                        </button>

                    </div>
                </div>
            )}


            {activeTab === "add-category" && (
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow space-y-4 max-w-md">
                    <input type="text" placeholder="Category Name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" />
                    <button onClick={handleCategorySubmit} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Create Category</button>
                </div>
            )}

            {/* Product Modal */}
            {selectedProduct && (
                <Dialog open={true} onClose={() => {
                    setSelectedProduct(null);
                    setIsEditing(false);
                }} className="relative z-50">
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 py-10">
                        <div className="bg-white dark:bg-neutral-900 max-w-md w-full p-6 rounded-xl shadow-xl relative z-50">
                            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {isEditing ? "Edit Product" : selectedProduct.name}
                            </DialogTitle>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Product Name"
                                        value={editProduct.name}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, name: e.target.value })
                                        }
                                    />
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Price"
                                        value={editProduct.price}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, price: e.target.value })
                                        }
                                    />
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Stock"
                                        value={editProduct.stock}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, stock: e.target.value })
                                        }
                                    />
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Weight"
                                        value={editProduct.weight}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, weight: e.target.value })
                                        }
                                    />
                                    <textarea
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Description"
                                        value={editProduct.description}
                                        onChange={(e) =>
                                            setEditProduct({ ...editProduct, description: e.target.value })
                                        }
                                    />
                                    {/* Add category dropdown if needed here */}

                                    <div className="flex items-center justify-between gap-2 mt-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="w-1/2 border border-gray-400 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleProductUpdate}
                                            className="w-1/2 bg-blue-600 text-white py-2 rounded-md text-sm"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? "Updating..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={selectedProduct.images?.[0]?.file || ""}
                                        alt={selectedProduct.name}
                                        className="w-full h-52 object-cover rounded-lg mb-4"
                                    />
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p className="font-semibold text-lg">
                                            ₦{parseFloat(selectedProduct.price).toLocaleString()}
                                        </p>
                                        <p className="text-indigo-600 dark:text-indigo-400">
                                            {selectedProduct.category?.name}
                                        </p>
                                        <p>{selectedProduct.description || "No description"}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <button
                                            onClick={handleEditClick}
                                            className="text-blue-600 text-sm underline"
                                        >
                                            Edit Product
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(null);
                                                setIsEditing(false);
                                            }}
                                            className="text-red-500 text-sm underline"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Dialog>
            )}

        </div>
    );
};

export default StoreDetailsPage;
