import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Phone,
  Lock,
  Save,
  ShieldCheck,
  ArrowLeft,
  Plus,
  X,
  Ticket,
  Star,
  Copy,
  Check,
  FileText,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useNavigate, Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { apiFetch } from "../apiClient";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // 'info' or 'security'

  const [evouchers, setEvouchers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintForm, setComplaintForm] = useState({
    title: "",
    content: "",
    priority: "Normal",
    orderId: "",
    voucherIds: [],
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loadingComplaintDetail, setLoadingComplaintDetail] = useState(false);
  const [loadingEvouchers, setLoadingEvouchers] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedEVoucher, setSelectedEVoucher] = useState(null);

  // State cho Modal đánh giá
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedVoucherForReview, setSelectedVoucherForReview] =
    useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchCustomerEVouchers = async () => {
    setLoadingEvouchers(true);
    setError("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/orders/my-evouchers`);
      const data = await res.json();
      if (res.ok) {
        setEvouchers(data.evouchers || []);
      } else {
        setError(data.message || "Không thể tải danh sách E-Voucher");
      }
    } catch (err) {
      setError("Lỗi kết nối server khi tải E-Voucher");
    } finally {
      setLoadingEvouchers(false);
    }
  };

  const fetchOrders = async () => {
    const res = await apiFetch(`${API_BASE_URL}/api/orders/my-orders`);
    const data = await res.json();
    if (res.ok) setOrders(data.orders || []);
  };

  const fetchComplaints = async () => {
    const res = await apiFetch(`${API_BASE_URL}/api/complaints/my`);
    const data = await res.json();
    if (res.ok) setComplaints(data.complaints || []);
  };

  const fetchComplaintDetail = async (complaintId) => {
    setLoadingComplaintDetail(true);
    setError("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/complaints/${complaintId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedComplaint(data.complaint);
      } else {
        setError(data.message || "Không thể tải chi tiết khiếu nại");
      }
    } catch (err) {
      setError("Lỗi kết nối server khi tải chi tiết khiếu nại");
    } finally {
      setLoadingComplaintDetail(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await apiFetch(`${API_BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...complaintForm,
        orderId: complaintForm.orderId || null,
        voucherIds: complaintForm.voucherIds,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Gửi khiếu nại thành công!");
      setComplaintForm({
        title: "",
        content: "",
        priority: "Normal",
        orderId: "",
        voucherIds: [],
      });
      fetchComplaints();
    } else {
      setError(data.message || "Không thể gửi khiếu nại");
    }
  };

  useEffect(() => {
    if (activeTab === "evouchers") {
      fetchCustomerEVouchers();
    }
    if (activeTab === "orders") {
      fetchOrders();
    }
    if (activeTab === "complaints") {
      fetchComplaints();
      fetchOrders();
      fetchCustomerEVouchers();
    }
  }, [activeTab]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedVoucherForReview) return;
    if (rating === 0) {
      setReviewError("Vui lòng chọn số sao đánh giá (1-5)");
      return;
    }
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/orders/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherId: selectedVoucherForReview.voucher_id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewSuccess("Cảm ơn bạn đã gửi đánh giá!");
        fetchCustomerEVouchers();
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setSelectedVoucherForReview(null);
          setRating(0);
          setComment("");
        }, 1500);
      } else {
        setReviewError(data.message || "Gửi đánh giá thất bại");
      }
    } catch (err) {
      setReviewError("Lỗi kết nối tới máy chủ");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusStyles = (status, expiryDate) => {
    if (isExpired(expiryDate)) {
      return { background: "#fee2e2", color: "#ef4444" };
    }
    switch (status) {
      case "Unused":
        return { background: "#d1fae5", color: "#10b981" };
      case "Used":
        return { background: "#f1f5f9", color: "#64748b" };
      default:
        return { background: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusText = (status, expiryDate) => {
    if (isExpired(expiryDate)) {
      return "Hết hạn";
    }
    switch (status) {
      case "Unused":
        return "Chưa dùng";
      case "Used":
        return "Đã dùng";
      default:
        return status;
    }
  };

  const canShowEVoucherCode = (item) =>
    item?.status === "Unused" && !isExpired(item.expiry_date);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/profile`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        // Cập nhật email trong localStorage nếu có thay đổi
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.email = data.email;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } else {
        setError(data.message || "Không thể tải thông tin hồ sơ");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = () => {
    setProfile({
      ...profile,
      branches: [
        ...(profile.branches || []),
        { branch_name: "", address: "", phone: "" },
      ],
    });
  };

  const handleRemoveBranch = (index) => {
    const newBranches = profile.branches.filter((_, i) => i !== index);
    setProfile({ ...profile, branches: newBranches });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Cập nhật hồ sơ thành công!");
      } else {
        setError(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Đổi mật khẩu thành công!");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    }
  };

  if (loading)
    return (
      <div style={{ paddingTop: "150px", textAlign: "center" }}>
        Đang tải...
      </div>
    );

  if (!profile) {
    return (
      <div
        style={{
          paddingTop: "150px",
          paddingBottom: "100px",
          textAlign: "center",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <div className="container" style={{ maxWidth: "500px" }}>
          <div
            style={{
              background: "white",
              padding: "3rem",
              borderRadius: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <Lock size={32} color="#ef4444" />
            </div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "1rem",
              }}
            >
              Yêu cầu đăng nhập
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              {error ||
                "Vui lòng đăng nhập để xem và quản lý thông tin hồ sơ của bạn."}
            </p>
            <Link
              to="/auth"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                padding: "0.8rem 2rem",
              }}
            >
              Đăng nhập ngay{" "}
              <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: "180px",
        paddingBottom: "80px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <div className="container" style={{ position: "relative" }}>
        {/* Sidebar Tabs - Positioned absolute to stay on the left without shifting center content */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "250px",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "3rem",
          }}
        >
          <div style={{ padding: "0 1rem 1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Cài đặt</h2>
          </div>
          <button
            onClick={() => setActiveTab("info")}
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "info" ? "white" : "transparent",
              color:
                activeTab === "info" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: 700,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow:
                activeTab === "info" ? "0 4px 15px rgba(0,0,0,0.05)" : "none",
              transition: "0.3s",
              lineHeight: 1,
            }}
          >
            <User size={18} /> Thông tin cá nhân
          </button>

          {profile?.role === "Customer" && (
            <button
              onClick={() => setActiveTab("evouchers")}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                background: activeTab === "evouchers" ? "white" : "transparent",
                color:
                  activeTab === "evouchers"
                    ? "var(--primary)"
                    : "var(--text-muted)",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow:
                  activeTab === "evouchers"
                    ? "0 4px 15px rgba(0,0,0,0.05)"
                    : "none",
                transition: "0.3s",
                lineHeight: 1,
              }}
            >
              <Ticket size={18} /> Ví E-Voucher
            </button>
          )}

          {profile?.role === "Customer" && (
            <button
              onClick={() => setActiveTab("orders")}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                background: activeTab === "orders" ? "white" : "transparent",
                color:
                  activeTab === "orders"
                    ? "var(--primary)"
                    : "var(--text-muted)",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow:
                  activeTab === "orders"
                    ? "0 4px 15px rgba(0,0,0,0.05)"
                    : "none",
                transition: "0.3s",
                lineHeight: 1,
              }}
            >
              <FileText size={18} /> Đơn hàng
            </button>
          )}

          {profile?.role === "Customer" && (
            <button
              onClick={() => setActiveTab("complaints")}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                background:
                  activeTab === "complaints" ? "white" : "transparent",
                color:
                  activeTab === "complaints"
                    ? "var(--primary)"
                    : "var(--text-muted)",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow:
                  activeTab === "complaints"
                    ? "0 4px 15px rgba(0,0,0,0.05)"
                    : "none",
                transition: "0.3s",
                lineHeight: 1,
              }}
            >
              <MessageSquare size={18} /> Khiếu nại
            </button>
          )}

          {profile?.role === "Partner" && (
            <button
              onClick={() => setActiveTab("branches")}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                background: activeTab === "branches" ? "white" : "transparent",
                color:
                  activeTab === "branches"
                    ? "var(--primary)"
                    : "var(--text-muted)",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow:
                  activeTab === "branches"
                    ? "0 4px 15px rgba(0,0,0,0.05)"
                    : "none",
                transition: "0.3s",
                lineHeight: 1,
              }}
            >
              <MapPin size={18} /> Danh sách chi nhánh
            </button>
          )}

          <button
            onClick={() => setActiveTab("security")}
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "security" ? "white" : "transparent",
              color:
                activeTab === "security"
                  ? "var(--primary)"
                  : "var(--text-muted)",
              fontWeight: 700,
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow:
                activeTab === "security"
                  ? "0 4px 15px rgba(0,0,0,0.05)"
                  : "none",
              transition: "0.3s",
              lineHeight: 1,
            }}
          >
            <Lock size={18} /> Bảo mật
          </button>
        </div>

        {/* Main Content Area - Centered to match Navbar menu items */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center" }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
              }}
            >
              Hồ sơ của bạn
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Quản lý thông tin cá nhân và cài đặt bảo mật
            </p>
          </motion.div>

          <div
            style={{
              background: "white",
              padding: "2.5rem",
              borderRadius: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      marginBottom: "2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <User color="var(--primary)" /> Thông tin tài khoản
                  </h3>
                  <form
                    onSubmit={handleUpdateProfile}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Email
                      </label>
                      <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                          type="email"
                          value={profile.email || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          className="auth-input"
                          placeholder="Chưa cập nhật"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Số điện thoại
                      </label>
                      <div className="input-group">
                        <Phone size={18} className="input-icon" />
                        <input
                          type="text"
                          value={profile.phone || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          className="auth-input"
                          placeholder="Chưa cập nhật"
                        />
                      </div>
                    </div>

                    {profile.role === "Partner" ? (
                      <>
                        <div style={{ gridColumn: "span 2" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Tên doanh nghiệp
                          </label>
                          <div className="input-group">
                            <Building size={18} className="input-icon" />
                            <input
                              type="text"
                              value={profile.company_name}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  company_name: e.target.value,
                                })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Người đại diện
                          </label>
                          <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input
                              type="text"
                              value={profile.representative_name}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  representative_name: e.target.value,
                                })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Mã số thuế
                          </label>
                          <div className="input-group">
                            <Briefcase size={18} className="input-icon" />
                            <input
                              type="text"
                              value={profile.tax_id}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  tax_id: e.target.value,
                                })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Trụ sở chính
                          </label>
                          <div className="input-group">
                            <MapPin size={18} className="input-icon" />
                            <input
                              type="text"
                              value={profile.headquarters}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  headquarters: e.target.value,
                                })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ gridColumn: "span 2" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Họ và tên
                          </label>
                          <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input
                              type="text"
                              value={profile.full_name}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  full_name: e.target.value,
                                })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Ngày sinh
                          </label>
                          <div className="input-group">
                            <Calendar size={18} className="input-icon" />
                            <input
                              type="date"
                              value={
                                profile.dob ? profile.dob.split("T")[0] : ""
                              }
                              onChange={(e) =>
                                setProfile({ ...profile, dob: e.target.value })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            Địa chỉ
                          </label>
                          <div className="input-group">
                            <MapPin size={18} className="input-icon" />
                            <input
                              type="text"
                              value={profile.address}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  address: e.target.value,
                                })
                              }
                              className="auth-input"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                      {success && activeTab === "info" && (
                        <p
                          style={{
                            color: "#10b981",
                            marginBottom: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {success}
                        </p>
                      )}
                      {error && activeTab === "info" && (
                        <p
                          style={{
                            color: "#ef4444",
                            marginBottom: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {error}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          height: "50px",
                          padding: "0 2.5rem",
                          gap: "0.5rem",
                        }}
                      >
                        <Save size={18} /> Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      marginBottom: "2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <ShieldCheck color="var(--primary)" /> Bảo mật tài khoản
                  </h3>
                  <form
                    onSubmit={handleChangePassword}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Mật khẩu hiện tại
                      </label>
                      <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          value={passwords.oldPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              oldPassword: e.target.value,
                            })
                          }
                          className="auth-input"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Mật khẩu mới
                      </label>
                      <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          value={passwords.newPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              newPassword: e.target.value,
                            })
                          }
                          className="auth-input"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="auth-input"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      {error && activeTab === "security" && (
                        <p
                          style={{
                            color: "#ef4444",
                            marginBottom: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {error}
                        </p>
                      )}
                      {success && activeTab === "security" && (
                        <p
                          style={{
                            color: "#10b981",
                            marginBottom: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {success}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          height: "50px",
                          padding: "0 2.5rem",
                          gap: "0.5rem",
                        }}
                      >
                        <Save size={18} /> Đổi mật khẩu
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "branches" && profile?.role === "Partner" && (
                <motion.div
                  key="branches"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2rem",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          marginBottom: "0.5rem",
                        }}
                      >
                        Danh sách chi nhánh
                      </h3>
                      <p style={{ color: "#64748b" }}>
                        Quản lý các địa điểm kinh doanh của bạn trên hệ thống
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      className="btn-primary"
                      style={{
                        padding: "0 1.5rem",
                        height: "45px",
                        gap: "0.5rem",
                      }}
                    >
                      <Plus size={18} /> Thêm mới
                    </button>
                  </div>

                  <form
                    onSubmit={handleUpdateProfile}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100%, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      {profile.branches &&
                        profile.branches.map((branch, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "1.5rem",
                              background: "white",
                              borderRadius: "24px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                              position: "relative",
                              transition: "0.3s",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveBranch(index)}
                              style={{
                                position: "absolute",
                                top: "20px",
                                right: "20px",
                                border: "none",
                                background: "#fee2e2",
                                color: "#ef4444",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "0.3s",
                              }}
                            >
                              <X size={18} />
                            </button>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "1.5rem",
                              }}
                            >
                              <div style={{ gridColumn: "span 2" }}>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                  }}
                                >
                                  Tên chi nhánh
                                </label>
                                <div className="input-group">
                                  <Building size={18} className="input-icon" />
                                  <input
                                    type="text"
                                    value={branch.branch_name}
                                    onChange={(e) => {
                                      const newBranches = [...profile.branches];
                                      newBranches[index].branch_name =
                                        e.target.value;
                                      setProfile({
                                        ...profile,
                                        branches: newBranches,
                                      });
                                    }}
                                    className="auth-input"
                                    placeholder="Tên chi nhánh..."
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                  }}
                                >
                                  Địa chỉ
                                </label>
                                <div className="input-group">
                                  <MapPin size={18} className="input-icon" />
                                  <input
                                    type="text"
                                    value={branch.address}
                                    onChange={(e) => {
                                      const newBranches = [...profile.branches];
                                      newBranches[index].address =
                                        e.target.value;
                                      setProfile({
                                        ...profile,
                                        branches: newBranches,
                                      });
                                    }}
                                    className="auth-input"
                                    placeholder="Địa chỉ..."
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                  }}
                                >
                                  Số điện thoại
                                </label>
                                <div className="input-group">
                                  <Phone size={18} className="input-icon" />
                                  <input
                                    type="text"
                                    value={branch.phone}
                                    onChange={(e) => {
                                      const newBranches = [...profile.branches];
                                      newBranches[index].phone = e.target.value;
                                      setProfile({
                                        ...profile,
                                        branches: newBranches,
                                      });
                                    }}
                                    className="auth-input"
                                    placeholder="SĐT chi nhánh..."
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {profile.branches?.length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "3rem",
                          background: "#f8fafc",
                          borderRadius: "24px",
                          border: "2px dashed #e2e8f0",
                        }}
                      >
                        <MapPin
                          size={48}
                          color="#cbd5e1"
                          style={{ marginBottom: "1rem" }}
                        />
                        <p style={{ color: "#64748b", fontWeight: 600 }}>
                          Chưa có chi nhánh nào được đăng ký
                        </p>
                        <button
                          type="button"
                          onClick={handleAddBranch}
                          style={{
                            marginTop: "1rem",
                            color: "var(--primary)",
                            background: "none",
                            border: "none",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          + Thêm chi nhánh đầu tiên
                        </button>
                      </div>
                    )}

                    <div style={{ marginTop: "1rem" }}>
                      {success && activeTab === "branches" && (
                        <p
                          style={{
                            color: "#10b981",
                            marginBottom: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {success}
                        </p>
                      )}
                      {error && activeTab === "branches" && (
                        <p
                          style={{
                            color: "#ef4444",
                            marginBottom: "1rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          {error}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          height: "50px",
                          padding: "0 2.5rem",
                          gap: "0.5rem",
                        }}
                      >
                        <Save size={18} /> Lưu danh sách chi nhánh
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "evouchers" && profile?.role === "Customer" && (
                <motion.div
                  key="evouchers"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2rem",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          marginBottom: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <Ticket color="var(--primary)" /> Ví E-Voucher của bạn
                      </h3>
                      <p style={{ color: "#64748b" }}>
                        Quản lý và sử dụng các mã voucher đã mua của bạn
                      </p>
                    </div>
                  </div>

                  {loadingEvouchers ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                      <div
                        className="loader"
                        style={{ margin: "0 auto 1rem" }}
                      ></div>
                      <p style={{ color: "#64748b" }}>
                        Đang tải danh sách E-Voucher...
                      </p>
                    </div>
                  ) : evouchers.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                      }}
                    >
                      {evouchers.map((item, idx) => (
                        <div
                          key={idx}
                          role={canShowEVoucherCode(item) ? "button" : undefined}
                          tabIndex={canShowEVoucherCode(item) ? 0 : undefined}
                          onClick={() => {
                            if (canShowEVoucherCode(item)) {
                              setSelectedEVoucher(item);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              canShowEVoucherCode(item) &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              setSelectedEVoucher(item);
                            }
                          }}
                          style={{
                            display: "flex",
                            background: "#f8fafc",
                            borderRadius: "16px",
                            border: "1px dashed #cbd5e1",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                            overflow: "hidden",
                            position: "relative",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            minHeight: "130px",
                            cursor: canShowEVoucherCode(item)
                              ? "pointer"
                              : "default",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 10px 25px rgba(0,0,0,0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 20px rgba(0,0,0,0.02)";
                          }}
                        >
                          {/* Circular notches */}
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "-10px",
                              width: "20px",
                              height: "20px",
                              background: "#ffffff",
                              borderRadius: "50%",
                              transform: "translateY(-50%)",
                              zIndex: 1,
                              borderRight: "1px dashed #cbd5e1",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              right: "-10px",
                              width: "20px",
                              height: "20px",
                              background: "#ffffff",
                              borderRadius: "50%",
                              transform: "translateY(-50%)",
                              zIndex: 1,
                              borderLeft: "1px dashed #cbd5e1",
                            }}
                          />

                          {/* Voucher Image / Brand Section */}
                          <div
                            style={{
                              width: "120px",
                              minWidth: "120px",
                              position: "relative",
                              background: "#e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRight: "2px dashed #cbd5e1",
                            }}
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80";
                                }}
                              />
                            ) : (
                              <Ticket
                                size={36}
                                color="var(--primary)"
                                style={{ opacity: 0.3 }}
                              />
                            )}
                          </div>

                          {/* Voucher Details Section */}
                          <div
                            style={{
                              padding: "1.25rem",
                              flexGrow: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                              overflow: "hidden",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "0.5rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "180px",
                                  }}
                                >
                                  {item.company_name}
                                </span>
                                {/* Status Badge */}
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 800,
                                    padding: "0.2rem 0.6rem",
                                    borderRadius: "999px",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                    ...getStatusStyles(
                                      item.status,
                                      item.expiry_date,
                                    ),
                                  }}
                                >
                                  {getStatusText(item.status, item.expiry_date)}
                                </span>
                              </div>
                              <Link
                                to={`/voucher/${item.voucher_id}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{ textDecoration: "none" }}
                              >
                                <h4
                                  style={{
                                    fontSize: "0.95rem",
                                    fontWeight: 800,
                                    color: "#1e293b",
                                    margin: "0.25rem 0 0.5rem 0",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    height: "2.5rem",
                                    lineHeight: "1.25rem",
                                  }}
                                >
                                  {item.title}
                                </h4>
                              </Link>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.15rem",
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}
                              >
                                <div>
                                  Ngày mua:{" "}
                                  {new Date(
                                    item.purchase_date,
                                  ).toLocaleDateString("vi-VN")}
                                </div>
                                <div>
                                  Hạn dùng:{" "}
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: isExpired(item.expiry_date)
                                        ? "#ef4444"
                                        : "#64748b",
                                    }}
                                  >
                                    {new Date(
                                      item.expiry_date,
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Controls for Copy Code & Review */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginTop: "0.25rem",
                              }}
                            >
                              {canShowEVoucherCode(item) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEVoucher(item);
                                  }}
                                  style={{
                                    border: "1px solid #bfdbfe",
                                    background: "#eff6ff",
                                    color: "var(--primary)",
                                    fontWeight: 800,
                                    fontSize: "0.75rem",
                                    padding: "0.45rem 0.65rem",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <QrCode size={14} /> QR
                                </button>
                              )}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  background: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "8px",
                                  padding: "0.35rem 0.5rem",
                                  flexGrow: 1,
                                  justifyContent: "space-between",
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                <span>{item.unique_code}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      item.unique_code,
                                    );
                                    setCopiedCode(item.unique_code);
                                    setTimeout(() => setCopiedCode(null), 2000);
                                  }}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color:
                                      copiedCode === item.unique_code
                                        ? "#10b981"
                                        : "#64748b",
                                    cursor: "pointer",
                                    padding: "0 0.25rem",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {copiedCode === item.unique_code ? (
                                    <Check size={14} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>

                              {/* Review Button */}
                              {item.is_reviewed ? (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#10b981",
                                    padding: "0.35rem 0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <Star
                                    size={14}
                                    fill="#10b981"
                                    color="#10b981"
                                  />{" "}
                                  Đã đánh giá
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVoucherForReview(item);
                                    setRating(0);
                                    setComment("");
                                    setReviewError("");
                                    setReviewSuccess("");
                                    setIsReviewModalOpen(true);
                                  }}
                                  style={{
                                    border: "none",
                                    background: "var(--primary)",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    padding: "0.45rem 0.75rem",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    transition: "opacity 0.2s",
                                    whiteSpace: "nowrap",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.9")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                >
                                  <Star size={12} fill="white" /> Đánh giá
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        background: "#f8fafc",
                        borderRadius: "24px",
                        border: "2px dashed #e2e8f0",
                      }}
                    >
                      <Ticket
                        size={48}
                        color="#cbd5e1"
                        style={{ marginBottom: "1rem" }}
                      />
                      <p style={{ color: "#64748b", fontWeight: 600 }}>
                        Bạn chưa sở hữu E-Voucher nào
                      </p>
                      <Link
                        to="/"
                        style={{
                          display: "inline-block",
                          marginTop: "1rem",
                          color: "white",
                          background: "var(--primary)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.5rem 1.5rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          fontSize: "0.9rem",
                        }}
                      >
                        Khám phá các ưu đãi ngay
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "orders" && profile?.role === "Customer" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <FileText color="var(--primary)" /> Lịch sử đơn hàng
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <div
                          key={order.order_id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "1rem",
                            background: "#f8fafc",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "1rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <b>#{order.order_id}</b>
                            <span
                              style={{
                                fontWeight: 800,
                                color:
                                  order.status === "Paid"
                                    ? "#10b981"
                                    : order.status === "Pending"
                                      ? "#f59e0b"
                                      : "#64748b",
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            {new Date(order.order_date).toLocaleString("vi-VN")}{" "}
                            - {order.payment_method}
                          </div>
                          <div
                            style={{
                              marginTop: "0.5rem",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              {order.voucher_quantity} voucher,{" "}
                              {order.evoucher_count} mã đã phát hành
                            </span>
                            <b>
                              {Number(order.total_amount).toLocaleString(
                                "vi-VN",
                              )}
                              đ
                            </b>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p
                        style={{
                          color: "#64748b",
                          textAlign: "center",
                          padding: "2rem",
                        }}
                      >
                        Chưa có đơn hàng nào
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "complaints" && profile?.role === "Customer" && (
                <motion.div
                  key="complaints"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <MessageSquare color="var(--primary)" /> Khiếu nại & phản
                    hồi
                  </h3>
                  <form
                    onSubmit={handleCreateComplaint}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <input
                      className="auth-input"
                      value={complaintForm.title}
                      onChange={(e) =>
                        setComplaintForm({
                          ...complaintForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="Tiêu đề"
                    />
                    <select
                      className="auth-input"
                      value={complaintForm.priority}
                      onChange={(e) =>
                        setComplaintForm({
                          ...complaintForm,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    {/* 1. Sửa thẻ Select Đơn hàng: Thêm logic reset voucherIds về rỗng khi đổi đơn khác */}
                    <select
                      className="auth-input"
                      value={complaintForm.orderId}
                      onChange={(e) =>
                        setComplaintForm({
                          ...complaintForm,
                          orderId: e.target.value,
                          voucherIds: [], // Reset lại danh sách voucher đã tick khi đổi đơn hàng
                        })
                      }
                    >
                      <option value="">Không gắn đơn hàng</option>
                      {orders.map((order) => (
                        <option key={order.order_id} value={order.order_id}>
                          Đơn #{order.order_id} - {order.status} -{" "}
                          {Number(order.total_amount).toLocaleString("vi-VN")}đ
                        </option>
                      ))}
                    </select>

                    {/* 2. Sửa danh sách Voucher: Thêm hàm .filter() để lọc đúng voucher của đơn hàng */}
                    {evouchers.length > 0 && (
                      <div
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: "12px",
                          padding: "1rem",
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#334155",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Voucher liên quan
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "0.75rem",
                            maxHeight: "180px",
                            overflowY: "auto",
                          }}
                        >
                          {Array.from(
                            new Map(
                              evouchers
                                // LOGIC BỘ LỌC Ở ĐÂY:
                                .filter((item) => 
                                  !complaintForm.orderId || 
                                  item.order_id?.toString() === complaintForm.orderId.toString()
                                )
                                .map((item) => [item.voucher_id, item]),
                            ).values(),
                          ).map((item) => {
                            const isChecked = complaintForm.voucherIds.includes(
                              item.voucher_id,
                            );
                            return (
                              <label
                                key={item.voucher_id}
                                style={{
                                  display: "flex",
                                  gap: "0.5rem",
                                  alignItems: "flex-start",
                                  fontSize: "0.85rem",
                                  color: "#475569",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setComplaintForm((prev) => ({
                                      ...prev,
                                      voucherIds: e.target.checked
                                        ? [...prev.voucherIds, item.voucher_id]
                                        : prev.voucherIds.filter(
                                            (id) => id !== item.voucher_id,
                                          ),
                                    }));
                                  }}
                                />
                                <span>{item.title}</span>
                              </label>
                            );
                          })}
                        </div>
                        
                        {/* 3. Thêm thông báo nếu đơn hàng vừa chọn không có voucher nào */}
                        {complaintForm.orderId && 
                         evouchers.filter(item => item.order_id?.toString() === complaintForm.orderId.toString()).length === 0 && (
                           <div style={{fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.5rem'}}>
                             Không tìm thấy E-Voucher nào thuộc đơn hàng này.
                           </div>
                        )}
                      </div>  
                    )}
                    <textarea
                      value={complaintForm.content}
                      onChange={(e) =>
                        setComplaintForm({
                          ...complaintForm,
                          content: e.target.value,
                        })
                      }
                      required
                      rows={4}
                      placeholder="Nội dung khiếu nại"
                      style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        fontFamily: "inherit",
                      }}
                    />
                    {error && activeTab === "complaints" && (
                      <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>
                        {error}
                      </p>
                    )}
                    {success && activeTab === "complaints" && (
                      <p style={{ color: "#10b981", fontSize: "0.9rem" }}>
                        {success}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ height: "48px" }}
                    >
                      Gửi khiếu nại
                    </button>
                  </form>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {complaints.map((complaint) => (
                      <div
                        key={complaint.complaint_id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          fetchComplaintDetail(complaint.complaint_id)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fetchComplaintDetail(complaint.complaint_id);
                          }
                        }}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "1rem",
                          background: "#f8fafc",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                          }}
                        >
                          <b>
                            {complaint.title ||
                              `Khiếu nại #${complaint.complaint_id}`}
                          </b>
                          <span style={{ fontWeight: 800 }}>
                            {complaint.status}
                          </span>
                        </div>
                        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
                          {complaint.content}
                        </p>
                        <small>
                          {complaint.order_id ? `Đơn #${complaint.order_id} - ` : ""}
                          {complaint.priority} - {complaint.response_count || 0}{" "}
                          phản hồi
                        </small>
                        {complaint.vouchers?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              marginTop: "0.75rem",
                            }}
                          >
                            {complaint.vouchers.map((voucher) => (
                              <span
                                key={voucher.voucher_id}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "999px",
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                }}
                              >
                                {voucher.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal Đánh giá - AnimatePresence */}
      <AnimatePresence>
        {selectedComplaint && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem",
            }}
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "560px",
                maxHeight: "calc(100vh - 2rem)",
                overflowY: "auto",
                background: "white",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900 }}>
                    {selectedComplaint.title ||
                      `Khiếu nại #${selectedComplaint.complaint_id}`}
                  </h3>
                  <p style={{ margin: "0.35rem 0 0", color: "#64748b" }}>
                    {selectedComplaint.status} - {selectedComplaint.priority}
                    {selectedComplaint.order_id
                      ? ` - Đơn #${selectedComplaint.order_id}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#f1f5f9",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: "1.5rem" }}>
                {loadingComplaintDetail ? (
                  <p style={{ color: "#64748b" }}>Đang tải chi tiết...</p>
                ) : (
                  <>
                    <p style={{ color: "#334155", lineHeight: 1.7, marginTop: 0 }}>
                      {selectedComplaint.content}
                    </p>
                    {selectedComplaint.vouchers?.length > 0 && (
                      <div style={{ marginBottom: "1rem" }}>
                        <b>Voucher liên quan</b>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                            marginTop: "0.5rem",
                          }}
                        >
                          {selectedComplaint.vouchers.map((voucher) => (
                            <span
                              key={voucher.voucher_id}
                              style={{
                                padding: "0.35rem 0.6rem",
                                borderRadius: "999px",
                                background: "#e0f2fe",
                                color: "#0369a1",
                                fontSize: "0.78rem",
                                fontWeight: 800,
                              }}
                            >
                              {voucher.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <b>Phản hồi xử lý</b>
                      {selectedComplaint.responses?.length > 0 ? (
                        selectedComplaint.responses.map((response) => (
                          <div
                            key={response.response_id}
                            style={{
                              marginTop: "0.75rem",
                              padding: "0.85rem",
                              borderRadius: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                color: "#0f172a",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {response.responder_name || "Dealzy"} -{" "}
                              {response.responder_role || "Support"}
                            </div>
                            <div style={{ color: "#475569" }}>
                              {response.content}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "#64748b" }}>
                          Chưa có phản hồi xử lý.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEVoucher && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem",
            }}
            onClick={() => setSelectedEVoucher(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                maxHeight: "calc(100vh - 2rem)",
                overflowY: "auto",
                background: "white",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 0.25rem",
                      color: "#64748b",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    E-Voucher chưa dùng
                  </p>
                  <h3
                    style={{
                      margin: 0,
                      color: "#0f172a",
                      fontSize: "1.15rem",
                      fontWeight: 900,
                    }}
                  >
                    Mã sử dụng voucher
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEVoucher(null)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#f1f5f9",
                    color: "#64748b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <img
                    src={selectedEVoucher.image_url}
                    alt={selectedEVoucher.title}
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "12px",
                      objectFit: "cover",
                      background: "#e2e8f0",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=160&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {selectedEVoucher.company_name}
                    </div>
                    <h4
                      style={{
                        margin: 0,
                        color: "#0f172a",
                        fontSize: "1rem",
                        fontWeight: 900,
                        lineHeight: 1.35,
                      }}
                    >
                      {selectedEVoucher.title}
                    </h4>
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "1rem",
                    background: "#f8fafc",
                    textAlign: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    aria-label={`QR ${selectedEVoucher.unique_code}`}
                    style={{
                      minHeight: "224px",
                      padding: "1rem",
                      background: "white",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <QRCodeSVG
                      value={selectedEVoucher.unique_code}
                      size={192}
                      level="M"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "0.85rem",
                      fontFamily: "monospace",
                      fontSize: "1.35rem",
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      color: "#0f172a",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedEVoucher.unique_code}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                    color: "#64748b",
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    Ngày mua
                    <strong style={{ display: "block", color: "#0f172a" }}>
                      {new Date(
                        selectedEVoucher.purchase_date,
                      ).toLocaleDateString("vi-VN")}
                    </strong>
                  </div>
                  <div>
                    Hạn dùng
                    <strong style={{ display: "block", color: "#0f172a" }}>
                      {new Date(
                        selectedEVoucher.expiry_date,
                      ).toLocaleDateString("vi-VN")}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedEVoucher.unique_code);
                    setCopiedCode(selectedEVoucher.unique_code);
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  style={{
                    width: "100%",
                    height: "48px",
                    border: "none",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {copiedCode === selectedEVoucher.unique_code ? (
                    <>
                      <Check size={18} /> Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy size={18} /> Sao chép mã
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewModalOpen && selectedVoucherForReview && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1.5rem",
            }}
            onClick={() => setIsReviewModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              style={{
                background: "white",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Đánh giá Voucher
                </h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    color: "#64748b",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#e2e8f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f1f5f9")
                  }
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmitReview}
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Voucher info mini card */}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    background: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "16px",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "#e2e8f0",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={selectedVoucherForReview.image_url}
                      alt={selectedVoucherForReview.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {selectedVoucherForReview.company_name}
                    </span>
                    <h4
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "#1e293b",
                        margin: "0.1rem 0 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedVoucherForReview.title}
                    </h4>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginTop: "0.2rem",
                      }}
                    >
                      Mã:{" "}
                      <span
                        style={{ fontFamily: "monospace", fontWeight: 700 }}
                      >
                        {selectedVoucherForReview.unique_code}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Star rating interactive block */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "#334155",
                    }}
                  >
                    Bạn đánh giá voucher này mấy sao?
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = starValue <= (hoverRating || rating);
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "0.25rem",
                            transition: "transform 0.1s",
                            outline: "none",
                          }}
                          onMouseDown={(e) =>
                            (e.currentTarget.style.transform = "scale(0.9)")
                          }
                          onMouseUp={(e) =>
                            (e.currentTarget.style.transform = "scale(1.1)")
                          }
                        >
                          <Star
                            size={36}
                            fill={isFilled ? "#facc15" : "none"}
                            color={isFilled ? "#facc15" : "#cbd5e1"}
                            style={{ transition: "color 0.15s, fill 0.15s" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {rating > 0 && (
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#eab308",
                      }}
                    >
                      {rating === 1 && "Tệ quá 😞"}
                      {rating === 2 && "Không hài lòng 😐"}
                      {rating === 3 && "Bình thường 🙂"}
                      {rating === 4 && "Rất tốt! 😊"}
                      {rating === 5 && "Tuyệt vời ông mặt trời! 😍"}
                    </span>
                  )}
                </div>

                {/* Comment textarea */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      color: "#334155",
                    }}
                  >
                    Viết nhận xét của bạn (Không bắt buộc)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Hãy chia sẻ trải nghiệm sử dụng voucher của bạn..."
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      fontFamily: "inherit",
                      fontSize: "0.9rem",
                      color: "#1e293b",
                      resize: "vertical",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--primary)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#cbd5e1")
                    }
                  />
                </div>

                {/* Notification Messages */}
                {reviewError && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#ef4444",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div
                    style={{
                      background: "#d1fae5",
                      color: "#10b981",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {reviewSuccess}
                  </div>
                )}

                {/* Buttons */}
                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    style={{
                      flex: 1,
                      height: "48px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      background: "white",
                      color: "#64748b",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    style={{
                      flex: 1,
                      height: "48px",
                      borderRadius: "12px",
                      border: "none",
                      background: "var(--primary)",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: reviewSubmitting ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {reviewSubmitting ? (
                      <>
                        <div
                          className="loader"
                          style={{
                            width: "16px",
                            height: "16px",
                            borderWidth: "2px",
                            borderTopColor: "transparent",
                            margin: 0,
                          }}
                        />{" "}
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi đánh giá"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
