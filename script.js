// Free Fire Wishlist Manager - Main JavaScript
// Version: OB54 - OB90 | 2026 - 2030
// API Integration: ff-item.netlify.app

// ==================== API CONFIGURATION ====================
const API_BASE_URL = 'https://ff-item.netlify.app';
const API_ENDPOINT = `${API_BASE_URL}/?iid=`;

// ==================== DATA MANAGEMENT ====================
const STORAGE_KEY = 'ff_wishlist_data';
const USER_KEY = 'ff_wishlist_user';
const CACHE_KEY = 'ff_item_cache';
const MAX_ITEMS = 100;

// Item Cache để tối ưu hiệu suất
let itemCache = {};

// ==================== ITEM API FUNCTIONS ====================
async function fetchItemData(itemId) {
    // Kiểm tra cache trước
    if (itemCache[itemId]) {
        return itemCache[itemId];
    }
    
    // Kiểm tra localStorage cache
    const localCache = getItemCache();
    if (localCache[itemId]) {
        itemCache[itemId] = localCache[itemId];
        return localCache[itemId];
    }
    
    try {
        // Gọi API để lấy thông tin item
        const response = await fetch(`${API_ENDPOINT}${itemId}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Xử lý dữ liệu trả về
        const itemData = {
            id: itemId,
            name: data.iname || data.name || `Item ${itemId}`,
            icon: data.iicon || data.icon || '',
            rawData: data
        };
        
        // Lưu vào cache
        itemCache[itemId] = itemData;
        saveItemCache(itemCache);
        
        return itemData;
    } catch (error) {
        console.error('Error fetching item data:', error);
        
        // Fallback nếu API không hoạt động
        const fallbackData = {
            id: itemId,
            name: `Item ${itemId}`,
            icon: '',
            rawData: null
        };
        
        // Có thể thử gọi API với định dạng khác
        return await tryAlternativeAPI(itemId, fallbackData);
    }
}

async function tryAlternativeAPI(itemId, fallbackData) {
    try {
        // Thử với format khác
        const altResponse = await fetch(`${API_BASE_URL}/?iid=${itemId}&iname=name&iicon=icon`);
        if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData && (altData.iname || altData.name)) {
                const itemData = {
                    id: itemId,
                    name: altData.iname || altData.name || `Item ${itemId}`,
                    icon: altData.iicon || altData.icon || '',
                    rawData: altData
                };
                itemCache[itemId] = itemData;
                saveItemCache(itemCache);
                return itemData;
            }
        }
    } catch (error) {
        console.error('Alternative API also failed:', error);
    }
    
    return fallbackData;
}

async function previewItem() {
    const itemId = document.getElementById('itemIdInput').value.trim();
    const previewDiv = document.getElementById('itemPreview');
    
    if (!/^\d{9}$/.test(itemId)) {
        previewDiv.style.display = 'none';
        return;
    }
    
    // Hiển thị loading
    previewDiv.style.display = 'block';
    previewDiv.innerHTML = `
        <div class="preview-card">
            <div class="loading-spinner"></div>
            <div class="preview-info">
                <h4>Đang tải thông tin item...</h4>
            </div>
        </div>
    `;
    
    // Fetch item data
    const itemData = await fetchItemData(itemId);
    
    // Hiển thị thông tin
    previewDiv.innerHTML = `
        <div class="preview-card">
            ${itemData.icon ? 
                `<img src="${itemData.icon}" alt="Item Icon" class="preview-icon" onerror="this.style.display='none'">` : 
                '<div class="preview-icon">🎁</div>'
            }
            <div class="preview-info">
                <h4>${itemData.name}</h4>
                <p>ID: ${itemData.id}</p>
            </div>
        </div>
    `;
}

// ==================== CACHE MANAGEMENT ====================
function getItemCache() {
    const cacheData = localStorage.getItem(CACHE_KEY);
    return cacheData ? JSON.parse(cacheData) : {};
}

function saveItemCache(cacheData) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error saving cache:', error);
        // Nếu localStorage đầy, xóa cache cũ
        localStorage.removeItem(CACHE_KEY);
    }
}

// ==================== USER DATA MANAGEMENT ====================
function getCurrentUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
}

function saveUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

function clearUser() {
    localStorage.removeItem(USER_KEY);
}

// ==================== WISHLIST DATA MANAGEMENT ====================
function getWishlistData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveWishlistData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUserWishlist(uid) {
    const data = getWishlistData();
    return data[uid] || [];
}

function saveUserWishlist(uid, items) {
    const data = getWishlistData();
    data[uid] = items;
    saveWishlistData(data);
}

// ==================== LOGIN FUNCTIONS ====================
function handleLogin() {
    const name = document.getElementById('loginName').value.trim();
    const nickname = document.getElementById('loginNickname').value.trim();
    const uid = document.getElementById('loginUID').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const phone = document.getElementById('loginPhone').value.trim();

    // Validation
    if (!name) {
        alert('⚠️ Vui lòng nhập Tên Tệp Khách!');
        return;
    }
    if (!nickname) {
        alert('⚠️ Vui lòng nhập Nickname Game Free Fire!');
        return;
    }
    if (!uid) {
        alert('⚠️ Vui lòng nhập UID Game Free Fire!');
        return;
    }
    if (!/^\d+$/.test(uid)) {
        alert('⚠️ UID phải là số!');
        return;
    }

    // Save user data
    const userData = {
        name: name,
        nickname: nickname,
        uid: uid,
        email: email,
        phone: phone,
        loginTime: new Date().toISOString(),
        version: 'OB54 - OB90'
    };
    saveUser(userData);

    // Initialize wishlist if not exists
    if (!getUserWishlist(uid).length) {
        saveUserWishlist(uid, []);
    }

    // Switch to wishlist screen
    showWishlistScreen(userData);
}

function handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        clearUser();
        showLoginScreen();
    }
}

// ==================== SCREEN MANAGEMENT ====================
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('wishlistScreen').classList.remove('active');
    
    // Clear login form
    document.getElementById('loginName').value = '';
    document.getElementById('loginNickname').value = '';
    document.getElementById('loginUID').value = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPhone').value = '';
    
    // Clear item input
    document.getElementById('itemIdInput').value = '';
    document.getElementById('itemPreview').style.display = 'none';
}

function showWishlistScreen(userData) {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('wishlistScreen').classList.add('active');
    
    // Update player info
    document.getElementById('displayName').textContent = `👤 ${userData.name}`;
    document.getElementById('displayNickname').textContent = `🎮 Nickname: ${userData.nickname}`;
    document.getElementById('displayUID').textContent = `🆔 UID: ${userData.uid}`;
    
    // Load wishlist
    loadWishlist(userData.uid);
}

// ==================== WISHLIST FUNCTIONS ====================
async function loadWishlist(uid) {
    const items = getUserWishlist(uid);
    updateItemCount(items.length);
    await renderWishlist(items);
}

function updateItemCount(count) {
    document.getElementById('itemCount').textContent = count;
    
    // Change counter color based on count
    const counter = document.querySelector('.counter-number');
    if (count >= 90) {
        counter.style.color = '#ff3333';
    } else if (count >= 70) {
        counter.style.color = '#ff6600';
    } else {
        counter.style.color = '#ffd700';
    }
}

async function renderWishlist(items) {
    const grid = document.getElementById('wishlistGrid');
    
    if (!items || items.length === 0) {
        grid.innerHTML = `
            <div class="empty-wishlist">
                <p style="font-size: 3rem; margin-bottom: 20px;">📦</p>
                <h3>Wishlist Trống</h3>
                <p>Thêm vật phẩm đầu tiên của bạn!</p>
            </div>
        `;
        return;
    }
    
    // Hiển thị loading    grid.innerHTML = `
        <div class="empty-wishlist">
            <div class="loading-spinner"></div>
            <p>Đang tải thông tin items...</p>
        </div>
    `;
    
    // Fetch tất cả items
    const itemPromises = items.map(item => fetchItemData(item.id));
    const itemDataList = await Promise.all(itemPromises);
    
    // Render items
    grid.innerHTML = items.map((item, index) => {
        const itemData = itemDataList[index];
        return `
            <div class="wishlist-item">
                <button class="wishlist-item-delete" onclick="deleteItemById('${item.id}')">×</button>
                <div class="wishlist-item-image">
                    ${itemData.icon ? 
                        `<img src="${itemData.icon}" alt="${itemData.name}" onerror="this.parentElement.innerHTML='🎁'">` : 
                        '🎁'
                    }
                </div>
                <div class="wishlist-item-id">${item.id}</div>
                <div class="wishlist-item-name">${itemData.name}</div>
            </div>
        `;
    }).join('');
}

async function addItem() {
    const user = getCurrentUser();
    if (!user) {
        alert('⚠️ Vui lòng đăng nhập lại!');
        showLoginScreen();
        return;
    }
    
    const itemId = document.getElementById('itemIdInput').value.trim();
    
    // Validate item ID
    if (!itemId) {
        alert('⚠️ Vui lòng nhập ID Item!');
        return;
    }
    if (!/^\d{9}$/.test(itemId)) {
        alert('⚠️ ID Item phải có đúng 9 số!');
        return;
    }
    
    const items = getUserWishlist(user.uid);
    
    // Check max items
    if (items.length >= MAX_ITEMS) {
        alert(`⚠️ Wishlist đã đầy (${MAX_ITEMS} vật phẩm)!`);
        return;
    }
    
    // Check duplicate
    if (items.some(item => item.id === itemId)) {
        alert('⚠️ Item này đã có trong Wishlist!');
        return;
    }
    
    // Fetch item data để verify
    const itemData = await fetchItemData(itemId);
    
    // Add item
    items.push({
        id: itemId,
        name: itemData.name,
        icon: itemData.icon,
        addedAt: new Date().toISOString()
    });
    saveUserWishlist(user.uid, items);
    
    // Clear input
    document.getElementById('itemIdInput').value = '';
    document.getElementById('itemPreview').style.display = 'none';
    
    // Reload
    await loadWishlist(user.uid);
    
    // Success message
    alert(`✅ Đã thêm "${itemData.name}" vào Wishlist!`);
}

function deleteItem() {
    const user = getCurrentUser();
    if (!user) {
        alert('⚠️ Vui lòng đăng nhập lại!');
        showLoginScreen();
        return;
    }
    
    const itemId = document.getElementById('itemIdInput').value.trim();
    
    if (!itemId) {
        alert('⚠️ Vui lòng nhập ID Item cần xóa!');
        return;
    }
    if (!/^\d{9}$/.test(itemId)) {
        alert('⚠️ ID Item phải có đúng 9 số!');
        return;
    }
    
    deleteItemById(itemId);
}

function deleteItemById(itemId) {
    const user = getCurrentUser();
    if (!user) {
        alert('⚠️ Vui lòng đăng nhập lại!');
        showLoginScreen();
        return;
    }
    
    const items = getUserWishlist(user.uid);
    const index = items.findIndex(item => item.id === itemId);
    
    if (index === -1) {
        alert('❌ Không tìm thấy item này trong Wishlist!');
        return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa Item ${itemId}?`)) {
        items.splice(index, 1);
        saveUserWishlist(user.uid, items);
        
        document.getElementById('itemIdInput').value = '';
        document.getElementById('itemPreview').style.display = 'none';
        loadWishlist(user.uid);
        
        alert('✅ Đã xóa item thành công!');
    }
}

function deleteAllItems() {
    const user = getCurrentUser();
    if (!user) {
        alert('⚠️ Vui lòng đăng nhập lại!');
        showLoginScreen();
        return;
    }
    
    const items = getUserWishlist(user.uid);
    
    if (items.length === 0) {
        alert('📦 Wishlist đã trống!');
        return;
    }
    
    if (confirm(`⚠️ Bạn có chắc muốn xóa TẤT CẢ ${items.length} vật phẩm trong Wishlist?`)) {
        saveUserWishlist(user.uid, []);
        loadWishlist(user.uid);
        alert('✅ Đã xóa tất cả vật phẩm!');
    }
}

// ==================== INITIALIZATION ====================
function init() {
    // Load cache từ localStorage
    itemCache = getItemCache();
    
    // Check for existing session
    const user = getCurrentUser();
    
    if (user) {
        // Check session age (24 hours max)
        const loginTime = new Date(user.loginTime);
        const currentTime = new Date();
        const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            // Auto login
            showWishlistScreen(user);
            loadWishlist(user.uid);
        } else {
            // Session expired
            clearUser();
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
    
    // Add enter key listeners
    document.getElementById('loginUID').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    document.getElementById('itemIdInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addItem();
        }
    });
}

// Run initialization when page loads
document.addEventListener('DOMContentLoaded', init);