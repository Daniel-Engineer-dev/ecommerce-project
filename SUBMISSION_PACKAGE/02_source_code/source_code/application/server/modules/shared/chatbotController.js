// application/server/modules/shared/chatbotController.js
const pool = require('../../config/db');

// Danh sách câu hỏi FAQs thường gặp dành cho Khách hàng & Đối tác (Chế độ Fallback Rule-based)
const FAQS = [
    // --- FAQs cho Customer ---
    {
        keywords: ['mua voucher', 'mua hang', 'dat mua', 'dat voucher', 'order'],
        response: 'Để mua voucher trên Dealzy, bạn chỉ cần thực hiện các bước sau:\n1. Tìm kiếm và chọn voucher bạn ưng ý.\n2. Bấm "Thêm vào giỏ" hoặc "Mua ngay".\n3. Vào giỏ hàng, điền thông tin người mua (hoặc người nhận quà tặng) và chọn phương thức thanh toán mô phỏng.\n4. Sau khi thanh toán thành công, hệ thống sẽ cấp mã QR E-Voucher trong phần "Voucher của tôi".'
    },
    {
        keywords: ['thanh toan', 'momo', 'vnpay', 'paypal', 'vietqr', 'chuyen khoan'],
        response: 'Dealzy hỗ trợ thanh toán mô phỏng qua VietQR (MB Bank), MoMo, PayPal và VNPay. Vì đây là hệ thống demo học thuật, các giao dịch đều là mô phỏng hoàn toàn miễn phí. Bạn chỉ cần bấm "Thanh toán mô phỏng thành công" để nhận mã voucher.'
    },
    {
        keywords: ['lay code', 'ma voucher', 'qr code', 'e-voucher', 'tim ma', 'dau roi'],
        response: 'Sau khi đơn hàng chuyển sang trạng thái "Đã thanh toán" (Paid), bạn vào biểu tượng tài khoản ở góc trên bên phải, chọn "Voucher của tôi" hoặc kiểm tra email nếu mua dạng quà tặng. Tại đó, bạn sẽ thấy danh sách mã điện tử và hình ảnh QR code để mang đến đối tác sử dụng.'
    },
    {
        keywords: ['hoan tien', 'huy don', 'refund', 'tra tien'],
        response: 'Chính sách hoàn tiền của Dealzy cho phép hoàn tiền mô phỏng trong vòng 24 giờ kể từ khi mua, áp dụng đối với các E-Voucher chưa được sử dụng hoặc gặp lỗi từ nhà cung cấp. Bạn có thể gửi Khiếu nại từ tài khoản cá nhân để Admin hỗ trợ xử lý hoàn tiền.'
    },
    {
        keywords: ['danh gia', 'review', 'binh luan', 'cham sao'],
        response: 'Bạn chỉ có thể đánh giá và nhận xét (chấm từ 1 đến 5 sao) đối với những voucher mà bạn đã mua thành công. Hãy vào danh sách voucher đã mua, chọn voucher tương ứng và bấm nút "Đánh giá".'
    },
    {
        keywords: ['khieu nai', 'complaint', 'ho tro', 'support', 'loi'],
        response: 'Nếu gặp sự cố (ví dụ: món ăn không tươi, thái độ phục vụ chưa tốt, lỗi nạp tiền...), bạn có thể gửi Khiếu nại từ trang chi tiết đơn hàng hoặc mục Hỗ trợ. Quản trị viên và đối tác sẽ tiếp nhận và phản hồi giải quyết cho bạn sớm nhất.'
    },

    // --- FAQs cho Partner ---
    {
        keywords: ['dang ky doi tac', 'lam doi tac', 'register partner', 'ban hang'],
        response: 'Để trở thành đối tác kinh doanh trên Dealzy, bạn vào trang chủ Customer -> chọn "Đăng ký đối tác" ở phía dưới trang. Điền đầy đủ thông tin pháp lý doanh nghiệp, người đại diện, mã số thuế, trụ sở chính và ít nhất một chi nhánh. Sau khi gửi, Admin sẽ xét duyệt hồ sơ của bạn.'
    },
    {
        keywords: ['tao voucher', 'dang voucher', 'post voucher', 'them voucher'],
        response: 'Khi tài khoản đối tác của bạn đã được Admin phê duyệt (Approved), bạn đăng nhập vào cổng đối tác -> chọn "Voucher của tôi" -> bấm "Tạo voucher". Điền đầy đủ tiêu đề, danh mục, giá gốc, giá bán (giá bán phải nhỏ hơn giá gốc), số lượng phát hành, hạn dùng, điều kiện áp dụng và bấm "Lưu và gửi duyệt".'
    },
    {
        keywords: ['duyet voucher', 'cho duyet', 'pending voucher'],
        response: 'Mọi voucher mới tạo sẽ ở trạng thái Chờ duyệt (Pending) để Admin kiểm soát nội dung và hình ảnh. Sau khi Admin duyệt thành công, voucher của bạn sẽ tự động xuất hiện trên trang chủ Dealzy để khách hàng tìm kiếm và đặt mua.'
    },
    {
        keywords: ['xac thuc', 'quet ma', 'nhap ma', 'redeem', 'dung voucher'],
        response: 'Khi khách hàng mang E-Voucher đến cửa hàng, nhân viên đối tác đăng nhập cổng đối tác -> chọn "Xác thực mã". Nhập mã voucher (VD: DLZ-SHER-XXXX) hoặc quét mã QR. Hệ thống sẽ kiểm tra hạn dùng, chi nhánh áp dụng và trạng thái. Nếu hợp lệ, bấm "Xác nhận đã sử dụng" để đổi trạng thái sang Used.'
    },
    {
        keywords: ['bao cao', 'doanh thu', 'thong ke', 'kpi'],
        response: 'Cổng đối tác cung cấp mục "Báo cáo" hiển thị trực quan tổng quan doanh thu, số lượng voucher đã phát hành, số đã bán, số đã sử dụng và tỷ lệ sử dụng thực tế của từng chương trình voucher riêng biệt.'
    },
    // --- FAQs bổ sung chung cho cả 2 cổng ---
    {
        keywords: ['nganh hang', 'danh muc', 'loai voucher', 'category'],
        response: 'Dealzy hỗ trợ đa dạng ngành hàng bao gồm: Ăn uống, Làm đẹp & Spa, Khách sạn & Lưu trú, Giải trí, Mua sắm, v.v. Bạn có thể xem và lọc theo danh mục ngay tại trang chủ.'
    },
    {
        keywords: ['chi nhanh', 'cua hang', 'o dau', 'dia chi', 'address', 'branch'],
        response: 'Mỗi voucher trên Dealzy sẽ có danh sách các chi nhánh áp dụng cụ thể được liệt kê ở phần thông tin chi tiết. Khi thanh toán thành công, bạn có thể mang mã QR đến bất kỳ chi nhánh nào được liệt kê trong danh sách của đối tác để sử dụng.'
    },
    {
        keywords: ['doi tac', 'nha cung cap', 'partner', 'thuong hieu'],
        response: 'Dealzy liên kết với nhiều thương hiệu và nhà cung cấp dịch vụ uy tín trên toàn quốc. Các đối tác bán hàng trên Dealzy đều phải trải qua quy trình xác minh thông tin doanh nghiệp nghiêm ngặt bởi ban quản trị trước khi được đăng bán voucher.'
    }
];

// Hàm tìm câu trả lời từ FAQs dựa trên từ khóa trong câu hỏi
function findFaqResponse(message) {
    const msgLower = String(message || '').toLowerCase();
    for (const faq of FAQS) {
        if (faq.keywords.some(kw => msgLower.includes(kw))) {
            return faq.response;
        }
    }
    return null;
}

const handleChat = async (req, res) => {
    try {
        const { message, history = [], portal = 'customer', currentPath = '' } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Tin nhắn không được để trống.' });
        }

        // Ánh xạ currentPath sang mô tả giao diện tương ứng
        let pageDescription = '';
        if (currentPath) {
            if (portal === 'partner') {
                if (currentPath === '/') pageDescription = 'Trang chủ Dashboard Đối tác (hiển thị biểu đồ doanh thu và các chỉ số thống kê nhanh).';
                else if (currentPath.startsWith('/vouchers')) pageDescription = 'Trang Quản lý Voucher Đối tác (nơi xem danh sách voucher của đối tác, chỉnh sửa hoặc nhấn nút "Tạo voucher" màu xanh ở góc trên để tạo mới).';
                else if (currentPath.startsWith('/redeem')) pageDescription = 'Trang Xác thực mã E-Voucher (nơi nhập mã voucher của khách hàng hoặc bật camera để quét mã QR nhằm đổi trạng thái voucher từ Unused sang Used).';
                else if (currentPath.startsWith('/reports')) pageDescription = 'Trang Báo cáo doanh thu (nơi xem các bảng thống kê và biểu đồ chi tiết về tình hình bán voucher).';
                else if (currentPath.startsWith('/settings')) pageDescription = 'Trang Cài đặt & Hồ sơ Đối tác (nơi đổi mật khẩu tại tab Security, xem thông tin công ty và quản lý danh sách chi nhánh cửa hàng của đối tác).';
            } else {
                if (currentPath === '/') pageDescription = 'Trang chủ Dealzy (hiển thị danh mục ngành hàng, các voucher đang mở bán và thanh tìm kiếm).';
                else if (currentPath.startsWith('/auth')) pageDescription = 'Trang Đăng nhập / Đăng ký tài khoản dành cho Khách hàng và Đối tác.';
                else if (currentPath.startsWith('/cart')) pageDescription = 'Trang Giỏ hàng (hiển thị danh sách các voucher đã chọn mua, nút điều chỉnh số lượng và nút "Tiến hành thanh toán").';
                else if (currentPath.startsWith('/checkout')) pageDescription = 'Trang Checkout thanh toán (nơi điền thông tin người mua, chọn các phương thức thanh toán mô phỏng như VietQR, MoMo, VNPay, PayPal).';
                else if (currentPath.startsWith('/profile')) pageDescription = 'Trang thông tin cá nhân và mục "Voucher của tôi" (nơi xem lịch sử đơn hàng, lấy mã QR E-Voucher để sử dụng, gửi khiếu nại hoặc đánh giá voucher).';
                else if (currentPath.startsWith('/search')) pageDescription = 'Trang Tìm kiếm voucher.';
                else if (currentPath.startsWith('/voucher/')) pageDescription = 'Trang Chi tiết Voucher (nơi xem mô tả chi tiết, giá gốc, giá bán, thời hạn, các chi nhánh áp dụng và các đánh giá từ khách hàng khác).';
                else if (currentPath.startsWith('/register-partner')) pageDescription = 'Trang Đăng ký Đối tác bán hàng mới (nơi điền thông tin doanh nghiệp, đại diện, mã số thuế để gửi Admin duyệt).';
            }
        }

        const uiContext = pageDescription
            ? `\n- Vị trí màn hình hiện tại của người dùng: ${pageDescription}\n(Hãy dựa vào vị trí này để hướng dẫn họ click nút hoặc thao tác tương ứng nếu câu hỏi liên quan đến cách dùng/thao tác trên giao diện)`
            : '';

        // 0. Tải dữ liệu thực tế từ Database (Read-only) để làm ngữ cảnh
        let dbContext = '';
        try {
            if (portal === 'partner') {
                const partnersCountRes = await pool.query("SELECT COUNT(*) FROM Partners WHERE status = 'Approved'");
                const branchesCountRes = await pool.query("SELECT COUNT(*) FROM Branches");
                const categoriesRes = await pool.query("SELECT category_name FROM Categories LIMIT 8");
                
                const pCount = partnersCountRes.rows[0]?.count || 0;
                const bCount = branchesCountRes.rows[0]?.count || 0;
                const cats = categoriesRes.rows.map(r => r.category_name).join(', ');
                
                dbContext = `\n\n[Dữ liệu Dealzy thực tế hiện tại]:\n- Số lượng đối tác (Partners) đã hoạt động: ${pCount}.\n- Tổng số chi nhánh (Branches) liên kết: ${bCount}.\n- Các ngành hàng hỗ trợ: ${cats}.`;
            } else {
                const vouchersCountRes = await pool.query("SELECT COUNT(*) FROM Vouchers WHERE status = 'Approved'");
                const categoriesRes = await pool.query("SELECT category_name FROM Categories LIMIT 8");
                const topVouchersRes = await pool.query(`
                    SELECT v.title, v.sale_price, p.company_name 
                    FROM Vouchers v 
                    JOIN Partners p ON v.partner_id = p.user_id 
                    WHERE v.status = 'Approved' AND v.quantity_stock > 0 
                    ORDER BY v.voucher_id DESC LIMIT 5
                `);
                
                const vCount = vouchersCountRes.rows[0]?.count || 0;
                const cats = categoriesRes.rows.map(r => r.category_name).join(', ');
                const voucherList = topVouchersRes.rows.map((v, i) => `${i+1}. ${v.title} (${v.company_name}) - ${Number(v.sale_price).toLocaleString('vi-VN')}đ`).join('\n');
                
                dbContext = `\n\n[Dữ liệu Dealzy thực tế hiện tại]:\n- Số lượng voucher đang mở bán: ${vCount}.\n- Các danh mục ngành hàng: ${cats}.\n- Top 5 voucher nổi bật mới nhất:\n${voucherList || 'Chưa có.'}`;
            }
        } catch (dbErr) {
            console.warn('Không thể tải ngữ cảnh từ database:', dbErr.message);
        }

        // 1. Kiểm tra cấu hình Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY;
        
        // 2. Chế độ có API Key -> Gọi Gemini AI
        if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
            try {
                // Xây dựng System Instruction định hướng AI kèm theo ngữ cảnh động từ DB
                const systemInstruction = portal === 'partner'
                    ? `Bạn là Trợ lý AI đắc lực của cổng đối tác (Partner Hub) trên hệ thống Dealzy. Hãy trả lời ngắn gọn (dưới 100 từ), lịch sự, tập trung hướng dẫn đối tác cách tạo voucher, quản lý chi nhánh, gửi duyệt và xác thực mã voucher code của khách hàng.
Lưu ý quan trọng:
1. KHÔNG sử dụng bất kỳ định dạng Markdown nào (không dùng các ký tự * hoặc ** để in đậm hay làm list, không dùng #). Hãy trả lời bằng thuần văn bản (plain text), sử dụng xuống dòng và ký tự gạch ngang (-) cho danh sách.
2. Chỉ sử dụng số liệu thống kê bên dưới khi người dùng hỏi trực tiếp về số lượng đối tác/chi nhánh/ngành hàng hoặc khi thực sự cần thiết. Tuyệt đối KHÔNG tự động lặp lại hay chèn các thông tin này vào các câu trả lời hướng dẫn thông thường khác: ${dbContext}${uiContext}`
                    : `Bạn là Trợ lý AI chăm sóc khách hàng đắc lực của nền tảng Dealzy - Hệ thống mua bán voucher giảm giá trực tuyến hàng đầu Việt Nam. Hãy trả lời ngắn gọn (dưới 100 từ), thân thiện, hỗ trợ khách hàng cách tìm kiếm, thêm giỏ hàng, đặt mua voucher, thanh toán mô phỏng và nhận/sử dụng E-Voucher.
Lưu ý quan trọng:
1. KHÔNG sử dụng bất kỳ định dạng Markdown nào (không dùng các ký tự * hoặc ** để in đậm hay làm list, không dùng #). Hãy trả lời bằng thuần văn bản (plain text), sử dụng xuống dòng và ký tự gạch ngang (-) cho danh sách.
2. Chỉ giới thiệu danh sách voucher hoặc số liệu thống kê bên dưới khi người dùng hỏi trực tiếp về gợi ý voucher/số lượng/danh mục. Tuyệt đối KHÔNG tự động chèn các thông tin này vào các câu trả lời thông thường khác: ${dbContext}${uiContext}`;

                // Chuẩn bị payload cho Gemini 2.5 Flash API
                const contents = [];
                
                // Gửi kèm lịch sử chat nếu có
                if (Array.isArray(history) && history.length > 0) {
                    history.slice(-6).forEach(h => {
                        contents.push({
                            role: h.sender === 'user' ? 'user' : 'model',
                            parts: [{ text: h.text }]
                        });
                    });
                }
                
                // Thêm tin nhắn hiện tại
                contents.push({
                    role: 'user',
                    parts: [{ text: `${systemInstruction}\n\nNgười dùng hỏi: ${message}` }]
                });

                const modelsToTry = [
                    process.env.GEMINI_MODEL,
                    'gemini-2.5-flash',
                    'gemini-2.5-flash-lite',
                    'gemini-flash-latest'
                ].filter(Boolean);

                let aiResponseSent = false;
                for (const modelName of modelsToTry) {
                    try {
                        const response = await fetch(
                            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents })
                            }
                        );

                        if (response.ok) {
                            const data = await response.json();
                            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (aiText) {
                                res.json({ response: aiText.trim() });
                                aiResponseSent = true;
                                break;
                            }
                        } else {
                            const errData = await response.json().catch(() => ({}));
                            console.warn(`Model ${modelName} returned status ${response.status}:`, errData?.error?.message || response.statusText);
                        }
                    } catch (fetchErr) {
                        console.warn(`Thử model ${modelName} thất bại:`, fetchErr.message);
                    }
                }

                if (aiResponseSent) return;
            } catch (apiErr) {
                console.error('Gemini AI API connection failed:', apiErr.message);
            }
        }

        // 3. Chế độ Fallback (Không có API Key hoặc Gemini lỗi) -> Rule-based FAQs
        const faqResponse = findFaqResponse(message);
        if (faqResponse) {
            return res.json({ response: faqResponse });
        }

        // Câu trả lời mặc định nếu không khớp từ khóa nào
        const defaultResponse = portal === 'partner'
            ? 'Chào bạn! Tôi là trợ lý ảo Dealzy. Bạn có thể hỏi tôi về các chủ đề: Đăng ký đối tác, Cách tạo voucher mới, Gửi duyệt voucher, Cách xác thực/nhập mã voucher của khách hàng, hoặc xem Báo cáo doanh thu.'
            : 'Xin chào! Tôi có thể giúp gì cho bạn? Bạn có thể hỏi tôi về: Cách mua voucher, Phương thức thanh toán mô phỏng, Cách nhận mã E-Voucher sau khi thanh toán, Chính sách hoàn hủy đơn hàng, hoặc Cách đánh giá & khiếu nại dịch vụ.';

        return res.json({ response: defaultResponse });

    } catch (err) {
        res.status(500).json({ error: err.message || 'Lỗi hệ thống chatbot.' });
    }
};

module.exports = {
    handleChat
};
