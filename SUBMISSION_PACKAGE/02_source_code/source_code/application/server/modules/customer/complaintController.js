const complaintService = require('./complaintService');

class ComplaintController {
    async createComplaint(req, res) {
        try {
            const complaint = await complaintService.createComplaint(req.user.id, req.body || {});
            return res.status(201).json({ success: true, complaint });
        } catch (error) {
            return res.status(400).json({ message: error.message || 'Could not create complaint.' });
        }
    }

    async getMyComplaints(req, res) {
        try {
            const complaints = await complaintService.getMyComplaints(req.user.id);
            return res.json({ success: true, complaints });
        } catch (error) {
            return res.status(500).json({ message: error.message || 'Could not load complaints.' });
        }
    }

    async getComplaintDetail(req, res) {
        try {
            const complaint = await complaintService.getComplaintDetail(req.params.id, req.user.id);
            return res.json({ success: true, complaint });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ message: error.message || 'Could not load complaint.' });
        }
    }

    async getOrderComplaints(req, res) {
        try {
            const complaints = await complaintService.getOrderComplaints(req.params.orderId, req.user.id);
            return res.json({ success: true, complaints });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ message: error.message || 'Could not load order complaints.' });
        }
    }
}

module.exports = new ComplaintController();
