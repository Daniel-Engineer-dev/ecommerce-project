import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { API_BASE_URL } from "../config";

const CustomerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [regMethod, setRegMethod] = useState("email"); // 'email' hoặc 'phone'
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    role: "Customer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationInput, setVerificationInput] = useState("");
  const [emailAvailability, setEmailAvailability] = useState({
    status: "idle",
    message: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    otp: "",
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (regMethod !== "email") {
      setEmailAvailability({ status: "idle", message: "" });
      return undefined;
    }

    const email = formData.email.trim();
    if (!email) {
      setEmailAvailability({ status: "idle", message: "" });
      return undefined;
    }

    if (!isValidEmail(email)) {
      setEmailAvailability({
        status: "invalid",
        message: "Email chưa đúng định dạng.",
      });
      return undefined;
    }

    setEmailAvailability({ status: "checking", message: "Đang kiểm tra email..." });
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok && data.email) {
          setEmailAvailability({ status: "available", message: "" });
        } else {
          setEmailAvailability({
            status: "unavailable",
            message: "Email này đã được sử dụng.",
          });
        }
      } catch {
        setEmailAvailability({
          status: "error",
          message: "Không thể kiểm tra email. Vui lòng thử lại.",
        });
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [formData.email, regMethod]);

  const handleNext = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (step === 1) {
      if (!formData.full_name || !formData.username || !formData.password) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
        return;
      }
      if (regMethod === "email" && !formData.email) {
        setError("Vui lòng nhập Email");
        return;
      }
      if (regMethod === "email" && emailAvailability.status === "checking") {
        setError("Vui lòng chờ kiểm tra email hoàn tất.");
        return;
      }
      if (
        regMethod === "email" &&
        ["invalid", "unavailable", "error"].includes(emailAvailability.status)
      ) {
        setError(emailAvailability.message);
        return;
      }
      if (regMethod === "phone" && !formData.phone) {
        setError("Vui lòng nhập Số điện thoại");
        return;
      }
    }
    if (step === 1) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: regMethod === "email" ? formData.email : "",
            phone: regMethod === "phone" ? formData.phone : "",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.available) {
          setError(
            `Thông tin đã tồn tại: ${(data.conflicts || []).join(", ")}`,
          );
          return;
        }
      } catch (err) {
        setError("Không thể kiểm tra tài khoản. Vui lòng thử lại.");
        return;
      }
    }
    if (step === 2) {
      // Step 2 is now "Cá nhân" (dob, address)
      // Request real OTP from backend for Step 3
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/send-verification-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: regMethod === "email" ? formData.email : null,
            phone: regMethod === "phone" ? formData.phone : null,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          if (data.otp) {
            setVerificationCode(data.otp);
          }
          setVerificationInput("");
          setModalConfig({
            title: "Gửi mã OTP thành công",
            message: typeof data.message === "object" ? data.message.message : (data.message || "Mã xác minh OTP đã được gửi!"),
            otp: data.otp || "",
          });
          setModalOpen(true);
        } else {
          setError(data.message || "Không thể gửi mã xác minh.");
          return;
        }
      } catch {
        setError("Không thể kết nối đến server để gửi OTP.");
        return;
      } finally {
        setLoading(false);
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!verificationInput.trim()) {
      setError("Vui lòng nhập mã xác thực OTP.");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      email: regMethod === "email" ? formData.email : "",
      phone: regMethod === "phone" ? formData.phone : "",
      otp: verificationInput.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: "2rem",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: "white",
            padding: "4rem",
            borderRadius: "2.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#dcfce7",
              color: "#16a34a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2rem",
            }}
          >
            <CheckCircle2 size={40} />
          </div>
          <h1
            style={{
              fontSize: "2.1rem",
              fontWeight: 800,
              marginBottom: "1rem",
            }}
          >
            Chao mung ban!
          </h1>
          <p
            style={{
              color: "#64748b",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            Tai khoan cua ban da duoc khoi tao thanh cong. Hay bat dau trai
            nghiem Dealzy ngay bay gio.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="btn-primary"
            style={{ width: "100%", height: "56px" }}
          >
            Đăng nhập ngay
          </button>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { id: 1, label: "Cơ bản", icon: <User size={18} /> },
    { id: 2, label: "Cá nhân", icon: <MapPin size={18} /> },
    { id: 3, label: "Xác thực", icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "550px", width: "100%" }}>
        <div
          style={{
            background: "white",
            padding: "3rem 2.5rem",
            borderRadius: "2.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
            position: "relative",
          }}
        >
          <Link
            to="/auth"
            style={{
              position: "absolute",
              left: "2rem",
              top: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#64748b",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            <ArrowLeft size={16} /> Quay lại
          </Link>

          {/* Progress Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {steps.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    background: step >= s.id ? "var(--primary)" : "#e2e8f0",
                    borderRadius: "10px",
                    transition: "0.4s",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: step >= s.id ? "var(--primary)" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                  }}
                >
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <img src={logo} alt="Logo" style={{ height: "36px" }} />
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Tạo tài khoản
              </h1>
            </div>
          </div>

          <form onSubmit={step === 3 ? handleSubmit : handleNext}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input
                      name="full_name"
                      placeholder="Họ và tên *"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  <div className="input-group">
                    <User size={18} className="input-icon" />
                    <input
                      name="username"
                      placeholder="Tên đăng nhập *"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>

                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "5px",
                      borderRadius: "14px",
                      display: "flex",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setRegMethod("email")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          regMethod === "email" ? "white" : "transparent",
                        color:
                          regMethod === "email" ? "var(--primary)" : "#64748b",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "0.3s",
                      }}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegMethod("phone")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          regMethod === "phone" ? "white" : "transparent",
                        color:
                          regMethod === "phone" ? "var(--primary)" : "#64748b",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "0.3s",
                      }}
                    >
                      SĐT
                    </button>
                  </div>

                  {regMethod === "email" ? (
                    <div className="input-group">
                      <Mail size={18} className="input-icon" />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email của bạn *"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="auth-input"
                      />
                      {emailAvailability.message && (
                        <p
                          className="auth-error"
                          style={{
                            margin: "0.45rem 0 0",
                            color:
                              emailAvailability.status === "checking"
                                ? "#64748b"
                                : "#ef4444",
                          }}
                        >
                          {emailAvailability.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="input-group">
                      <Phone size={18} className="input-icon" />
                      <input
                        name="phone"
                        placeholder="Số điện thoại *"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                      name="password"
                      type="password"
                      placeholder="Mật khẩu *"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  <div className="input-group">
                    <Calendar size={18} className="input-icon" />
                    <input
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className="auth-input"
                      style={{ paddingLeft: "44px" }}
                    />
                  </div>
                  <div className="input-group">
                    <MapPin size={18} className="input-icon" />
                    <input
                      name="address"
                      placeholder="Địa chỉ / Thành phố"
                      value={formData.address}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "16px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      color: "#1e3a8a",
                      lineHeight: 1.6,
                      fontSize: "0.9rem",
                    }}
                  >
                    Vì quy định của các nhà mạng Việt Nam yêu cầu đăng ký Brandname nghiêm ngặt để gửi tin nhắn SMS, chúng tôi hiển thị mã OTP mô phỏng để bạn kiểm thử luồng này. Mã OTP của bạn là:{" "}
                    <strong
                      style={{
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {verificationCode}
                    </strong>
                  </div>
                  <div className="input-group">
                    <CheckCircle2 size={18} className="input-icon" />
                    <input
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder="Nhập mã OTP (6 chữ số)"
                      required
                      className="auth-input"
                    />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        setError("");
                        try {
                          const res = await fetch(`${API_BASE_URL}/api/auth/send-verification-otp`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email: regMethod === "email" ? formData.email : null,
                              phone: regMethod === "phone" ? formData.phone : null,
                            }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            if (data.otp) {
                              setVerificationCode(data.otp);
                            }
                            setVerificationInput("");
                            setModalConfig({
                              title: "Gửi lại mã OTP thành công",
                              message: typeof data.message === "object" ? data.message.message : (data.message || "Đã gửi lại mã xác minh OTP!"),
                              otp: data.otp || "",
                            });
                            setModalOpen(true);
                          } else {
                            setError(data.message || "Không thể gửi lại mã xác minh.");
                          }
                        } catch {
                          setError("Không thể kết nối đến server để gửi lại OTP.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  marginTop: "1.5rem",
                }}
              >
                {error}
              </p>
            )}

            <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{
                    flex: 1,
                    height: "56px",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Quay lại
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 2, height: "56px" }}
              >
                {loading
                  ? "Đang xử lý..."
                  : step === 3
                    ? "Hoàn tất đăng ký"
                    : "Tiếp theo"}{" "}
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
      <NotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        otp={modalConfig.otp}
      />
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, title, message, otp }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          style={{
            background: "white",
            width: "100%",
            maxWidth: "420px",
            borderRadius: "24px",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #f1f5f9",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#dcfce7",
              color: "#16a34a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#1e293b",
              marginBottom: "0.75rem",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
              lineHeight: "1.6",
              marginBottom: "1.5rem",
            }}
          >
            {message}
          </p>

          {otp && (
            <div
              style={{
                width: "100%",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "16px",
                padding: "1.25rem 1rem",
                marginBottom: "1.75rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#1e3a8a",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.5rem",
                }}
              >
                Mã xác thực OTP của bạn:
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: "#1d4ed8",
                    letterSpacing: "0.1em",
                  }}
                >
                  {otp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(otp);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3b82f6",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textDecoration: "underline",
                    marginLeft: "0.5rem",
                  }}
                >
                  Sao chép
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  marginTop: "0.75rem",
                  lineHeight: "1.4",
                }}
              >
                (Hiển thị để phục vụ mục đích kiểm thử do hạn chế Brandname)
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "999px",
              fontWeight: 700,
            }}
          >
            Xác nhận
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerRegistration;
