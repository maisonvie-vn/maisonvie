/**
 * Shared Layout Injector & UI Initialization
 * This script ensures consistency across all static pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    injectLayout();
    initializeGlobalEvents();
    highlightActiveMenu();
});

function injectLayout() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const headerPlaceholder = document.getElementById('header-placeholder');

    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = `
            <aside class="fixed left-0 top-0 h-screen w-[280px] bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col py-8 px-6 z-50">
                <div class="mb-10 px-2">
                    <h1 class="text-xl font-extrabold text-primary tracking-tight">Yến Sào Vĩnh Hưng</h1>
                    <p class="text-xs font-semibold text-secondary/60 uppercase tracking-widest mt-1">CRM Premium System</p>
                </div>
                <nav class="flex-1 space-y-1">
                    ${renderMenuItem('index.html', 'dashboard', 'Tổng quan')}
                    ${renderMenuItem('kanban.html', 'ads_click', 'Cơ hội')}
                    ${renderMenuItem('tasks.html', 'assignment', 'Công việc')}
                    ${renderMenuItem('customers.html', 'group', 'Khách hàng')}
                    ${renderMenuItem('payments.html', 'payments', 'Thanh toán')}
                    <div class="pt-4 pb-2 px-4 text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Hệ thống</div>
                    ${renderMenuItem('settings.html', 'settings', 'Cài đặt')}
                </nav>
                <div class="mt-auto pt-6 border-t border-secondary/10">
                    <div class="flex items-center gap-3 p-2 rounded-2xl hover:bg-black/5 transition-colors cursor-pointer group" id="user-profile-trigger">
                        <div class="w-10 h-10 rounded-full bg-primary/10 overflow-hidden border-2 border-white shadow-sm group-hover:border-primary/20 transition-all">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=C89A3D&color=fff" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <p class="text-sm font-bold text-on-surface truncate">Admin</p>
                            <p class="text-[10px] font-medium text-secondary/60 uppercase tracking-tight">Quản trị viên</p>
                        </div>
                        <span class="material-symbols-outlined text-secondary/40 text-lg">unfold_more</span>
                    </div>
                </div>
            </aside>
        `;
    }

    if (headerPlaceholder) {
        const pageTitle = document.title.split(' - ')[1] || 'Dashboard';
        headerPlaceholder.innerHTML = `
            <header class="fixed top-0 right-0 h-[72px] bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-between px-8 w-[calc(100%-280px)] z-40">
                <div class="flex items-center gap-4">
                    <h2 class="text-lg font-bold text-on-surface">${pageTitle}</h2>
                </div>
                <div class="flex-1 max-w-md mx-8">
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 text-lg group-focus-within:text-primary transition-colors">search</span>
                        <input type="text" placeholder="Tìm kiếm nhanh (Ctrl + K)..." id="global-search-input"
                               class="w-full bg-secondary/5 border-transparent rounded-full py-2.5 pl-11 pr-6 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all">
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-secondary relative group transition-colors" id="notif-trigger">
                        <span class="material-symbols-outlined text-xl">notifications</span>
                        <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
                    </button>
                    <div class="h-6 w-[1px] bg-secondary/10 mx-1"></div>
                    <button class="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(200,154,61,0.25)] hover:shadow-[0_6px_16px_rgba(200,154,61,0.35)] hover:-translate-y-0.5 transition-all active:scale-95" id="quick-add-btn">
                        <span class="material-symbols-outlined text-lg">add</span>
                        Tạo mới
                    </button>
                </div>
            </header>
        `;
    }
}

function renderMenuItem(href, icon, label) {
    return `
        <a href="${href}" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-secondary hover:text-primary hover:bg-primary/5 transition-all group">
            <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" data-icon="${icon}">${icon}</span>
            <span class="text-sm font-bold">${label}</span>
        </a>
    `;
}

function highlightActiveMenu() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('aside nav a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.remove('text-secondary', 'hover:bg-primary/5');
            link.classList.add('bg-primary', 'text-white', 'shadow-[0_8px_20px_rgba(200,154,61,0.2)]');
        }
    });
}

function initializeGlobalEvents() {
    // Add shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('global-search-input')?.focus();
        }
    });

    // Mobile check placeholder
    if (window.innerWidth < 1024) {
        console.warn('UI optimized for Desktop. Mobile layout pending enhancements.');
    }
}
