import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Search,
  ArrowLeft,
  Send,
  Gift as GiftIcon,
  Phone,
  Video,
  Sparkles,
  CheckCheck,
  Smile,
  ShieldCheck,
  Heart,
  Flame,
  Info,
} from 'lucide-react';
import { DirectChatConversation, DirectMessage, User } from '../types/index.ts';
import { GIFTS } from '../data/mockStreams.ts';

interface DirectMessagesViewProps {
  conversations: DirectChatConversation[];
  currentUser: User;
  onSendDirectMessage: (chatId: string, text: string) => void;
  onSendDirectGift: (chatId: string, giftId: string) => void;
  activeChatId?: string | null;
  onSelectChat: (chatId: string | null) => void;
  messages: Record<string, DirectMessage[]>;
}

const QUICK_EMOJIS = ['❤️', '🔥', '😍', '👏', '🎉', '🚀', '👑', '💋'];

export const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({
  conversations,
  currentUser,
  onSendDirectMessage,
  onSendDirectGift,
  activeChatId,
  onSelectChat,
  messages,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGiftQuickSend, setShowGiftQuickSend] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = conversations.find((c) => c.id === activeChatId);
  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

  // Auto-scroll to latest message whenever messages change or chat opens
  useEffect(() => {
    if (activeChatId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages.length, activeChatId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    onSendDirectMessage(activeChatId, inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
    // refocus input
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSendEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleCall = (type: 'audio' | 'video') => {
    setCallNotice(
      `${type === 'video' ? '📹 Görüntülü' : '📞 Sesli'} arama bağlanıyor: ${activeChat?.participantName}... (Simülasyon)`
    );
    setTimeout(() => setCallNotice(null), 3500);
  };

  // 1. TEKİL BİREBİR SOHBET AÇIKSA (TAM EKRAN CHAT MODU)
  if (activeChat && activeChatId) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0816] text-white select-none max-w-lg mx-auto shadow-2xl overflow-hidden">
        {/* Chat Üst Başlık (Header) */}
        <header className="px-3.5 py-2.5 bg-[#140e24]/95 border-b border-purple-500/25 backdrop-blur-xl flex items-center justify-between z-20 shadow-lg shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Geri Dön Butonu */}
            <button
              onClick={() => onSelectChat(null)}
              className="p-2 -ml-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center gap-1"
              aria-label="Sohbet listesine geri dön"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5 text-pink-300" />
            </button>

            {/* Yayıncı / Kullanıcı Avatarı */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#181126] flex items-center justify-center text-xl">
                  {activeChat.participantAvatar}
                </div>
              </div>
              {activeChat.isOnline && (
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#140e24] absolute bottom-0 right-0 animate-pulse" />
              )}
            </div>

            {/* İsim ve Durum */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <h4 className="font-black text-sm text-white truncate leading-tight">
                  {activeChat.participantName}
                </h4>
                <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black shrink-0 shadow-sm">
                  Lv.{activeChat.participantLevel}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] text-emerald-400 font-bold leading-none">
                  {activeChat.isOnline ? 'Çevrimiçi' : 'Son görülme az önce'}
                </p>
              </div>
            </div>
          </div>

          {/* Sesli & Görüntülü Arama Butonları */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleCall('audio')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-pink-300 border border-white/10 active:scale-95 transition-all shadow-sm"
              title="Sesli Ara"
              aria-label="Sesli Ara"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCall('video')}
              className="p-2 rounded-xl bg-gradient-to-r from-pink-500/25 to-purple-600/25 hover:from-pink-500/40 hover:to-purple-600/40 text-pink-300 border border-pink-500/40 active:scale-95 transition-all shadow-sm"
              title="Görüntülü Ara"
              aria-label="Görüntülü Ara"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Arama / Bildirim Uyarısı */}
        {callNotice && (
          <div className="mx-3 my-2 p-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 text-white font-extrabold text-xs shadow-xl text-center animate-in fade-in flex items-center justify-center gap-2 z-10 shrink-0">
            <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
            <span>{callNotice}</span>
          </div>
        )}

        {/* Mesaj Akışı Alanı (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3.5 space-y-3">
          {/* Uçtan Uca Şifreleme Güvenlik Rozeti */}
          <div className="flex flex-col items-center justify-center py-2 px-3 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] text-pink-200 font-semibold shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              <span>🔒 Uçtan uca şifreli birebir özel sohbet</span>
            </div>
            <p className="text-[10px] text-purple-300/70 mt-1 max-w-xs">
              Bu sohbetteki mesajlar ve hediyeler yalnızca {activeChat.participantName} ile sizin aranızda korunur.
            </p>
          </div>

          {/* Mesaj Listesi */}
          {currentMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id || msg.senderId === 'current_user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shrink-0 shadow-sm">
                    <div className="w-full h-full rounded-full bg-[#181126] flex items-center justify-center text-sm">
                      {msg.senderAvatar}
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-md text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-[#ff3385] to-[#8d4bff] text-white rounded-br-none shadow-pink-500/20'
                      : 'bg-[#1b142d] border border-purple-500/25 text-purple-100 rounded-bl-none shadow-black/40'
                  }`}
                >
                  {msg.isGift ? (
                    <div className="flex items-center gap-2.5 py-1">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {msg.giftIcon || '🎁'}
                      </div>
                      <div>
                        <div className="text-amber-300 font-black text-xs">
                          {msg.text || 'Özel Hediye Gönderildi!'}
                        </div>
                        <span className="text-[10px] text-pink-200 opacity-90">
                          Birebir Sohbette Hediyeleşme ✨
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="break-words font-medium">{msg.text}</p>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Hızlı Emoji Seçici Çubuğu */}
        {showEmojiPicker && (
          <div className="px-3 py-2 bg-[#18122c] border-t border-purple-500/20 flex items-center gap-2 overflow-x-auto shrink-0 shadow-inner">
            <span className="text-[10px] text-purple-300 font-bold shrink-0">Hızlı Emoji:</span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendEmoji(emoji)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-pink-500/30 flex items-center justify-center text-lg active:scale-90 transition-transform shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Hızlı Hediye Gönderme Çubuğu */}
        {showGiftQuickSend && (
          <div className="p-2.5 bg-[#1b122e] border-t border-purple-500/30 shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-black text-pink-300 flex items-center gap-1">
                <span>🎁 Hızlı Hediye Gönder</span>
                <span className="text-amber-300 font-bold">({currentUser.coins} Jeton)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGiftQuickSend(false)}
                className="text-[10px] text-gray-400 hover:text-white"
              >
                Kapat ✕
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {GIFTS.slice(0, 6).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    onSendDirectGift(activeChatId, g.id);
                    setShowGiftQuickSend(false);
                  }}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-white/5 hover:bg-pink-600/30 border border-white/10 shrink-0 min-w-[65px] active:scale-95 transition-all"
                >
                  <span className="text-2xl drop-shadow">{g.icon}</span>
                  <span className="text-[10px] font-black text-white truncate max-w-[60px]">{g.name}</span>
                  <span className="text-[9px] font-black text-amber-300 flex items-center gap-0.5">
                    <span>🪙</span>
                    <span>{g.cost}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESAJ YAZMA BARI (GÖZÜKMÜYOR DENİLEN ALAN - EN ALTTA SABİT VE BELİRGİN) */}
        <div className="p-2.5 sm:p-3 bg-[#130d22] border-t border-purple-500/30 shrink-0 z-30 shadow-2xl">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Hızlı Hediye Açma Butonu */}
            <button
              type="button"
              onClick={() => {
                setShowGiftQuickSend(!showGiftQuickSend);
                setShowEmojiPicker(false);
              }}
              className={`p-2.5 rounded-2xl border transition-all shrink-0 active:scale-95 flex items-center justify-center ${
                showGiftQuickSend
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-pink-300 border-white/15'
              }`}
              title="Özel Hediye Gönder"
              aria-label="Özel Hediye Gönder"
            >
              <GiftIcon className="w-5 h-5 text-amber-300" />
            </button>

            {/* Emoji Seçici Butonu */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGiftQuickSend(false);
              }}
              className={`p-2.5 rounded-2xl border transition-all shrink-0 active:scale-95 flex items-center justify-center ${
                showEmojiPicker
                  ? 'bg-pink-500 text-white border-pink-400'
                  : 'bg-white/10 hover:bg-white/15 text-purple-200 border-white/15'
              }`}
              title="Emoji Ekle"
              aria-label="Emoji Ekle"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Metin Giriş Kutusu */}
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`${activeChat.participantName} ile sohbete başla...`}
                className="w-full px-4 py-2.5 sm:py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.16] border border-white/20 focus:border-pink-500 text-white placeholder-purple-300/60 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
              />
            </div>

            {/* Mesaj Gönder Butonu */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold shadow-lg shadow-pink-500/35 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center gap-1.5"
              title="Gönder"
              aria-label="Mesaj Gönder"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-black">Gönder</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. SOHBET LİSTESİ (BİGO DM LİSTESİ)
  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-base leading-tight">Birebir Sohbetler</h3>
            <p className="text-[10px] text-purple-300">Özel mesajlaşma, arkadaşlar ve yayıncılar</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 font-extrabold text-xs">
          {conversations.length} Sohbet
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative my-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sohbetlerde veya arkadaşlarda ara..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-purple-300/60 text-xs focus:outline-none focus:border-pink-500"
        />
        <Search className="w-4 h-4 text-purple-300 absolute left-3 top-3" />
      </div>

      {/* Online Arkadaşlar / Hızlı Hikaye Çemberleri */}
      <div className="mb-4">
        <h4 className="text-[11px] font-black text-purple-300 uppercase tracking-wider mb-2">
          Çevrimiçi Yayıncılar
        </h4>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {conversations.map((chat) => (
            <button
              key={'story_' + chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="flex flex-col items-center gap-1 shrink-0 group active:scale-95 transition-transform"
            >
              <div className="relative">
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#ff3385] via-amber-400 to-[#8d4bff] p-0.5 shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#181126] flex items-center justify-center text-xl">
                    {chat.participantAvatar}
                  </div>
                </div>
                {chat.isOnline && (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#120c22] absolute bottom-0 right-0" />
                )}
              </div>
              <span className="text-[10px] font-bold text-white max-w-[55px] truncate">
                {chat.participantName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-2 mt-2">
        {filteredConversations.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-[#1b132a] hover:bg-[#251b3d] border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all shadow-md active:scale-[0.99]"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-md">
                <div className="w-full h-full rounded-2xl bg-[#181126] flex items-center justify-center text-2xl">
                  {chat.participantAvatar}
                </div>
              </div>
              {chat.isOnline && (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#1b132a] absolute -bottom-0.5 -right-0.5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <h4 className="font-black text-sm text-white truncate">
                    {chat.participantName}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black shrink-0">
                    Lv.{chat.participantLevel}
                  </span>
                </div>
                <span className="text-[10px] text-purple-300 shrink-0">
                  {new Date(chat.lastTimestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-purple-200/80 truncate mt-0.5 font-medium">
                {chat.lastMessage}
              </p>
            </div>

            {chat.unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md shrink-0">
                {chat.unreadCount}
              </span>
            )}
          </div>
        ))}

        {filteredConversations.length === 0 && (
          <div className="text-center py-10 px-4 rounded-3xl bg-[#181126] border border-white/10">
            <div className="text-4xl mb-2">💬</div>
            <h4 className="font-black text-sm text-white">Henüz sohbet bulunamadı</h4>
            <p className="text-xs text-purple-300 mt-1">
              Yayıncıların profiline dokunarak özel birebir sohbet başlatabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
