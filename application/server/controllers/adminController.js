const adminService = require('../services/adminService');

const getPendingPartners = async (req, res) => {
    try {
        const partners = await adminService.getPendingPartners();
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const approvePartner = async (req, res) => {
    try {
        const result = await adminService.approvePartner(req.params.id);
        res.json({ message: "Phê duyệt thành công", ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const rejectPartner = async (req, res) => {
    try {
        // Logic di chuyển vào service sau
        res.json({ message: "Đã từ chối đối tác" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getPendingPartners, approvePartner, rejectPartner };
