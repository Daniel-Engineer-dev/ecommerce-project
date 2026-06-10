import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

// Design Read: Customer Service Chatbot Widget for consumers and partners, with a high-end Glassmorphic visual language, leaning toward custom Framer Motion transitions, spring-physics micro-interactions, and nested double-bezel structures.
// DESIGN_VARIANCE: 8
// MOTION_INTENSITY: 7
// VISUAL_DENSITY: 3

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isBubbleHovered, setIsBubbleHovered] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('dealzy_chat_history');
        return saved ? JSON.parse(saved) : [
            {
                id: 'welcome',
                sender: 'bot',
                text: 'Xin chào! Tôi là Trợ lý AI của Dealzy. Tôi có thể giúp gì cho bạn hôm nay?',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }
        ];
    });
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef(null);
    const messageIdRef = useRef(0);
    const nextMessageId = () => `msg-${++messageIdRef.current}`;

    const quickQuestions = [
        'Làm sao mua voucher?',
        'Thanh toán mô phỏng thế nào?',
        'Lấy mã E-Voucher ở đâu?',
        'Chính sách hoàn tiền ra sao?'
    ];

    useEffect(() => {
        sessionStorage.setItem('dealzy_chat_history', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (text) => {
        if (!text || !text.trim()) return;

        const userMsg = {
            id: nextMessageId(),
            sender: 'user',
            text: text.trim(),
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Chuẩn bị lịch sử tin nhắn gửi lên API
            const historyPayload = messages.map(m => ({
                sender: m.sender,
                text: m.text
            }));

            const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text.trim(),
                    history: historyPayload,
                    portal: 'customer',
                    currentPath: window.location.pathname
                })
            });

            if (res.ok) {
                const data = await res.json();
                const botMsg = {
                    id: nextMessageId(),
                    sender: 'bot',
                    text: data.response || 'Tôi không hiểu ý bạn lắm. Bạn có thể hỏi rõ hơn được không?',
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                throw new Error('API response error');
            }
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = {
                id: nextMessageId(),
                sender: 'bot',
                text: 'Có lỗi kết nối đến trợ lý ảo. Bạn vui lòng thử lại sau nhé!',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSend(inputValue);
    };

    const dismissChatbot = (event) => {
        event.stopPropagation();
        setIsOpen(false);
        setIsDismissed(true);
    };

    if (isDismissed) return null;

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'inherit' }}>
            {/* Khung chat bọc bởi AnimatePresence */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 24, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 24, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        style={{
                            width: '380px',
                            height: '540px',
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.45)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: '0 12px 40px 0 rgba(15, 23, 42, 0.12)',
                            display: 'flex',
                            padding: '6px',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            transformOrigin: 'bottom right',
                        }}
                    >
                        {/* Inner Core (Concentric Bezel) */}
                        <div style={{
                            flex: 1,
                            borderRadius: '18px',
                            background: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid rgba(15, 23, 42, 0.04)',
                            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(15, 23, 42, 0.02)'
                        }}>
                            {/* Header */}
                            <div style={{
                                background: '#0f172a',
                                padding: '16px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        display: 'grid',
                                        placeItems: 'center'
                                    }}>
                                        <Headphones size={16} strokeWidth={1.5} className="text-amber-300" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>Hỗ trợ khách hàng Dealzy</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: '#10b981',
                                                display: 'inline-block',
                                                boxShadow: '0 0 8px #10b981',
                                                animation: 'statusPulse 2s infinite'
                                            }}></span>
                                            Sẵn sàng hỗ trợ
                                        </div>
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsOpen(false)} 
                                    style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}
                                >
                                    <X size={18} strokeWidth={1.5} />
                                </motion.button>
                            </div>

                            {/* Messages Body */}
                            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafa' }}>
                                {messages.map((msg) => {
                                    const isBot = msg.sender === 'bot';
                                    return (
                                        <motion.div 
                                            key={msg.id} 
                                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', gap: '8px' }}
                                        >
                                            {isBot && (
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                    <User size={14} strokeWidth={1.5} className="text-slate-600" />
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '75%', alignItems: isBot ? 'flex-start' : 'flex-end' }}>
                                                <div style={{
                                                    background: isBot ? '#ffffff' : '#0f172a',
                                                    color: isBot ? '#334155' : '#ffffff',
                                                    padding: '10px 14px',
                                                    borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                                                    fontSize: '0.84rem',
                                                    lineHeight: '1.45',
                                                    whiteSpace: 'pre-line',
                                                    border: isBot ? '1px solid rgba(15, 23, 42, 0.04)' : 'none',
                                                    boxShadow: isBot ? '0 2px 8px rgba(0,0,0,0.02)' : '0 4px 12px rgba(15, 23, 42, 0.12)'
                                                }}>
                                                    {msg.text}
                                                </div>
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px', padding: '0 2px' }}>{msg.time}</span>
                                            </div>
                                            {!isBot && (
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f172a', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                    <User size={14} strokeWidth={1.5} className="text-white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}

                                {/* Typing indicator */}
                                {isLoading && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                                    >
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', display: 'grid', placeItems: 'center' }}>
                                            <User size={14} strokeWidth={1.5} className="text-slate-600" />
                                        </div>
                                        <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(15, 23, 42, 0.04)', display: 'flex', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                            <span className="dot-anim" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#94a3b8', animation: 'dotDelay1 1.2s infinite' }}></span>
                                            <span className="dot-anim" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#94a3b8', animation: 'dotDelay2 1.2s infinite' }}></span>
                                            <span className="dot-anim" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#94a3b8', animation: 'dotDelay3 1.2s infinite' }}></span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggestions Area */}
                            {messages.length === 1 && (
                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff', borderTop: '1px solid rgba(15, 23, 42, 0.03)' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gợi ý nhanh</div>
                                    <motion.div 
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: {
                                                opacity: 1,
                                                transition: {
                                                    staggerChildren: 0.06
                                                }
                                            }
                                        }}
                                        initial="hidden"
                                        animate="show"
                                        style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                                    >
                                        {quickQuestions.map((q) => (
                                            <motion.button
                                                key={q}
                                                variants={{
                                                    hidden: { opacity: 0, y: 8 },
                                                    show: { opacity: 1, y: 0 }
                                                }}
                                                whileHover={{ scale: 1.03, y: -1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleSend(q)}
                                                style={{
                                                    border: '1px solid #e2e8f0',
                                                    background: '#ffffff',
                                                    borderRadius: '999px',
                                                    padding: '6px 12px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 600,
                                                    color: '#475569',
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                    transition: 'border-color 0.2s, background-color 0.2s'
                                                }}
                                            >
                                                {q}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            {/* Form Input */}
                            <form 
                                onSubmit={handleSubmit} 
                                style={{ 
                                    padding: '12px 16px', 
                                    borderTop: '1px solid rgba(15, 23, 42, 0.05)', 
                                    display: 'flex', 
                                    gap: '8px', 
                                    background: '#ffffff',
                                    alignItems: 'center'
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        border: isFocused ? '1px solid #94a3b8' : '1px solid #e2e8f0',
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        fontSize: '0.84rem',
                                        outline: 'none',
                                        background: '#f8fafc',
                                        font: 'inherit',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isFocused ? '0 0 0 3px rgba(15, 23, 42, 0.04)' : 'none'
                                    }}
                                />
                                <motion.button 
                                    type="submit" 
                                    disabled={isLoading || !inputValue.trim()} 
                                    whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
                                    whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
                                    style={{
                                        border: 'none',
                                        background: '#0f172a',
                                        color: 'white',
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '10px',
                                        display: 'grid',
                                        placeItems: 'center',
                                        cursor: inputValue.trim() ? 'pointer' : 'default',
                                        opacity: inputValue.trim() ? 1 : 0.4,
                                        transition: 'opacity 0.2s ease',
                                        outline: 'none'
                                    }}
                                >
                                    <Send size={15} strokeWidth={1.5} />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Bubble Button với Framer Motion */}
            <div
                onMouseEnter={() => setIsBubbleHovered(true)}
                onMouseLeave={() => setIsBubbleHovered(false)}
                style={{ position: 'relative', float: 'right', width: '54px', height: '54px' }}
            >
                <AnimatePresence>
                    {!isOpen && isBubbleHovered && (
                        <motion.button
                            key="dismiss"
                            initial={{ opacity: 0, scale: 0.72, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.72, y: 4 }}
                            transition={{ duration: 0.16 }}
                            onClick={dismissChatbot}
                            title="Tắt chatbot"
                            aria-label="Tắt chatbot"
                            style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: '1px solid rgba(15, 23, 42, 0.08)',
                                background: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'grid',
                                placeItems: 'center',
                                boxShadow: '0 6px 14px rgba(15, 23, 42, 0.14)',
                                zIndex: 2,
                                outline: 'none'
                            }}
                        >
                            <X size={13} strokeWidth={2} />
                        </motion.button>
                    )}
                </AnimatePresence>
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 22px rgba(15, 23, 42, 0.2)',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        outline: 'none'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: 'flex' }}
                            >
                                <X size={19} strokeWidth={1.6} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: 'flex' }}
                            >
                                <Headphones size={19} strokeWidth={1.6} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Custom Animations Styles */}
            <style>{`
                @keyframes statusPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.15); }
                }
                @keyframes dotDelay1 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes dotDelay2 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes dotDelay3 {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .dot-anim:nth-child(1) { animation-delay: 0s; }
                .dot-anim:nth-child(2) { animation-delay: 0.15s; }
                .dot-anim:nth-child(3) { animation-delay: 0.3s; }
            `}</style>
        </div>
    );
};

export default ChatbotWidget;
