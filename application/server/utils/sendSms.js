const sendSms = async ({ phone, content }) => {
    if (process.env.NODE_ENV !== 'production' && process.env.SMS_MOCK_ENABLED === 'true') {
        console.warn(`[MOCK SMS] Delivery simulated for phone ending ${String(phone).slice(-4)}.`);
        return Boolean(content);
    }
    return false;
};

module.exports = sendSms;
