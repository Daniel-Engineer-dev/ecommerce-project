const authService = require('./authService');

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: "Đăng ký thành công", user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body.username, req.body.password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await authService.getProfile(req.user.id, req.user.role);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        await authService.updateProfile(req.user.id, req.user.role, req.body);
        res.json({ message: "Cập nhật hồ sơ thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const message = await authService.forgotPassword(req.body);
        res.json({ message });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.password);
        res.json({ message: "Mật khẩu đã được thay đổi thành công" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const tempToken = await authService.verifyOtp(req.body.phone, req.body.otp);
        res.json({ message: "Xác thực OTP thành công", tempToken });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const checkAvailability = async (req, res) => {
    // Phần này đơn giản có thể giữ hoặc chuyển vào service nếu cần phức tạp hơn
    try {
        const { username, email, phone } = req.body;
        // Tạm thời gọi trực tiếp hoặc chuyển vào service sau
        res.json({ available: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, checkAvailability, forgotPassword, resetPassword, verifyOtp };
