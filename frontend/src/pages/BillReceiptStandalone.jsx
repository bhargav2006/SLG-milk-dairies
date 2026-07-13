import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import billService from "../services/billService";
import { TableSkeleton } from "../components/common/Skeleton";
import { Milk, Printer, ArrowLeft } from "lucide-react";

const BillReceiptStandalone = () => {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { isAuthenticated } = useAuth();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const data = await billService.getBillById(invoiceNumber);
        setBill(data);
      } catch (err) {
        console.error("Error loading standalone invoice:", err);
        showError("Failed to load invoice receipt. Verify URL.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber, showError]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div
        style={{ maxWidth: "600px", margin: "60px auto", padding: "0 20px" }}
      >
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!bill) {
    return (
      <div
        style={{
          textAlign: "center",
          margin: "100px auto",
          maxWidth: "400px",
          padding: "0 20px",
        }}
      >
        <h2 style={{ color: "var(--color-danger)" }}>Receipt Not Found</h2>
        <p
          style={{
            margin: "12px 0 24px 0",
            color: "var(--color-text-secondary)",
          }}
        >
          The requested billing statement could not be resolved from the
          records.
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
          className="btn btn-primary"
        >
          {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      {/* Standalone Control buttons */}
      <div
        className="no-print"
        style={{
          maxWidth: "650px",
          margin: "0 auto 16px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isAuthenticated ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={16} />
            Go to Dashboard
          </button>
        ) : (
          <div style={{ width: "1px" }} />
        )}

        <button
          onClick={handlePrint}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      {/* Invoice receipt container formatted as paper slip */}
      <div
        className="card-panel"
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          padding: "40px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div
          className="print-invoice-sheet"
          style={{
            fontFamily: "var(--font-family)",
            color: "var(--color-text-primary)",
          }}
        >
          {/* Store Receipt Header */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid var(--color-border)",
              paddingBottom: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              <img
                src="/logo.png"
                alt="SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY Logo"
                style={{
                  width: "64px",
                  height: "64px",
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
              />
            </div>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              VISAKHA DAIRY 🥛 | WHOLESALE MARKET ✨ | SINCE 2005❤️
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginTop: "4px",
              }}
            >
              Retail & Wholesale
            </p>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                marginTop: "8px",
                borderTop: "1px dashed var(--color-border)",
                paddingTop: "8px",
              }}
            >
              <strong>Branches:</strong>
              <br />
              1) Near SBI, opposite P.Gannavaram 🔥
              <br />
              2) Honda Showroom, opposite Pothavaram 😍
            </div>
          </div>

          {/* Bill Meta Details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
              fontSize: "0.875rem",
            }}
          >
            <div>
              <p style={{ marginBottom: "4px" }}>
                <strong>Invoice Number:</strong> {bill.invoiceNumber || "N/A"}
              </p>
              <p style={{ marginBottom: "4px" }}>
                <strong>Bill Type:</strong>{" "}
                <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                  {bill.billType || "retail"}
                </span>
              </p>
              <p>
                <strong>Customer Phone:</strong>{" "}
                {bill.customerNumber || "Not Available"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ marginBottom: "4px" }}>
                <strong>Date:</strong>{" "}
                {new Date(bill.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>Accountant:</strong>{" "}
                {bill.accountant?.name || "Deleted Staff"}
              </p>
            </div>
          </div>

          {/* Invoice Products list table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
              marginBottom: "24px",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1.5px solid var(--color-text-primary)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "8px 0" }}>Product Name</th>
                <th style={{ padding: "8px 0", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>
                  Unit Price
                </th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.products &&
                bill.products.map((item, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td style={{ padding: "10px 0" }}>
                      {item.product?.name || "Deleted Product"}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "center" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      ₹{(item.product?.price || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Invoice Calculations Subtotal & Grand Total */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
              fontSize: "0.9rem",
              borderTop: "2px solid var(--color-border)",
              paddingTop: "16px",
            }}
          >
            <div>
              <span>Subtotal: </span>
              <span
                style={{
                  width: "100px",
                  display: "inline-block",
                  textAlign: "right",
                  fontWeight: 500,
                }}
              >
                ₹{bill.totalAmount.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              <span>Grand Total: </span>
              <span
                style={{
                  width: "120px",
                  display: "inline-block",
                  textAlign: "right",
                  color: "var(--color-primary)",
                }}
              >
                ₹{bill.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment receipt footer details */}
          <div
            style={{
              marginTop: "32px",
              borderTop: "1px dashed var(--color-border)",
              paddingTop: "16px",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <p>
              Payment Mode:{" "}
              <strong
                style={{
                  textTransform: "uppercase",
                  color: "var(--color-text-primary)",
                }}
              >
                {bill.paymentMethod}
              </strong>
            </p>
            <p style={{ marginTop: "10px" }}>
              Thank you for shopping at SRI LAKSHMI GANAPATI MILKS VISAKHA DAIRY!
            </p>
            <p>Please visit us again.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillReceiptStandalone;
