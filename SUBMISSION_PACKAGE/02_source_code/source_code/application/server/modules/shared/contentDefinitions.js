const contentTemplates = [
    {
        key: 'support-center',
        label: 'Trung tâm hỗ trợ',
        template: 'support',
        type: 'page',
        slug: 'support',
        title: 'Trung tâm hỗ trợ Dealzy',
        summary: 'Hỗ trợ khách hàng về tài khoản, voucher, thanh toán và quy trình sử dụng.',
        data: {
            hero: {
                badge: 'Hỗ trợ khách hàng',
                title: 'Trung tâm hỗ trợ Dealzy',
                description: 'Tìm câu trả lời nhanh cho các vấn đề về tài khoản, voucher, thanh toán và quy trình sử dụng website.',
            },
            cards: [
                {
                    icon: 'Search',
                    title: 'Tìm voucher phù hợp',
                    text: 'Dùng thanh tìm kiếm, bộ lọc danh mục và trang chi tiết để xem điều kiện áp dụng trước khi mua.',
                },
                {
                    icon: 'ShieldCheck',
                    title: 'Hỗ trợ đơn hàng',
                    text: 'Kiểm tra trạng thái thanh toán, mã voucher và lịch sử giao dịch trong tài khoản của bạn.',
                },
                {
                    icon: 'MessageCircle',
                    title: 'Cần tư vấn nhanh',
                    text: 'Liên hệ kênh hỗ trợ khi voucher không hiển thị, thanh toán bị lỗi hoặc cần đối soát thông tin.',
                },
            ],
            contact: {
                title: 'Kênh liên hệ',
                description: 'Nếu cần hỗ trợ trực tiếp, hãy liên hệ Dealzy qua các kênh bên dưới.',
                phone: '1900 6789',
                email: 'support@dealzy.vn',
                guideLinkText: 'Xem hướng dẫn sử dụng',
            },
        },
    },
    {
        key: 'user-guide',
        label: 'Hướng dẫn sử dụng',
        template: 'guide',
        type: 'guide',
        slug: 'guide',
        title: 'Lộ trình mua và sử dụng voucher trên Dealzy',
        summary: 'Hướng dẫn từng bước để mua, thanh toán và sử dụng E-Voucher.',
        data: {
            hero: {
                badge: 'Roadmap sử dụng',
                title: 'Lộ trình mua và sử dụng voucher trên Dealzy',
                description: 'Đi theo từng bước dưới đây để tìm đúng ưu đãi, thanh toán an toàn và sử dụng E-Voucher thuận lợi tại điểm áp dụng.',
            },
            roadmap: [
                {
                    phase: 'Bước 01',
                    icon: 'UserRound',
                    title: 'Đăng nhập hoặc tạo tài khoản',
                    text: 'Tạo tài khoản khách hàng để Dealzy lưu giỏ hàng, lịch sử đơn hàng và mã E-Voucher sau khi thanh toán.',
                    checklist: ['Điền đúng email hoặc số điện thoại', 'Cập nhật thông tin cá nhân', 'Đăng nhập trước khi thanh toán'],
                },
                {
                    phase: 'Bước 02',
                    icon: 'Search',
                    title: 'Tìm ưu đãi phù hợp',
                    text: 'Dùng thanh tìm kiếm, danh mục, khu vực, giá và đối tác để thu hẹp danh sách voucher.',
                    checklist: ['Nhập từ khóa sản phẩm hoặc thương hiệu', 'Chọn danh mục quan tâm', 'Dùng bộ lọc khi có quá nhiều kết quả'],
                },
                {
                    phase: 'Bước 03',
                    icon: 'TicketCheck',
                    title: 'Kiểm tra chi tiết voucher',
                    text: 'Mở trang voucher để xem giá bán, hạn sử dụng, điều kiện áp dụng, địa điểm sử dụng và đánh giá.',
                    checklist: ['Đọc kỹ điều kiện sử dụng', 'Kiểm tra địa điểm áp dụng', 'Xem thời hạn và chính sách hoàn hủy'],
                },
                {
                    phase: 'Bước 04',
                    icon: 'ShoppingCart',
                    title: 'Thêm vào giỏ hàng',
                    text: 'Chọn số lượng cần mua, thêm vào giỏ hàng và rà soát lại danh sách voucher trước khi thanh toán.',
                    checklist: ['Kiểm tra số lượng', 'Xóa voucher không cần mua', 'Đảm bảo voucher còn hiệu lực'],
                },
                {
                    phase: 'Bước 05',
                    icon: 'CreditCard',
                    title: 'Thanh toán đơn hàng',
                    text: 'Chọn phương thức thanh toán phù hợp như VNPay, MoMo, VietQR hoặc PayPal, sau đó hoàn tất giao dịch.',
                    checklist: ['Không đóng trình duyệt khi đang thanh toán', 'Chờ quay lại trang kết quả', 'Kiểm tra trạng thái đơn hàng'],
                },
                {
                    phase: 'Bước 06',
                    icon: 'BadgeCheck',
                    title: 'Nhận và sử dụng E-Voucher',
                    text: 'Sau khi thanh toán thành công, mã E-Voucher được kích hoạt trong trang kết quả và tài khoản cá nhân.',
                    checklist: ['Lưu mã QR hoặc mã voucher', 'Xuất trình mã tại điểm sử dụng', 'Đánh giá sau khi trải nghiệm'],
                },
            ],
            quickTips: [
                {
                    icon: 'ShieldCheck',
                    title: 'Trước khi mua',
                    text: 'Luôn đọc điều kiện áp dụng, thời gian phục vụ và địa chỉ chi nhánh để tránh mua nhầm voucher.',
                },
                {
                    icon: 'MapPin',
                    title: 'Khi sử dụng',
                    text: 'Liên hệ điểm sử dụng để đặt chỗ nếu voucher yêu cầu đặt trước hoặc áp dụng theo khung giờ.',
                },
                {
                    icon: 'CircleHelp',
                    title: 'Khi gặp lỗi',
                    text: 'Nếu thanh toán thành công nhưng chưa thấy mã, vào hồ sơ cá nhân hoặc liên hệ hỗ trợ để đối soát.',
                },
            ],
            cta: {
                title: 'Cần hỗ trợ trong quá trình mua voucher?',
                description: 'Trung tâm hỗ trợ có thể giúp bạn kiểm tra thanh toán, trạng thái đơn hàng và mã E-Voucher.',
                buttonText: 'Đến trung tâm hỗ trợ',
                buttonUrl: '/support',
            },
        },
    },
    {
        key: 'refund-policy',
        label: 'Hoàn tiền',
        template: 'policy',
        type: 'policy',
        slug: 'refund-policy',
        title: 'Chính sách hoàn tiền',
        summary: 'Thông tin về các trường hợp Dealzy tiếp nhận yêu cầu hoàn tiền voucher.',
        data: {
            hero: {
                badge: 'Chính sách',
                title: 'Chính sách hoàn tiền',
                description: 'Thông tin về các trường hợp Dealzy tiếp nhận yêu cầu hoàn tiền voucher.',
            },
            sections: [
                {
                    title: 'Điều kiện xem xét hoàn tiền',
                    body: 'Dealzy xem xét hoàn tiền khi voucher chưa được sử dụng, còn trong thời hạn xử lý và giao dịch đáp ứng điều kiện của đối tác phát hành.',
                },
                {
                    title: 'Các trường hợp không hoàn tiền',
                    body: 'Voucher đã sử dụng, đã hết hạn, bị từ chối do người dùng cung cấp sai thông tin hoặc vi phạm điều kiện áp dụng sẽ không được hoàn tiền.',
                },
                {
                    title: 'Thời gian xử lý',
                    body: 'Yêu cầu hợp lệ sẽ được đối soát và phản hồi trong vòng 3-7 ngày làm việc, tùy theo phương thức thanh toán và quy trình xác nhận của đối tác.',
                },
            ],
        },
    },
    {
        key: 'terms-of-service',
        label: 'Điều khoản',
        template: 'policy',
        type: 'policy',
        slug: 'terms',
        title: 'Điều khoản dịch vụ',
        summary: 'Các điều khoản áp dụng khi người dùng truy cập và sử dụng website Dealzy.',
        data: {
            hero: {
                badge: 'Pháp lý',
                title: 'Điều khoản dịch vụ',
                description: 'Các điều khoản áp dụng khi người dùng truy cập và sử dụng website Dealzy.',
            },
            sections: [
                {
                    title: 'Chấp nhận điều khoản',
                    body: 'Khi sử dụng Dealzy, bạn đồng ý tuân thủ các điều khoản về tài khoản, mua voucher, thanh toán và sử dụng ưu đãi theo quy định của website.',
                },
                {
                    title: 'Trách nhiệm người dùng',
                    body: 'Người dùng cần cung cấp thông tin chính xác, bảo mật tài khoản và tuân thủ điều kiện sử dụng của từng voucher trước khi giao dịch.',
                },
                {
                    title: 'Thay đổi dịch vụ',
                    body: 'Dealzy có thể cập nhật nội dung, tính năng, giá voucher hoặc điều kiện áp dụng để phù hợp với chính sách của đối tác và quy định vận hành.',
                },
            ],
        },
    },
    {
        key: 'home-banner',
        label: 'Banner trang chủ',
        template: 'home_banner',
        type: 'banner',
        slug: 'home-banner',
        title: 'Đặt trải nghiệm thông minh hơn',
        summary: 'Nội dung hero/banner chính trên trang chủ Dealzy.',
        data: {
            hero: {
                badge: 'Curated offers',
                titleLine1: 'Đặt trải nghiệm',
                titleLine2: 'thông minh hơn',
                description: 'Dealzy chọn lọc voucher nhà hàng, spa, du lịch và giải trí với thông tin rõ ràng, thanh toán gọn và mã điện tử sẵn sàng sử dụng.',
                primaryCtaText: 'Khám phá deal',
                primaryCtaUrl: '/search',
                secondaryCtaText: 'Xem đối tác',
                secondaryCtaUrl: '/partners',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=82&w=1300',
            },
            proofs: [
                'Voucher đã kiểm duyệt',
                'Thanh toán demo an toàn',
                'Mã điện tử tức thì',
            ],
            features: [
                {
                    icon: 'Sparkles',
                    title: 'Lựa chọn có gu',
                    copy: 'Chỉ hiển thị voucher đã duyệt và còn hiệu lực.',
                },
                {
                    icon: 'Zap',
                    title: 'Nhận mã nhanh',
                    copy: 'E-voucher được phát hành sau thanh toán thành công.',
                },
                {
                    icon: 'ShieldCheck',
                    title: 'Kiểm soát rõ',
                    copy: 'Trạng thái đơn, mã và sử dụng được ghi nhận.',
                },
            ],
            tiles: [
                {
                    title: 'Fine dining',
                    copy: 'Set menu, buffet và nhà hàng được chọn lọc.',
                    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=82&w=900',
                },
                {
                    title: 'Wellness',
                    copy: 'Spa, làm đẹp và chăm sóc sức khỏe cuối tuần.',
                    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=82&w=900',
                },
            ],
        },
    },
];

const getContentTemplate = (key) => contentTemplates.find((item) => item.key === key);

module.exports = { contentTemplates, getContentTemplate };
