import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle,
  ArrowUp,
} from "lucide-react";
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
import durgaRaoImg from "../assets/DURGA_RAO_YARRAMSETTI.jpeg";
import maniKondaImg from "../assets/MANI_KONDA_SWAMY_YARRAMSETTI.PNG";

// Configuration Constants
const CONFIG = {
  MIN_ORDER_AMOUNT: 200,
  FREE_DELIVERY_AMOUNT: 500,
  DELIVERY_CHARGE: 20,
  DELIVERY_LOCATION_DEFAULT: null, // "Select Delivery Location"
  BUSINESS_HOURS: "10:00 AM - 8:00 PM",
  DELIVERY_TODAY_CUTOFF: "7:00 PM",
};

const CATEGORY_FILTERS = [
  { id: "all", label: "All Products" },
  { id: "cheese", label: "Cheese" },
  { id: "cream", label: "Cream" },
  { id: "flavoured-milk", label: "Flavoured Milk" },
  { id: "ghee", label: "Ghee" },
  { id: "ice-cream", label: "Ice Cream" },
  { id: "lassi", label: "Lassi" },
  { id: "milk", label: "Milk" },
  { id: "paneer", label: "Paneer" },
  { id: "sweets", label: "Sweets" },
  { id: "yogurt", label: "Yogurt" },
];

const normalizeCategoryKey = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const LandingPage = () => {
  const { user } = useAuth(); // Admin/Accountant user if logged in
  const { showSuccess, showError, showInfo } = useToast();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [showScrollCatalog, setShowScrollCatalog] = useState(false);
  const [tempOtp, setTempOtp] = useState(""); // [TESTING ONLY] Temporary OTP placeholder state

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
  const [isRegistered, setIsRegistered] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

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
  const [checkoutSessionKey, setCheckoutSessionKey] = useState(0);

  useEffect(() => {
    if (placedOrder && cart.length > 0) {
      setPlacedOrder(null);
    }
  }, [cart, placedOrder]);

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
      const scrollPositionVal = window.scrollY;
      setScrolled(scrollPositionVal > 50);

      const productsElement = document.getElementById("products");
      if (productsElement) {
        const endOfProducts = productsElement.offsetTop + productsElement.offsetHeight;
        setShowScrollCatalog(scrollPositionVal > endOfProducts - 250);
      } else {
        setShowScrollCatalog(scrollPositionVal > 800);
      }

      const sections = ["home", "products"];
      const scrollPosition = scrollPositionVal + 120; // Offset

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
        const data = await customerService.getShopProducts({
          productType: "retail",
          limit: 100,
        });
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
            localStorage.setItem(
              "customer_info",
              JSON.stringify(data.customer),
            );

            // Populate address list
            const savedAddrs = data.customer.addresses || [];
            setAddresses(savedAddrs);
            if (savedAddrs.length > 0) {
              const defaultIdx = savedAddrs.findIndex((a) => a.isDefault);
              setSelectedAddressIndex(defaultIdx !== -1 ? defaultIdx : 0);
            }

            setCustomerName(data.customer.customerName || "");
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
  const addToCart = useCallback(
    (product) => {
      const existing = cart.find((item) => item.product._id === product._id);
      if (existing) {
        if (
          product.stock !== undefined &&
          existing.quantity >= product.stock
        ) {
          showError(`Only ${product.stock} items available in stock.`);
          return;
        }
        showSuccess(`Increased ${product.name} quantity.`);
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        if (product.stock !== undefined && product.stock <= 0) {
          showError("Out of stock.");
          return;
        }
        showSuccess(`Added ${product.name} to cart.`);
        setCart((prevCart) => [...prevCart, { product, quantity: 1 }]);
      }
    },
    [cart, showError, showSuccess],
  );

  const updateCartQty = useCallback(
    (productId, amount) => {
      const existing = cart.find((item) => item.product._id === productId);
      if (!existing) return;

      const nextQty = existing.quantity + amount;
      if (nextQty <= 0) {
        setCart((prevCart) =>
          prevCart.filter((item) => item.product._id !== productId),
        );
        showInfo("Removed item from cart.");
        return;
      }

      if (
        existing.product.stock !== undefined &&
        nextQty > existing.product.stock
      ) {
        showError(
          `Only ${existing.product.stock} items available in stock.`,
        );
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: nextQty }
            : item,
        ),
      );
    },
    [cart, showError, showInfo],
  );

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product._id !== productId),
    );
    showInfo("Removed item from cart.");
  };

  const getProductQtyInCart = useCallback(
    (productId) => {
      const item = cart.find((i) => i.product._id === productId);
      return item ? item.quantity : 0;
    },
    [cart],
  );

  // --- Calculation Helpers ---
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.product.retailPrice || item.product.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee =
    cartSubtotal >= CONFIG.FREE_DELIVERY_AMOUNT || cartSubtotal === 0
      ? 0
      : CONFIG.DELIVERY_CHARGE;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- Customer Login/OTP Flow ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    console.log("[Checkout Debug] handleSendOtp executed", {
      button: "Verify Mobile via OTP",
      customerName,
      customerPhone,
    });
    if (
      !customerPhone ||
      customerPhone.length !== 10 ||
      !/^\d+$/.test(customerPhone)
    ) {
      showError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setOtpVerifying(true);
      // [TESTING ONLY] Retrieve response containing the generated OTP
      const res = await customerService.sendOtp(customerPhone);
      setOtpSent(true);

      // Check registration status from backend response
      if (res && res.hasOwnProperty("isRegistered")) {
        setIsRegistered(res.isRegistered);
      } else {
        setIsRegistered(true);
      }

      // [TESTING ONLY] Save generated OTP to display next to the field
      if (res && res.otp) {
        setTempOtp(res.otp);
      }
      showSuccess("OTP sent successfully. Check your mobile verification step!");
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    console.log("[Checkout Debug] handleVerifyOtp executed", {
      button: "Confirm OTP & Log In",
      customerPhone,
      otp,
    });
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      showError("Please enter the 6-digit OTP");
      return;
    }

    if (!isRegistered && !customerName.trim()) {
      showError("Please enter your name");
      return;
    }

    try {
      setOtpVerifying(true);
      const data = await customerService.verifyOtp(
        customerPhone,
        customerName,
        otp,
      );
      if (data && data.token) {
        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_info", JSON.stringify(data.customer));
        setCustomerToken(data.token);
        setCustomerInfo(data.customer);
        setAddresses(data.customer.addresses || []);
        if (data.customer.addresses?.length > 0) {
          setSelectedAddressIndex(0);
        }

        setCustomerName(data.customer.customerName || "");

        showSuccess("Authenticated successfully!");
      }
    } catch (err) {
      console.error(err);
      showError(
        err.response?.data?.message || "OTP verification failed. Check again.",
      );
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
    setCustomerName("");
    setOtp("");
    setOtpSent(false);
    setIsRegistered(true);
    showInfo("Logged out of customer session.");
  };

  // --- Place Order Logic ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    console.log("[Checkout Debug] handlePlaceOrder executed", {
      customerToken,
      placedOrder,
      selectedAddressIndex,
      addresses,
      newAddress,
      deliveryNotes,
      isSubmittingOrder,
      button: "Confirm COD Order",
      cartItems: cart.length,
    });
    if (cart.length === 0) {
      showError("Your cart is empty.");
      console.log("[Checkout Debug] handlePlaceOrder aborted: cart is empty");
      return;
    }

    if (!customerName.trim()) {
      showError("Please enter your name.");
      console.log("[Checkout Debug] handlePlaceOrder aborted: name missing");
      return;
    }

    let addressPayload = {};
    if (selectedAddressIndex !== -1 && addresses[selectedAddressIndex]) {
      addressPayload = addresses[selectedAddressIndex];
    } else {
      if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
        showError("Please fill in all address details (Street, City, Pincode)");
        console.log(
          "[Checkout Debug] handlePlaceOrder aborted: incomplete address",
        );
        return;
      }
      addressPayload = newAddress;
    }

    console.log("step 1");
    try {
      console.log("step 2");
      setIsSubmittingOrder(true);
      console.log("step 3");
      const orderPayload = {
        products: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        address: addressPayload,
        paymentMethod: "COD",
        notes: deliveryNotes || "",
      };

      console.log("step 4", orderPayload);
      const response = await customerService.placeOrder(orderPayload);
      console.log("step 5", response);
      if (response && response.order) {
        console.log("step 6", response.order);
        setPlacedOrder(response.order);
        console.log("step 7");
        setCart([]); // Clear cart
        console.log("step 8");
        setIsCartOpen(false);
        showSuccess("Order placed successfully!");
        console.log("step 9");

        // Refresh customer profile to sync addresses
        const profileData = await customerService.getProfile();
        if (profileData && profileData.customer) {
          setCustomerInfo(profileData.customer);
          localStorage.setItem(
            "customer_info",
            JSON.stringify(profileData.customer),
          );
          setAddresses(profileData.customer.addresses || []);
          setCustomerName(profileData.customer.customerName || "");
        }
      }
      console.log("step 10");
    } catch (err) {
      console.error("Order error:", err);
      showError(err.response?.data?.message || "Failed to place order.");
    } finally {
      console.log("step finally");
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
    const productName = prod.name?.toLowerCase?.() || "";
    const productCategory = prod.category?.toLowerCase?.() || "";
    const normalizedProductCategory = normalizeCategoryKey(prod.category);
    const normalizedActiveFilter = normalizeCategoryKey(activeFilter);

    const matchesSearch =
      productName.includes(searchQuery.toLowerCase()) ||
      productCategory.includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    return (
      matchesSearch && normalizedProductCategory === normalizedActiveFilter
    );
  });

  const handleProceedToCheckout = () => {
    console.log("[Checkout Debug] handleProceedToCheckout executed", {
      isSubmittingOrder,
      addresses,
      selectedAddressIndex,
      cart,
      button: "Proceed to Checkout",
      cartSubtotal,
      cartCount,
      customerToken: !!customerToken,
      placedOrder: !!placedOrder,
    });
    if (cartSubtotal < CONFIG.MIN_ORDER_AMOUNT) {
      showError(
        `Minimum order amount of ₹${CONFIG.MIN_ORDER_AMOUNT} required.`,
      );
      return;
    }

    if (placedOrder) {
      setPlacedOrder(null);
    }

    setOtp("");
    setOtpSent(false);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setCheckoutSessionKey((current) => current + 1);

    setIsCheckoutOpen(true);
  };
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-page-root">
      {/* 1. Header Navigation */}
      <Header
        user={user}
        customerToken={customerToken}
        cartCount={cartCount}
        handleCustomerLogout={handleCustomerLogout}
        setIsCartOpen={setIsCartOpen}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* 2. Sticky Delivery Location Placeholder Bar */}
      {/* <div className="lp-location-banner-bar">
        <div className="lp-container lp-location-flex">
          <span className="lp-location-text">📍 Select Delivery Location</span>
          <button
            className="lp-location-change-btn"
            onClick={() =>
              showInfo(
                "GPS location tracking will be available in future releases.",
              )
            }>
            Change Location
          </button>
        </div>
      </div> */}

      <div className={`background-non-click ${menuOpen ? "disabled" : ""}`}>
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
              filters={CATEGORY_FILTERS}
            />
          </div>
        </div>

        {/* 6. Dynamic Products Catalog Section */}
        <section id="products" className="lp-section-padding lp-catalog-section">
          <div className="lp-container">
            <div className="lp-section-header">
              <span className="lp-section-subtitle">Catalog Store</span>
              <h2 className="lp-section-title">🥛 All Products</h2>
              <div
                className="lp-title-underline"
                style={{ margin: "12px 0 0" }}>
              </div>
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

        {/* 7. Why Choose SLG Milk Dairys? & Our Andhra Heritage Section */}
        <section id="why-choose" className="lp-why-choose-section">
          <div className="lp-container">
            <div className="lp-section-header lp-text-center">
              <span className="lp-section-subtitle">Why SLG?</span>
              <h2 className="lp-section-title">🥛 Why Choose SLG Milk Dairys?</h2>
              <div className="lp-title-underline"></div>
            </div>

            <div className="lp-why-choose-grid">
              <div className="lp-why-choose-card">
                <div className="lp-why-choose-icon-wrapper">
                  <span style={{ fontSize: "1.5rem" }}>🌿</span>
                </div>
                <h4>Traditional Purity</h4>
                <p>Sourced from local dairy farms, preserving the genuine taste of fresh cow and buffalo milk.</p>
              </div>

              <div className="lp-why-choose-card">
                <div className="lp-why-choose-icon-wrapper">
                  <span style={{ fontSize: "1.5rem" }}>🔬</span>
                </div>
                <h4>Hygienic Processing</h4>
                <p>Pasteurized and chilled in state-of-the-art facilities under strict sanitization standards.</p>
              </div>

              <div className="lp-why-choose-card">
                <div className="lp-why-choose-icon-wrapper">
                  <span style={{ fontSize: "1.5rem" }}>❄️</span>
                </div>
                <h4>Secure Cold-Chain</h4>
                <p>Maintained under optimal low temperatures from farm to delivery to prevent spoilage.</p>
              </div>

              <div className="lp-why-choose-card">
                <div className="lp-why-choose-icon-wrapper">
                  <span style={{ fontSize: "1.5rem" }}>🚀</span>
                </div>
                <h4>Reliable Local Delivery</h4>
                <p>Quick doorstep delivery within 30-45 minutes by our dedicated coordinators.</p>
              </div>
            </div>

            {/* Our Andhra Heritage */}
            <div className="lp-heritage-grid">
              <div className="lp-heritage-text-col">
                <h3>Our Andhra Heritage</h3>
                <p>
                  At Sri Lakshmi Ganapathi Milk Dairys, we carry forward a heritage of dairy perfection. Rooted in the heart of East Godavari, Andhra Pradesh, we cherish the traditional methods of milk distribution.
                </p>
                <p className="quote">
                  "Every packet is a promise of health, freshness, and authentic rich taste that connects Telugu families and food lovers."
                </p>
                <p>
                  Partnered proudly with Visakha Dairy, we ensure that every household receives cold-chain milk and dairy sweets prepared under strict hygienic controls using select local processes.
                </p>
              </div>
              <div className="lp-heritage-img-col">
                <img 
                  src="/heritage_dairy.png" 
                  alt="Our Andhra Heritage" 
                  className="lp-heritage-img"
                  onError={(e) => {
                    e.target.src = "/hero_bg.png"; // Fallback
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Leadership Team Section */}
        <section id="leadership" className="lp-leadership-section">
          <div className="lp-container">
            <div className="lp-section-header lp-text-center">
              <span className="lp-section-subtitle">Our Leadership</span>
              <h2 className="lp-section-title">Pillars of SLG Milk Dairys</h2>
              <div className="lp-title-underline"></div>
            </div>

            <div className="lp-leadership-grid">
              
              {/* Card 1: Durga Rao Yarramsetti */}
              <div className="lp-leader-card">
                <div className="lp-leader-img-wrapper">
                  <img 
                    src={durgaRaoImg} 
                    alt="DURGA RAO YARRAMSETTI" 
                    className="lp-leader-img"
                  />
                </div>
                <div className="lp-leader-info">
                  <h3>DURGA RAO YARRAMSETTI</h3>
                  <span className="lp-leader-role">FOUNDER OF SLG MILK DAIRYS</span>
                  <p className="lp-leader-quote">
                    "Serving the community with purity and absolute commitment to quality since 2005."
                  </p>
                  <p className="lp-leader-desc">
                    Durga Rao Yarramsetti established Sri Lakshmi Ganapathi Milk Dairys with a steadfast vision to deliver fresh, pure, and wholesome milk directly to households. His initial steps laid the firm foundations of quality and trust that define our brand values today.
                  </p>
                </div>
              </div>

              {/* Card 2: Mani Konda Swamy Yarramsetti */}
              <div className="lp-leader-card">
                <div className="lp-leader-img-wrapper">
                  <img 
                    src={maniKondaImg} 
                    alt="MANI KONDA SWAMY YARRAMSETTI" 
                    className="lp-leader-img"
                  />
                </div>
                <div className="lp-leader-info">
                  <h3>MANI KONDA SWAMY YARRAMSETTI</h3>
                  <span className="lp-leader-role">MANAGING DIRECTOR FOR SLG MILK DAIRYS</span>
                  <p className="lp-leader-quote">
                    "Integrating cold-chain logistics and modern supply links to serve every customer reliably."
                  </p>
                  <p className="lp-leader-desc">
                    Mani Konda Swamy Yarramsetti drives the operations, network expansion, and business relationships for SLG Milk Dairys. Under his active management, we have modernized our cold storage and distribution logistics, ensuring fresh dairy products arrive on time, every time.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 8. How to Order Section */}
        <section id="how-to-order" className="lp-order-flow-section">
          <div className="lp-container">
            <div className="lp-section-header lp-text-center">
              <span className="lp-section-subtitle">Easy Steps</span>
              <h2 className="lp-section-title">📦 How to Order</h2>
              <div className="lp-title-underline"></div>
            </div>

            <div className="lp-order-flow-stepper">
              <div className="lp-order-step">
                <div className="lp-step-number-dot">1</div>
                <div className="lp-step-content">
                  <h4>Choose Dairy Items</h4>
                  <p>Browse our rich catalog of pasteurized milk, fresh curd, ghee, paneer, and sweets.</p>
                </div>
              </div>

              <div className="lp-order-step">
                <div className="lp-step-number-dot">2</div>
                <div className="lp-step-content">
                  <h4>Add to Cart</h4>
                  <p>Add products to your cart. Note: The minimum order amount for delivery is just ₹100.</p>
                </div>
              </div>

              <div className="lp-order-step">
                <div className="lp-step-number-dot">3</div>
                <div className="lp-step-content">
                  <h4>Enter Address & Mobile</h4>
                  <p>Fill in your delivery details and verify your mobile number with a quick OTP.</p>
                </div>
              </div>

              <div className="lp-order-step">
                <div className="lp-step-number-dot">4</div>
                <div className="lp-step-content">
                  <h4>Confirm Order (COD)</h4>
                  <p>Review details, choose Cash on Delivery (COD) as payment, and place your order.</p>
                </div>
              </div>

              <div className="lp-order-step">
                <div className="lp-step-number-dot">5</div>
                <div className="lp-step-content">
                  <h4>Receive Chilled Delivery</h4>
                  <p>Our delivery boy will arrive at your door with fresh, cold-chain dairy within 30-45 minutes!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. What Our Customers Say Section */}
        <section id="testimonials" className="lp-testimonials-section">
          <div className="lp-container">
            <div className="lp-section-header lp-text-center">
              <span className="lp-section-subtitle">Reviews</span>
              <h2 className="lp-section-title">💬 What Our Customers Say</h2>
              <div className="lp-title-underline"></div>
            </div>

            <div className="lp-testimonials-grid">
              <div className="lp-testimonial-card">
                <div className="lp-stars">★★★★★</div>
                <p className="lp-testimonial-quote">
                  "The Visakha Premium Gold Milk is extremely thick and perfect for making tea and coffee. The delivery is always on time, right at 6 AM!"
                </p>
                <div className="lp-testimonial-author">
                  <div className="lp-reviewer-avatar">S</div>
                  <div className="lp-reviewer-info">
                    <span className="lp-reviewer-name">Srinivas Rao</span>
                    <span className="lp-reviewer-location">Tea Stall Owner, Ravulapalem</span>
                  </div>
                </div>
              </div>

              <div className="lp-testimonial-card">
                <div className="lp-stars">★★★★★</div>
                <p className="lp-testimonial-quote">
                  "Ordered fresh curd packets and paneer for a family gathering in P.Gannavaram. The curd was thick and paneer was melt-in-mouth soft. Excellent service!"
                </p>
                <div className="lp-testimonial-author">
                  <div className="lp-reviewer-avatar">K</div>
                  <div className="lp-reviewer-info">
                    <span className="lp-reviewer-name">Kalyani P.</span>
                    <span className="lp-reviewer-location">Home Maker, P.Gannavaram</span>
                  </div>
                </div>
              </div>

              <div className="lp-testimonial-card">
                <div className="lp-stars">★★★★★</div>
                <p className="lp-testimonial-quote">
                  "Clean packaging, hygienic storage, and super fast doorstep delivery. My kids love their flavoured milk and sweets. Highly recommended for daily needs!"
                </p>
                <div className="lp-testimonial-author">
                  <div className="lp-reviewer-avatar">R</div>
                  <div className="lp-reviewer-info">
                    <span className="lp-reviewer-name">Rajesh Kumar</span>
                    <span className="lp-reviewer-location">Customer, Amalapuram</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Frequently Asked Questions Section */}
        <section id="faqs" className="lp-faq-section">
          <div className="lp-container">
            <div className="lp-section-header lp-text-center">
              <span className="lp-section-subtitle">Got Questions?</span>
              <h2 className="lp-section-title">❓ Frequently Asked Questions</h2>
              <div className="lp-title-underline"></div>
            </div>

            <div className="lp-faq-list">
              {[
                {
                  q: "What is the minimum order quantity for delivery?",
                  a: "The minimum order amount to qualify for home delivery is just ₹100. There is no minimum quantity requirement as long as the subtotal is at or above ₹100."
                },
                {
                  q: "What areas do you deliver to?",
                  a: "We currently deliver to residential homes, hotels, and retail shops across Patha Gannavaram, P.Gannavaram, and surrounding local neighborhoods in East Godavari."
                },
                {
                  q: "Are the dairy products preservative-free?",
                  a: "Yes! All milk, curd, ghee, and sweets are sourced directly from Visakha Dairy, processed using high quality pasteurization standards without any harmful added preservatives or synthetic colors."
                },
                {
                  q: "How do I place bulk orders for functions?",
                  a: "For bulk bookings (such as marriages, ceremonies, or large restaurant orders), you can contact our coordinator Swamy directly at +91 99666 75377 or click the WhatsApp button to chat."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept Cash on Delivery (COD) as our primary payment method. Our delivery coordinators also accept direct UPI payments (PhonePe, Google Pay, Paytm) upon arrival."
                },
                {
                  q: "How long does the delivery take?",
                  a: "Deliveries are dispatched quickly from our P.Gannavaram hub and typically take between 30 to 45 minutes to reach your location under full cold-chain protection."
                }
              ].map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`lp-faq-item ${activeFaq === idx ? "active" : ""}`}
                >
                  <button 
                    type="button"
                    className="lp-faq-question-btn"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  >
                    <h4>{faq.q}</h4>
                    <span className="lp-faq-icon">▼</span>
                  </button>
                  <div className="lp-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Trust perks banner */}
        <TrustSection />

        {/* 12. Modern Accessibility-friendly Footer */}
        <Footer businessHours={CONFIG.BUSINESS_HOURS} />
      </div>

      {/* 9. Mobile Floating Bottom Cart Bar */}
      <FloatingCart
        cartCount={cartCount}
        cartTotal={cartTotal}
        setIsCartOpen={setIsCartOpen}
      />

      {showScrollCatalog && (
        <a
          href="#products"
          className="lp-floating-catalog-btn"
          aria-label="Back to Catalog Store"
          title="Back to Catalog Store"
        >
          <ArrowUp size={20} />
          <span className="lp-floating-catalog-text">Store Catalog</span>
        </a>
      )}

      {/* --- CART SLIDE-OUT PANEL DRAWER --- */}
      {isCartOpen && (
        <div
          className="lp-modal-overlay show"
          onClick={() => setIsCartOpen(false)}>
          <div className="lp-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="lp-drawer-header">
              <h3>Shopping Cart</h3>
              <button
                onClick={() => {
                  console.log(
                    "[Checkout Debug] cart drawer close clicked -> setIsCartOpen(false)",
                  );
                  setIsCartOpen(false);
                }}
                className="close-drawer-btn">
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="lp-drawer-empty-state">
                <span className="lp-empty-emoji">🛒</span>
                <p>Your cart is empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="lp-btn lp-btn-primary">
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="lp-drawer-items-list">
                  {cart.map((item) => {
                    const price =
                      item.product.retailPrice || item.product.price || 0;
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
                            <button
                              onClick={() =>
                                updateCartQty(item.product._id, -1)
                              }
                              className="qty-btn">
                              <Minus size={12} />
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.product._id, 1)}
                              className="qty-btn">
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="delete-item-btn"
                            title="Remove Item">
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
                    <span>
                      Delivery Fee{" "}
                      {cartSubtotal >= CONFIG.FREE_DELIVERY_AMOUNT && (
                        <span className="free-badge">FREE</span>
                      )}
                    </span>
                    <span>{deliveryFee === 0 ? "₹0" : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total Amount</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {cartSubtotal < CONFIG.MIN_ORDER_AMOUNT ? (
                    <div className="free-delivery-nudge invalid">
                      Minimum order to checkout is{" "}
                      <strong>₹{CONFIG.MIN_ORDER_AMOUNT}</strong>. Add{" "}
                      <strong>₹{CONFIG.MIN_ORDER_AMOUNT - cartSubtotal}</strong>{" "}
                      more!
                    </div>
                  ) : cartSubtotal < CONFIG.FREE_DELIVERY_AMOUNT ? (
                    <div className="free-delivery-nudge">
                      Add{" "}
                      <strong>
                        ₹{CONFIG.FREE_DELIVERY_AMOUNT - cartSubtotal}
                      </strong>{" "}
                      more for <strong>FREE delivery</strong>!
                    </div>
                  ) : null}

                  <button
                    onClick={handleProceedToCheckout}
                    disabled={cartSubtotal < CONFIG.MIN_ORDER_AMOUNT}
                    className={`lp-btn lp-btn-primary checkout-action-btn ${cartSubtotal < CONFIG.MIN_ORDER_AMOUNT ? "lp-btn-disabled" : ""}`}>
                    Proceed to Checkout{" "}
                    <ArrowRight size={16} style={{ marginLeft: "6px" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- CHECKOUT & IDENTITY DRAWER --- */}
      <CheckoutDrawer
        key={checkoutSessionKey}
        isOpen={isCheckoutOpen}
        onClose={() => {
          console.log(
            "[Checkout Debug] checkout drawer close -> setIsCheckoutOpen(false)",
          );
          setIsCheckoutOpen(false);
        }}
        onGoBackToCart={() => {
          console.log(
            "[Checkout Debug] onGoBackToCart executed -> return to cart drawer",
          );
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
        isRegistered={isRegistered}
        otpVerifying={otpVerifying}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
        tempOtp={tempOtp}
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
