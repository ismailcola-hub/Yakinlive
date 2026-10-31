s"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 font-black text-xs text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-white" />
              <span>Yönetici Olarak Giriş Yap & Paneli Aç</span>
            </button>
          </form>

          {onOpenAuthModal && (
            <div className="text-center pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-xs text-purple-300 hover:text-pink-300 underline"
              >
                Yeni üyelik açmak veya standart giriş yapmak için tıklayın
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // IF USER IS LOGGED IN AS ADMIN, RENDER FULL ADMIN DASHBOARD
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 text-white">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-gray-900 font-extrabold text-xs shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-600/30 via-purple-700/30 to-indigo-900/30 border border-amber-500/40 mb-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Yönetici Paneli</span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black uppercase">
                  Root Admin
                </span>
              </h2>
              <p className="text-[11px] text-purple-200">
                Giriş yapıldı: <strong className="text-amber-300">@{currentUser.username}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangingAdminPassword(!isChangingAdminPassword)}
              title="Admin Şifresini Değiştir"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 transition-colors shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Şifremi Değiştir</span>
            </button>

            <button
              onClick={() => {
                onUpdateCurrentUser({
                  ...currentUser,
                  role: 'user',
                });
                showToast('Yönetici modundan çıkış yapıldı.');
              }}
              title="Yönetici Çıkışı Yap"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-gray-300 text-[11px] font-bold border border-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>

        {/* Inline Admin Password Change Box */}
        {isChangingAdminPassword && (
          <div className="mt-3 pt-3 border-t border-amber-500/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Yeni Yönetici (Admin) Şifresi Belirle:</span>
              </span>
              <span className="text-[10px] text-gray-400">Şifre güvenlik nedeniyle gizlendi</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminNewPasswordInput}
                onChange={(e) => setAdminNewPasswordInput(e.target.value)}
                placeholder="Yeni şifreniz (örn: guclusifre2026)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-amber-500/40 text-xs text-white outline-none focus:border-amber-300"
              />
              <button
                type="button"
                onClick={handleSaveOwnAdminPassword}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-extrabold text-xs text-black hover:brightness-110 active:scale-95 transition-all"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setIsChangingAdminPassword(false)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-[#130d24] p-1 rounded-2xl border border-[#312349] mb-4">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'users'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Üyeler ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('streams')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'streams'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Yayınlar ({streams.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'reports'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Şikâyet ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('controls')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'controls'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Kontrol</span>
        </button>
      </div>

      {/* TAB 1: ÜYE & ŞİFRE YÖNETİMİ (MEMBERS & PASSWORDS) */}
      {activeAdminTab === 'users' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-purple-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Üye adı veya e-posta ara..."
                className="w-full bg-[#181226] border border-[#3b2b54] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-purple-300/50 outline-none focus:border-pink-500"
              />
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Üye Ekle</span>
            </button>
          </div>

          {/* User List */}
          <div className="space-y-2">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="p-3 rounded-2xl bg-[#1b1429] border border-[#37274e] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{account.avatar || '✨'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">
                          {account.displayName || account.username}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            account.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : account.role === 'moderator'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {account.role}
                        </span>
                        {account.isBanned && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Engelli
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-purple-300">@{account.username} • {account.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                      <Coins className="w-3 h-3" />
                      {account.coins}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Şifre: <strong className="text-pink-300">{account.password}</strong>
                    </span>
                  </div>
                </div>

                {/* Password Editing Box */}
                {editingPasswordUserId === account.id && (
                  <div className="p-2.5 rounded-xl bg-[#110c1c] border border-pink-500/50 space-y-2">
                    <p className="text-[11px] font-bold text-pink-300">
                      Yeni Şifre Belirle:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Yeni şifre (en az 6 karakter)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-purple-500/40 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => handleSaveNewPassword(account.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Kaydet</span>
                      </button>
                      <button
                        onClick={() => setEditingPasswordUserId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Coin Editing Box */}
                {editingCoinUserId === account.id && (
                  <div className="p-2.5 rounded-xl bg-[#110c1c] border border-amber-500/50 space-y-2">
                    <p className="text-[11px] font-bold text-amber-300">
                      Jeton Bakiyesi Ayarla:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={coinAmountInput}
                        onChange={(e) => setCoinAmountInput(parseInt(e.target.value, 10) || 0)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-purple-500/40 text-xs text-white outline-none"
                      />
                      <button
                        onClick={() => handleSaveCoins(account.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingCoinUserId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-[#2f2043]">
                  {/* Reset Password Button */}
                  <button
                    onClick={() => {
                      setEditingPasswordUserId(account.id);
                      setNewPasswordInput('');
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-[10px] font-bold flex items-center gap-1 border border-purple-500/20"
                  >
                    <KeyRound className="w-3 h-3 text-pink-400" />
                    <span>Şifre Sıfırla</span>
                  </button>

                  {/* Coin Editor */}
                  <button
                    onClick={() => {
                      setEditingCoinUserId(account.id);
                      setCoinAmountInput(account.coins);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-900/30 hover:bg-amber-800/50 text-amber-200 text-[10px] font-bold flex items-center gap-1 border border-amber-500/20"
                  >
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>Bakiye</span>
                  </button>

                  {/* Role Toggle */}
                  <button
                    onClick={() => handleToggleRole(account.id, account.role)}
                    className="px-2 py-1 rounded-lg bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-200 text-[10px] font-bold flex items-center gap-1 border border-cyan-500/20"
                  >
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>Rol: {account.role}</span>
                  </button>

                  {/* Ban/Unban */}
                  {account.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleBan(account.id, !!account.isBanned)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        account.isBanned
                          ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-900/40 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      <span>{account.isBanned ? 'Engeli Aç' : 'Engelle'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-3xl bg-[#1b152b] border border-purple-500/40 p-5 text-white space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <h3 className="font-black text-sm flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-pink-400" />
                    <span>Yeni Hesap & Şifre Ekle</span>
                  </h3>
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-purple-200 block mb-1">Kullanıcı Adı:</label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="kullanici_adi"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-200 block mb-1">E-posta:</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="ornek@yakinlive.com"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-200 block mb-1">Giriş Şifresi:</label>
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-200 block mb-1">Yetki / Rol:</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140e22] border border-purple-500/30 text-xs text-white outline-none"
                    >
                      <option value="user">Standart Üye</option>
                      <option value="moderator">Moderatör</option>
                      <option value="admin">Yönetici (Admin)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 py-2 rounded-xl bg-gray-800 text-xs font-bold"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white"
                    >
                      Hesabı Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: YAYIN YÖNETİMİ (STREAMS) */}
      {activeAdminTab === 'streams' && (
        <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e] space-y-3">
          <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider">
            Aktif Canlı Yayınlar ({streams.length})
          </h3>
          <div className="space-y-2">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="p-3 rounded-xl bg-[#221834] border border-[#3e2e58] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{stream.hostAvatar}</span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{stream.hostName}</span>
                      <span className="text-[10px] text-pink-300">
                        ({stream.viewerCount} izleyici)
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-300 truncate max-w-[200px]">
                      {stream.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onEndStream(stream.id);
                    showToast(`${stream.hostName} yayını sonlandırıldı.`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Kapat</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ŞİKAYETLER (REPORTS) */}
      {activeAdminTab === 'reports' && (
        <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e]">
          <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-2.5 flex items-center justify-between">
            <span>Kullanıcı Şikâyetleri ({pendingReports.length})</span>
            {pendingReports.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </h3>

          {pendingReports.length === 0 ? (
            <p className="text-xs text-emerald-400 py-6 text-center">
              ✓ İncelenmeyi bekleyen şikâyet bulunmuyor. Sistem temiz.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-xl bg-[#221834] border border-[#402e5c] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-pink-300">@{report.reportedUser}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(report.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-white font-medium">{report.reason}</p>
                  <p className="text-[10px] text-purple-300 truncate">
                    Yayın: {report.streamTitle}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#34244b]">
                    <button
                      onClick={() => onResolveReport(report.id, 'dismissed')}
                      className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Reddet</span>
                    </button>
                    <button
                      onClick={() => {
                        onResolveReport(report.id, 'resolved');
                        showToast(`@${report.reportedUser} uyarıldı ve şikayet çözümlendi.`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-extrabold text-white flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Onayla & İşlem Yap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CANLI KONTROLLER & DUYURU */}
      {activeAdminTab === 'controls' && (
        <div className="space-y-4">
          {/* Quick Controls */}
          <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e]">
            <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-2.5">
              Canlı Moderasyon Araçları
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsChatLocked(!isChatLocked);
                  showToast(isChatLocked ? 'Sohbetler yeniden açıldı.' : 'Sohbetler kilitlendi.');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isChatLocked
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-[#221834] border-[#443360] text-purple-200 hover:bg-[#2b1f41]'
                }`}
              >
                {isChatLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isChatLocked ? 'Sohbeti Aç' : 'Sohbeti Kilitle'}</span>
              </button>

              <button
                onClick={() => showToast('İzleyici bot filtresi ve IP koruması aktif.')}
                className="py-2 px-3 rounded-xl bg-[#221834] border border-[#443360] hover:bg-[#2b1f41] text-purple-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Spam Koruması</span>
              </button>
            </div>
          </div>

          {/* Broadcast Announcement */}
          <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e]">
            <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-2">
              Tüm Canlı Odalara Sistem Duyurusu
            </h3>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-2.5">
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Örn: Değerli yayıncılarımız, bu gece saat 02:00'de bakım çalışması yapılacaktır..."
                className="w-full px-3 py-2 rounded-xl bg-[#110c1c] border border-[#3b2b54] text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Duyuruyu Canlı Odalara Gönder</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
