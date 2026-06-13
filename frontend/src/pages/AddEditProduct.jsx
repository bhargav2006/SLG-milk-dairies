import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import productService from "../services/productService";
import { Skeleton } from "../components/common/Skeleton";
import { ArrowLeft, Save } from "lucide-react";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const isEditMode = !!id;

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    category: "",
    price: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch product details for edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const product = await productService.getProductById(id);
        setFormData({
          name: product.name || "",
          serialNumber: product.serialNumber || "",
          category: product.category || "",
          price: product.price ? product.price.toString() : "",
          description: product.description || "",
        });
      } catch (err) {
        console.error("Error loading product:", err);
        showError("Failed to load product details.");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode, navigate, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for that field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Product Name is required";
    if (!formData.serialNumber.trim()) tempErrors.serialNumber = "Serial Number is required";
    if (!formData.category) tempErrors.category = "Please select a category";
    
    if (!formData.price) {
      tempErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      tempErrors.price = "Price must be a valid positive number";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        serialNumber: formData.serialNumber.trim().toUpperCase(),
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description.trim(),
      };

      if (isEditMode) {
        await productService.updateProduct(id, payload);
        showSuccess("Product updated successfully!");
      } else {
        await productService.createProduct(payload);
        showSuccess("Product created successfully!");
      }
      navigate("/products");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "An error occurred while saving the product";
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const categoriesList = ["Milk", "Cheese", "Butter", "Yogurt", "Ghee", "Paneer", "Cream", "Lassi", "Flavoured Milk", "Ice Cream"];

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
          <Skeleton style={{ height: "32px", width: "100px", borderRadius: "8px" }} />
        </div>
        <div className="card-panel" style={{ padding: "24px" }}>
          <Skeleton style={{ height: "30px", width: "40%", marginBottom: "24px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <Skeleton style={{ height: "14px", width: "120px", marginBottom: "6px" }} />
              <Skeleton style={{ height: "40px", borderRadius: "8px" }} />
            </div>
            <div>
              <Skeleton style={{ height: "14px", width: "120px", marginBottom: "6px" }} />
              <Skeleton style={{ height: "40px", borderRadius: "8px" }} />
            </div>
            <div>
              <Skeleton style={{ height: "14px", width: "120px", marginBottom: "6px" }} />
              <Skeleton style={{ height: "80px", borderRadius: "8px" }} />
            </div>
            <Skeleton style={{ height: "46px", width: "140px", borderRadius: "8px", marginTop: "10px" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Back button */}
      <Link to="/products" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
        <ArrowLeft size={16} />
        Back to Products Catalog
      </Link>

      <div className="card-panel" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "24px" }}>
          {isEditMode ? "Edit Product Information" : "Create New Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Product Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Fresh Paneer (200g)"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          {/* Row of Serial and Category */}
          <div className="form-row">
            {/* Serial Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="serialNumber">
                Serial Number / SKU Code *
              </label>
              <input
                id="serialNumber"
                name="serialNumber"
                type="text"
                placeholder="e.g. PANR02"
                value={formData.serialNumber}
                onChange={handleChange}
                className="form-input"
                style={{ textTransform: "uppercase" }}
                disabled={submitting}
              />
              {errors.serialNumber && <span className="form-error-msg">{errors.serialNumber}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                disabled={submitting}
              >
                <option value="">Select Category</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="form-error-msg">{errors.category}</span>}
            </div>
          </div>

          {/* Product Price */}
          <div className="form-group">
            <label className="form-label" htmlFor="price">
              Product Price (₹) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="any"
              placeholder="e.g. 120.00"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
            />
            {errors.price && <span className="form-error-msg">{errors.price}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Product Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Provide a brief description of the product pack sizes, fat content, or storage directions..."
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              style={{ minHeight: "100px", resize: "vertical" }}
              disabled={submitting}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Save size={16} />
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Product"}
            </button>
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
