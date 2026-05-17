/**
 * UI Actions & Workflow Handler
 * Manages modals, notifications, and interaction logic.
 */

const UI = {
    init() {
        this.bindEvents();
        this.createGlobalModals();
    },

    bindEvents() {
        // Quick Add Button
        document.addEventListener('click', (e) => {
            const target = e.target.closest('#quick-add-btn, #quick-add-fab');
            if (target) this.openQuickAddMenu();
            
            const notifTrigger = e.target.closest('#notif-trigger');
            if (notifTrigger) this.toggleNotifications();

            const searchTrigger = e.target.closest('#global-search-input');
            if (searchTrigger && e.type === 'click') this.openSearchPalette();
        });
    },

    createGlobalModals() {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'global-modal-container';
        document.body.appendChild(modalContainer);
    },

    showModal(title, content, actions = '') {
        const container = document.getElementById('global-modal-container');
        container.innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay active">
                <div class="glass-card w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl modal-content">
                    <div class="px-8 py-6 border-b border-secondary/5 flex items-center justify-between bg-white/50">
                        <h3 class="text-xl font-bold text-on-surface">${title}</h3>
                        <button onclick="UI.closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-secondary/40">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="px-8 py-8">
                        ${content}
                    </div>
                    <div class="px-8 py-6 border-t border-secondary/5 bg-white/30 flex justify-end gap-3">
                        <button onclick="UI.closeModal()" class="px-6 py-2.5 rounded-xl text-sm font-bold text-secondary/60 hover:bg-black/5 transition-all">Hủy bỏ</button>
                        ${actions || '<button onclick="UI.simulateAction()" class="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all">Xác nhận</button>'}
                    </div>
                </div>
            </div>
        `;
    },

    closeModal() {
        const container = document.getElementById('global-modal-container');
        container.innerHTML = '';
    },

    simulateAction() {
        this.showToast('Thao tác thành công!', 'success');
        this.closeModal();
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce bg-white border border-secondary/10`;
        toast.innerHTML = `
            <span class="material-symbols-outlined ${type === 'success' ? 'text-emerald-500' : 'text-primary'}">
                ${type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span class="text-sm font-bold text-on-surface">${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    openQuickAddMenu() {
        const content = `
            <div class="grid grid-cols-1 gap-4">
                <button onclick="UI.openAddLeadModal()" class="flex items-center gap-4 p-4 rounded-2xl border border-secondary/5 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">person_add</span>
                    </div>
                    <div>
                        <p class="font-bold text-on-surface">Thêm khách hàng mới</p>
                        <p class="text-xs text-secondary/60">Tạo hồ sơ khách lẻ hoặc đại lý</p>
                    </div>
                </button>
                <button onclick="UI.openAddTaskModal()" class="flex items-center gap-4 p-4 rounded-2xl border border-secondary/5 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group">
                    <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">assignment</span>
                    </div>
                    <div>
                        <p class="font-bold text-on-surface">Giao công việc mới</p>
                        <p class="text-xs text-secondary/60">Nhắc nhở gọi điện, gửi báo giá...</p>
                    </div>
                </button>
                <button onclick="UI.simulateAction()" class="flex items-center gap-4 p-4 rounded-2xl border border-secondary/5 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group">
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                        <p class="font-bold text-on-surface">Ghi nhận thanh toán</p>
                        <p class="text-xs text-secondary/60">Cập nhật doanh thu từ đơn hàng</p>
                    </div>
                </button>
            </div>
        `;
        this.showModal('Tạo mới nhanh', content, ' ');
    },

    openAddLeadModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.simulateAction();">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-secondary/40 uppercase">Tên khách hàng</label>
                        <input type="text" class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm" placeholder="Nguyễn Văn A">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-secondary/40 uppercase">Số điện thoại</label>
                        <input type="text" class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm" placeholder="0901234xxx">
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-secondary/40 uppercase">Phân khúc</label>
                    <select class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm">
                        <option>Đại lý</option>
                        <option>Khách lẻ</option>
                        <option>Khách VIP</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-secondary/40 uppercase">Sản phẩm quan tâm</label>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <label class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-secondary/10 text-[11px] font-bold cursor-pointer hover:bg-primary/5 transition-colors">
                            <input type="checkbox"> Yến thô
                        </label>
                        <label class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-secondary/10 text-[11px] font-bold cursor-pointer hover:bg-primary/5 transition-colors">
                            <input type="checkbox"> Yến tinh chế
                        </label>
                        <label class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-secondary/10 text-[11px] font-bold cursor-pointer hover:bg-primary/5 transition-colors">
                            <input type="checkbox"> Yến chưng
                        </label>
                    </div>
                </div>
            </form>
        `;
        this.showModal('Thêm khách hàng', content);
    },

    openAddTaskModal() {
        const content = `
            <div class="space-y-4">
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-secondary/40 uppercase">Tiêu đề công việc</label>
                    <input type="text" class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm" placeholder="Gửi báo giá cho khách...">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-secondary/40 uppercase">Khách hàng liên quan</label>
                    <select class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm">
                        ${CRM_DATA.customers.map(c => `<option>${c.name} (${c.company})</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-secondary/40 uppercase">Hạn chót</label>
                        <input type="datetime-local" class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-bold text-secondary/40 uppercase">Ưu tiên</label>
                        <select class="w-full bg-secondary/5 border-transparent rounded-xl py-2.5 px-4 text-sm">
                            <option>Cao</option>
                            <option>Trung bình</option>
                            <option>Thấp</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        this.showModal('Giao công việc mới', content);
    },

    toggleNotifications() {
        const content = `
            <div class="space-y-3">
                <div class="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p class="text-xs font-bold text-on-surface">Khách hàng mới đăng ký</p>
                    <p class="text-[10px] text-secondary/60">Lê Bảo Anh vừa được thêm vào hệ thống</p>
                    <p class="text-[9px] text-primary font-bold mt-1">10 phút trước</p>
                </div>
                <div class="p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer">
                    <p class="text-xs font-bold text-on-surface">Nhắc nhở công việc</p>
                    <p class="text-[10px] text-secondary/60">Bạn có cuộc hẹn với đại lý Hương Việt lúc 16:00</p>
                    <p class="text-[9px] text-secondary/40 mt-1">1 giờ trước</p>
                </div>
                <div class="p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer">
                    <p class="text-xs font-bold text-on-surface">Cập nhật hệ thống</p>
                    <p class="text-[10px] text-secondary/60">Chiến dịch Trung Thu đã sẵn sàng</p>
                    <p class="text-[9px] text-secondary/40 mt-1">Hôm qua</p>
                </div>
            </div>
        `;
        this.showModal('Thông báo mới', content, ' ');
    },

    openSearchPalette() {
        const content = `
            <div class="space-y-6">
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40">search</span>
                    <input type="text" id="search-input-field" autoFocus class="w-full bg-secondary/5 border-transparent rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Tìm tên khách hàng, công ty, hoặc công việc...">
                </div>
                <div class="space-y-4">
                    <p class="text-[10px] font-bold text-secondary/40 uppercase tracking-widest px-2">Kết quả gợi ý</p>
                    <div id="search-results-list" class="space-y-1">
                        ${this.renderSearchResults('')}
                    </div>
                </div>
            </div>
        `;
        this.showModal('Tìm kiếm thông minh', content, ' ');
        
        const input = document.getElementById('search-input-field');
        if (input) {
            input.focus();
            input.addEventListener('input', (e) => {
                const query = e.target.value;
                document.getElementById('search-results-list').innerHTML = this.renderSearchResults(query);
            });
        }
    },

    renderSearchResults(query) {
        const q = query.toLowerCase();
        const results = CRM_DATA.customers.filter(c => 
            c.name.toLowerCase().includes(q) || 
            c.company.toLowerCase().includes(q) ||
            c.phone.includes(q)
        ).slice(0, 5);

        if (results.length === 0) {
            return `<p class="px-2 py-4 text-sm text-secondary/40 italic">Không tìm thấy kết quả nào...</p>`;
        }

        return results.map(c => `
            <div onclick="UI.showToast('Mở hồ sơ: ${c.name}')" class="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all cursor-pointer group">
                <div class="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">person</span>
                </div>
                <div>
                    <p class="text-sm font-bold text-on-surface">${c.name}</p>
                    <p class="text-[11px] text-secondary/60">${c.company} • ${c.type}</p>
                </div>
            </div>
        `).join('');
    }
};

window.UI = UI;
UI.init();
