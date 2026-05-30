export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const categoryTranslations = {
  Dining: 'Nhà hàng & Ẩm thực',
  Shopping: 'Thời trang & Mua sắm',
  Entertainment: 'Giải trí & Vui chơi',
  Beauty: 'Sức khoẻ & Làm đẹp',
  Travel: 'Du lịch & Khách sạn',
  Health: 'Sức khoẻ & Làm đẹp',
  Education: 'Giáo dục',
  Spa: 'Sức khoẻ & Làm đẹp',
  Hotels: 'Du lịch & Khách sạn',
  Cafe: 'Nhà hàng & Ẩm thực',
  Technology: 'Công nghệ',
};

export const translateCategory = (name) => categoryTranslations[name] || name;
