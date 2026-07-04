// Định nghĩa các phạm vi quản trị (admin sub-role) và middleware kiểm soát truy cập.
// SuperAdmin là toàn quyền; các scope còn lại chỉ được thao tác đúng phân hệ của mình.
const ADMIN_SCOPES = {
    SUPER_ADMIN: 'SuperAdmin',
    PARTNER_MODERATOR: 'PartnerModerator',
    VOUCHER_MODERATOR: 'VoucherModerator',
    ORDER_MANAGER: 'OrderManager',
    CONTENT_EDITOR: 'ContentEditor',
    SUPPORT_AGENT: 'SupportAgent',
};

const ALL_SCOPES = Object.values(ADMIN_SCOPES);

// Scope hiệu lực của request. Token cũ (trước migration) hoặc admin_scope NULL
// được coi là SuperAdmin để không làm mất quyền tài khoản admin sẵn có.
const resolveScope = (req) => req.user?.scope || ADMIN_SCOPES.SUPER_ADMIN;

// Chỉ cần là Admin (bất kỳ scope nào) — dùng cho Dashboard / tài nguyên dùng chung.
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') return next();
    return res.status(403).json({ message: 'Yêu cầu quyền Quản trị viên.' });
};

// Yêu cầu Admin thuộc một trong các scope cho phép; SuperAdmin luôn được qua.
// Gọi requireScope() không tham số => chỉ SuperAdmin (tài nguyên nhạy cảm: user, log).
const requireScope = (...allowedScopes) => (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Yêu cầu quyền Quản trị viên.' });
    }
    const scope = resolveScope(req);
    if (scope === ADMIN_SCOPES.SUPER_ADMIN || allowedScopes.includes(scope)) {
        return next();
    }
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng quản trị này.' });
};

module.exports = { ADMIN_SCOPES, ALL_SCOPES, requireAdmin, requireScope, resolveScope };
