// Phạm vi quản trị (admin sub-role) phía client — khớp với backend middleware/adminScope.js
export const ADMIN_SCOPES = {
    SUPER_ADMIN: 'SuperAdmin',
    PARTNER_MODERATOR: 'PartnerModerator',
    VOUCHER_MODERATOR: 'VoucherModerator',
    ORDER_MANAGER: 'OrderManager',
    CONTENT_EDITOR: 'ContentEditor',
    SUPPORT_AGENT: 'SupportAgent',
};

// Nhãn hiển thị tiếng Việt cho từng scope
export const SCOPE_LABELS = {
    SuperAdmin: 'Super Admin · Toàn quyền',
    PartnerModerator: 'Kiểm duyệt đối tác',
    VoucherModerator: 'Kiểm duyệt voucher',
    OrderManager: 'Quản lý đơn hàng',
    ContentEditor: 'Biên tập nội dung',
    SupportAgent: 'Hỗ trợ khiếu nại',
};

// Danh sách scope có thể gán (để render dropdown)
export const ASSIGNABLE_SCOPES = Object.values(ADMIN_SCOPES);

// path điều hướng -> scope cần để truy cập.
//  null  = mọi Admin (trang dùng chung, vd Dashboard)
// 'SuperAdmin' = chỉ SuperAdmin (tài nguyên nhạy cảm)
export const ROUTE_SCOPE = {
    '/': null,
    '/partners': ADMIN_SCOPES.PARTNER_MODERATOR,
    '/users': ADMIN_SCOPES.SUPER_ADMIN,
    '/vouchers': ADMIN_SCOPES.VOUCHER_MODERATOR,
    '/orders': ADMIN_SCOPES.ORDER_MANAGER,
    '/complaints': ADMIN_SCOPES.SUPPORT_AGENT,
    '/content': ADMIN_SCOPES.CONTENT_EDITOR,
    '/logs': ADMIN_SCOPES.SUPER_ADMIN,
};

// Scope của admin đang đăng nhập. Thiếu/null (token cũ) => coi như SuperAdmin
// để không làm mất quyền tài khoản admin sẵn có.
export const getAdminScope = () => {
    try {
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        return user.scope || ADMIN_SCOPES.SUPER_ADMIN;
    } catch {
        return ADMIN_SCOPES.SUPER_ADMIN;
    }
};

export const isSuperAdmin = () => getAdminScope() === ADMIN_SCOPES.SUPER_ADMIN;

// Kiểm tra admin hiện tại có được vào path không
export const canAccessPath = (path) => {
    const scope = getAdminScope();
    if (scope === ADMIN_SCOPES.SUPER_ADMIN) return true;
    const required = ROUTE_SCOPE[path];
    if (required === null || required === undefined) return true; // trang dùng chung
    return required === scope;
};
