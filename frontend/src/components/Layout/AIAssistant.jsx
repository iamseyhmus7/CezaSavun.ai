import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_MESSAGES = {
  '/dashboard': 'Merhaba! Dashboard\'ınızdayım. Dilekçeleriniz, müvekkilleriniz veya itiraz süreleri hakkında nasıl yardımcı olabilirim?',
  '/petitions': 'Dilekçelerinizi inceliyorum. Herhangi bir dilekçeyi düzenlemek, yenisini oluşturmak veya durum analizi yapmak ister misiniz?',
  '/clients': 'Müvekkil kayıtlarınızı görüntülüyorum. Yeni müvekkil eklemek veya mevcut dosyaları incelemek ister misiniz?',
  '/calendar': 'Hukuki takviminize bakıyorum. Yaklaşan itiraz süreleri veya hatırlatıcılar hakkında bilgi verebilirim.',
  '/upload': 'Ceza tutanağı yükleme sayfasındasınız. Yükleme süreciyle ilgili sorularınıza yardımcı olabilirim.',
  '/profile': 'Hesap ayarlarınızdasınız. Profil, güvenlik veya AI tercihleri hakkında yardımcı olabilir miyim?',
};

const MOCK_RESPONSES = [
  'Trafik cezası itirazları genellikle tebliğ tarihinden itibaren 15 gün içinde yapılmalıdır. Süreyi kaçırmamak kritik önem taşır.',
  'KTK Madde 51/2-a kapsamındaki hız ihlallerinde, radar kalibrasyonu ve tabela eksikliği en güçlü itiraz argümanlarıdır.',
  'Dilekçenizin kalite skoru emsal karar kullanımı, hukuki argüman gücü ve format uyumluluğuna göre hesaplanır.',
  'Qdrant vektör veritabanımızda 50\'den fazla emsal Yargıtay kararı bulunmaktadır. Sizin için en alakalı olanları otomatik eşleştiriyorum.',
  'Hatalı park cezalarında, yeterli park yasağı tabelası bulunmaması durumu güçlü bir itiraz argümanıdır.',
  'İtiraz dilekçenizi Sulh Ceza Hakimliği\'ne sunabilirsiniz. PDF formatında indirip doğrudan kullanabilirsiniz.',
];

export default function AIAssistant({ isOpen, onClose, currentPage, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with context-aware message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = INITIAL_MESSAGES[currentPage] || INITIAL_MESSAGES['/dashboard'];
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: `${currentUser?.name ? `Merhaba ${currentUser.name}! ` : ''}${greeting}`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1000));

    const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const aiMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[420px] max-w-[92vw] bg-white border-l border-slate-200 shadow-2xl z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">AI Hukuk Asistanı</h3>
                  <p className="text-[11px] text-slate-400">Gemini Flash ile güçlendirildi</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-end gap-2 bg-slate-50 rounded-xl p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sorunuzu yazın…"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-primary placeholder:text-slate-400 outline-none resize-none max-h-24 px-2 py-1.5"
                  style={{ minHeight: '36px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-300 text-center mt-2">
                AI yanıtları bilgilendirme amaçlıdır, hukuki danışmanlık yerine geçmez.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-1">
          <Scale size={14} className="text-accent" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-slate-100 text-slate-700 rounded-bl-md'
        }`}>
          {message.content}
        </div>
        <p className={`text-[10px] text-slate-300 mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <User size={14} className="text-primary" />
        </div>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Scale size={14} className="text-accent" />
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
