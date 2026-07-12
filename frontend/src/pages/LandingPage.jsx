import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, LogOut, Menu, X, Minus, Plus, Trash2, ArrowRight, Clock, MapPin, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import customerService from "../services/customerService";

// Import Refactored Subcomponents
import Header from "../components/store/Header";
import Hero from "../components/store/Hero";
import OfferBanner from "../components/store/OfferBanner";
import SearchBar from "../components/store/SearchBar";
import CategoryFilter from "../components/store/CategoryFilter";
import ProductGrid from "../components/store/ProductGrid";
import ProductModal from "../components/store/ProductModal";
import FloatingCart from "../components/store/FloatingCart";
import CheckoutDrawer from "../components/store/CheckoutDrawer";
import TrustSection from "../components/store/TrustSection";
import Footer from "../components/store/Footer";

import "./LandingPage.css";

// Configuration Constants
const CONFIG = {
  MIN_ORDER_AMOUNT: 200,
  FREE_DELIVERY_AMOUNT: 500,
  DELIVERY_CHARGE: 20,
  DELIVERY_LOCATION_DEFAULT: null, // "Select Delivery Location"
  BUSINESS_HOURS: "10:00 AM - 8:00 PM",
  DELIVERY_TODAY_CUTOFF: "7:00 PM",
};

const LandingPage = () => {
  const { user } = useAuth(); // Admin/Accountant user if logged in
  const { showSuccess, showError, showInfo } = useToast();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  
  // Storefront & Catalog State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart State (stored locally)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("dairy_customer_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Customer Auth Session
  const [customerInfo, setCustomerInfo] = useState(() => {
    const savedInfo = localStorage.getItem("customer_info");
    return savedInfo ? JSON.parse(savedInfo) : null;
  });
  const [customerToken, setCustomerToken] = useState(() => {
    return localStorage.getItem("customer_token") || null;
  });

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [newAddress, setNewAddress] = useState({
    houseNo: "",
    street: "",
    landmark: "",
    city: "P.Gannavaram",
    pincode: "533240",
  });

  // Placed Order Receipt Modal State
  const [placedOrder, setPlacedOrder] = useState(null);



  // Lock body scroll when drawers/modals are active
  useEffect(() => {
    if (isCartOpen || isCheckoutOpen || selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen, isCheckoutOpen, selectedProduct]);

  // Scroll Header Effect & Active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ["home", "products"];
      const scrollPosition = window.scrollY + 120; // Offset

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch shop products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await customerService.getShopProducts({ productType: "retail", limit: 100 });
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products:", err);
        showError("Failed to fetch product catalog. Showing offline view.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [showError]);

  // Load customer profile and addresses if customer token exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (customerToken) {
        try {
          const data = await customerService.getProfile();
          if (data && data.customer) {
            setCustomerInfo(data.customer);
            localStorage.setItem("customer_info", JSON.stringify(data.customer));
            
            // Populate address list
            const savedAddrs = data.customer.addresses || [];
            setAddresses(savedAddrs);
            if (savedAddrs.length > 0) {
              const defaultIdx = savedAddrs.findIndex((a) => a.isDefault);
              setSelectedAddressIndex(defaultIdx !== -1 ? defaultIdx : 0);
            }
            if (data.customer.customerName && data.customer.customerName !== "Anonymous") {
              setCustomerName(data.customer.customerName);
            }
          }
        } catch (err) {
          console.error("Failed to fetch customer profile:", err);
          handleCustomerLogout();
        }
      }
    };

    fetchProfile();
  }, [customerToken]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem("dairy_customer_cart", JSON.stringify(cart));
  }, [cart]);

  // --- Cart Actions ---
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          showError(`Only ${product.stock} items available in stock.`);
          return prevCart;
        }
        showSuccess(`Increased ${product.name} quantity.`);
        return prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stock !== undefined && product.stock <= 0) {
          showError("Out of stock.");
          return prevCart;
        }
        showSuccess(`Added ${product.name} to cart.`);
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  }, [showError, showSuccess]);

  const updateCartQty = useCallback((productId, amount) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product._id === productId) {
            const nextQty = item.quantity + amount;
            if (nextQty <= 0) return null;
            if (item.product.stock !== undefined && nextQty > item.product.stock) {
              showError(`Only ${item.product.stock} items available in stock.`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  }, [showError]);

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
    showInfo("Removed item from cart.");
  };

  const getProductQtyInCart = useCallback((productId) => {
    const item = cart.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  // --- Calculation Helpers ---
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.product.retailPrice || item.product.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = cartSubtotal >= CONFIG.FREE_DELIVERY_AMOUNT || cartSubtotal === 0 ? 0 : CONFIG.DELIVERY_CHARGE;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- Customer Login/OTP Flow ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setOtpVerifying(true);
      await customerService.sendOtp(customerPhone);
      setOtpSent(true);
      showSuccess("OTP sent successfully. Check your terminal/console!");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      showError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setOtpVerifying(true);
      const data = await customerService.verifyOtp(customerPhone, otp);
      if (data && data.token) {
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_info", JSON.stringify(data.customer));
        setCustomerToken(data.token);
        setCustomerInfo(data.customer);
        setAddresses(data.customer.addresses || []);
        if (data.customer.addresses?.length > 0) {
          setSelectedAddressIndex(0);
        }
        if (data.customer.customerName && data.customer.customerName !== "Anonymous") {
          setCustomerName(data.customer.customerName);
        }
        showSuccess("Authenticated successfully!");
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "OTP verification failed. Check again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_info");
    setCustomerToken(null);
    setCustomerInfo(null);
    setAddresses([]);
    setSelectedAddressIndex(-1);
    setCustomerPhone("");
    setOtp("");
    setOtpSent(false);
    showInfo("Logged out of customer session.");
  };

  // --- Place Order Logic ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showError("Your cart is empty.");
      return;
    }

    if (!customerName.trim()) {
      showError("Please enter your name.");
      return;
    }

    let addressPayload = {};
    if (selectedAddressIndex !== -1 && addresses[selectedAddressIndex]) {
      addressPayload = addresses[selectedAddressIndex];
    } else {
      if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
        showError("Please fill in all address details (Street, City, Pincode)");
        return;
      }
      addressPayload = newAddress;
    }

    try {
      setIsSubmittingOrder(true);
      const orderPayload = {
        products: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        address: addressPayload,
        paymentMethod: "COD",
        notes: deliveryNotes || "",
      };

      const response = await customerService.placeOrder(orderPayload);
      if (response && response.order) {
        setPlacedOrder(response.order);
        setCart([]); // Clear cart
        setIsCartOpen(false);
        showSuccess("Order placed successfully!");
        
        // Refresh customer profile to sync addresses
        const profileData = await customerService.getProfile();
        if (profileData && profileData.customer) {
          setCustomerInfo(profileData.customer);
          localStorage.setItem("customer_info", JSON.stringify(profileData.customer));
          setAddresses(profileData.customer.addresses || []);
        }
      }
    } catch (err) {
      console.error("Order error:", err);
      showError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // --- Filtering & Image Utilities ---
  const getProductImage = (product) => {
    if (product.image && product.image.trim() !== "") {
      return product.image.startsWith("http")
        ? product.image
        : `${import.meta.env.VITE_BACKEND_URI}${product.image}`;
    }
    const categoryImageMap = {
      Milk: "Milk.jpg",
      Cheese: "Cheese.jpg",
      Butter: "Butter.jpg",
      Yogurt: "Curd.jpg",
      Curd: "Curd.jpg",
      Ghee: "Ghee.jpg",
      Paneer: "Paneer.jpg",
      Cream: "Cream.jpg",
      Lassi: "Lassi.jpg",
      "Flavoured Milk": "Flavoured-Milk.jpg",
      "Ice Cream": "Ice-Cream.jpg",
      Sweets: "Sweets.jpg",
      Spices: "Spices.jpg",
    };
    const filename = categoryImageMap[product.category] || "Logo.jpg";
    return `${import.meta.env.VITE_BACKEND_URI}/uploads/defaults/${filename}`;
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "milk") {
      return matchesSearch && (prod.category.toLowerCase() === "milk" || prod.category.toLowerCase() === "yogurt" || prod.category.toLowerCase() === "curd");
    }
    if (activeFilter === "ghee") {
      return matchesSearch && (prod.category.toLowerCase() === "ghee" || prod.category.toLowerCase() === "butter" || prod.category.toLowerCase() === "cheese" || prod.category.toLowerCase() === "paneer");
    }
    if (activeFilter === "sweets") {
      return matchesSearch && (prod.category.toLowerCase() === "sweets" || prod.category.toLowerCase() === "lassi" || prod.category.toLowerCase() === "flavoured milk" || prod.category.toLowerCase() === "ice cream");
    }
    return matchesSearch;
  });

  return (
    <div className="landing-page-root">
      {/* 1. Header Navigation */}
      <Header
        user={user}
        customerToken={customerToken}
        cartCount={cartCount}
        handleCustomerLogout={handleCustomerLogout}
        setIsCartOpen={setIsCartOpen}
      />

      {/* 2. Sticky Delivery Location Placeholder Bar */}
      <div className="lp-location-banner-bar">
        <div className="lp-container lp-location-flex">
          <span className="lp-location-text">
            📍 Select Delivery Location
          </span>
          <button
            className="lp-location-change-btn"
            onClick={() => showInfo("GPS location tracking will be available in future releases.")}
          >
            Change Location
          </button>
        </div>
      </div>

      {/* 3. Hero Banner (Reduced Height, Concise Text) */}
      <Hero />

      {/* 4. Delivery terms & Offers Section */}
      <OfferBanner
        minOrderAmount={CONFIG.MIN_ORDER_AMOUNT}
        freeDeliveryAmount={CONFIG.FREE_DELIVERY_AMOUNT}
        businessHours={CONFIG.BUSINESS_HOURS}
        deliveryTodayCutoff={CONFIG.DELIVERY_TODAY_CUTOFF}
      />

      {/* 5. Sticky Search & Categories Controls Panel */}
      <div className="lp-sticky-controls-panel">
        <div className="lp-container">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <CategoryFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>
      </div>

      {/* 6. Dynamic Products Catalog Section */}
      <section id="products" className="lp-section-padding lp-catalog-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-subtitle">Catalog Store</span>
            <h2 className="lp-section-title">🥛 All Products</h2>
            <div className="lp-title-underline" style={{ margin: "12px 0 0" }}></div>
          </div>

          <ProductGrid
            loadingProducts={loadingProducts}
            filteredProducts={filteredProducts}
            getProductQtyInCart={getProductQtyInCart}
            addToCart={addToCart}
            updateCartQty={updateCartQty}
            getProductImage={getProductImage}
            onProductClick={setSelectedProduct}
          />
        </div>
      </section>

      {/* 7. Trust perks banner */}
      <TrustSection />

      {/* 8. Modern Accessibility-friendly Footer */}
      <Footer businessHours={CONFIG.BUSINESS_HOURS} />

      {/* 9. Mobile Floating Bottom Cart Bar */}
      <FloatingCart
        cartCount={cartCount}
        cartTotal={cartTotal}
        setIsCartOpen={setIsCartOpen}
      />

      {/* --- CART SLIDE-OUT PANEL DRAWER --- */}
      {isCartOpen && (
        <div className="lp-modal-overlay show" onClick={() => setIsCartOpen(false)}>
          <div className="lp-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="lp-drawer-header">
              <h3>Shopping Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="close-drawer-btn">
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="lp-drawer-empty-state">
                <span className="lp-empty-emoji">🛒</span>
                <p>Your cart is empty.</p>
                <button onClick={() => setIsCartOpen(false)} className="lp-btn lp-btn-primary">
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="lp-drawer-items-list">
                  {cart.map((item) => {
                    const price = item.product.retailPrice || item.product.price || 0;
                    return (
                      <div className="lp-cart-item-row" key={item.product._id}>
                        <div className="item-img-container">
                          <img
                            src={getProductImage(item.product)}
                            alt={item.product.name}
                            onError={(e) => {
                              e.target.src = `${import.meta.env.VITE_BACKEND_URI}/uploads/defaults/Logo.jpg`;
                            }}
                          />
                        </div>
                        <div className="item-info">
                          <h5>{item.product.name}</h5>
                          <span className="item-price">₹{price}</span>
                        </div>
                        <div className="item-actions">
                          <div className="lp-quantity-selector sm">
                            <button onClick={() => updateCartQty(item.product._id, -1)} className="qty-btn">
                              <Minus size={12} />
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product._id, 1)} className="qty-btn">
                              <Plus size={12} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.product._id)} className="delete-item-btn" title="Remove Item">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="lp-drawer-summary-checkout">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee {cartSubtotal >= CONFIG.FREE_DELIVERY_AMOUNT && <span className="free-badge">FREE</span>}</span>
                    <span>{deliveryFee === 0 ? "₹0" : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total Amount</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {cartSubtotal < CONFIG.MIN_ORDER_AMOUNT ? (
                    <div className="free-delivery-nudge invalid">
                      Minimum order to checkout is <strong>₹{CONFIG.MIN_ORDER_AMOUNT}</strong>. Add <strong>₹{CONFIG.MIN_ORDER_AMOUNT - cartSubtotal}</strong> more!
                    </div>
                  ) : cartSubtotal < CONFIG.FREE_DELIVERY_AMOUNT ? (
                    <div className="free-delivery-nudge">
                      Add <strong>₹{CONFIG.FREE_DELIVERY_AMOUNT - cartSubtotal}</strong> more for <strong>FREE delivery</strong>!
                    </div>
                  ) : null}

                  <button
                    onClick={() => {
                      if (cartSubtotal < CONFIG.MIN_ORDER_AMOUNT) {
                        showError(`Minimum order amount of ₹${CONFIG.MIN_ORDER_AMOUNT} required.`);
                        return;
                      }
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    disabled={cartSubtotal < CONFIG.MIN_ORDER_AMOUNT}
                    className={`lp-btn lp-btn-primary checkout-action-btn ${cartSubtotal < CONFIG.MIN_ORDER_AMOUNT ? "lp-btn-disabled" : ""}`}
                  >
                    Proceed to Checkout <ArrowRight size={16} style={{ marginLeft: "6px" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- CHECKOUT & IDENTITY DRAWER --- */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onGoBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
        customerToken={customerToken}
        customerInfo={customerInfo}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        otp={otp}
        setOtp={setOtp}
        otpSent={otpSent}
        setOtpSent={setOtpSent}
        otpVerifying={otpVerifying}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
        handlePlaceOrder={handlePlaceOrder}
        addresses={addresses}
        selectedAddressIndex={selectedAddressIndex}
        setSelectedAddressIndex={setSelectedAddressIndex}
        newAddress={newAddress}
        setNewAddress={setNewAddress}
        deliveryNotes={deliveryNotes}
        setDeliveryNotes={setDeliveryNotes}
        cartSubtotal={cartSubtotal}
        deliveryFee={deliveryFee}
        cartTotal={cartTotal}
        isSubmittingOrder={isSubmittingOrder}
        placedOrder={placedOrder}
        setPlacedOrder={setPlacedOrder}
      />

      {/* --- PRODUCT DETAILS POPUP MODAL --- */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          cartQty={getProductQtyInCart(selectedProduct._id)}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
          getProductImage={getProductImage}
          onClose={() => setSelectedProduct(null)}
        />
      )}


    </div>
  );
};

export default LandingPage;
