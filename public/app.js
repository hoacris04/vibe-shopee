// Tự động detect API URL: nếu production thì dùng relative path, nếu local thì dùng localhost
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Tab Management
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'products') {
        loadProducts();
    }
}

// Loading Indicator
function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

// Global variable to store all orders
let currentSortColumn = null;
let currentSortDirection = 'asc';
let allOrders = [];

// Apply filters and sorting
function applyFilters() {
    const statusFilterEl = document.getElementById('status-filter');
    const paymentFilterEl = document.getElementById('payment-filter');
    const sortByEl = document.getElementById('sort-by');
    const searchEl = document.getElementById('order-search');
    
    // If elements don't exist yet, just display all orders
    if (!statusFilterEl || !paymentFilterEl || !sortByEl || !searchEl) {
        displayOrders(allOrders);
        return;
    }
    
    const statusFilter = statusFilterEl.value;
    const paymentFilter = paymentFilterEl.value;
    const sortBy = sortByEl.value;
    const searchTerm = searchEl.value.toLowerCase();
    
    let filtered = allOrders.filter(order => {
        // Status filter
        if (statusFilter && order.status !== statusFilter) return false;
        
        // Payment filter
        if (paymentFilter && order.payment_status !== paymentFilter) return false;
        
        // Search filter
        if (searchTerm) {
            const searchableText = `${order.recipient_name} ${order.address} ${order.product_name} ${order.tracking_number}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
        switch(sortBy) {
            case 'created_at_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'created_at_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'recipient_name_asc':
                return (a.recipient_name || '').localeCompare(b.recipient_name || '');
            case 'recipient_name_desc':
                return (b.recipient_name || '').localeCompare(a.recipient_name || '');
            case 'order_date_desc':
                return (b.order_date || '').localeCompare(a.order_date || '');
            case 'order_date_asc':
                return (a.order_date || '').localeCompare(b.order_date || '');
            default:
                return 0;
        }
    });
    
    displayOrders(filtered);
}

// Reset filters
function resetFilters() {
    document.getElementById('status-filter').value = '';
    document.getElementById('payment-filter').value = '';
    document.getElementById('sort-by').value = 'created_at_desc';
    document.getElementById('order-search').value = '';
    applyFilters();
}

// Sort table by column
function sortTable(column) {
    // Toggle sort direction if clicking same column
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // Update header classes
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    const clickedHeader = event.target.closest('th');
    if (clickedHeader) {
        clickedHeader.classList.add(`sort-${currentSortDirection}`);
    }
    
    // Sort the orders
    allOrders.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        // Handle numeric columns
        if (column === 'quantity') {
            aVal = parseInt(aVal) || 0;
            bVal = parseInt(bVal) || 0;
        }
        
        // Handle date columns
        if (column === 'order_date' || column === 'created_at') {
            aVal = new Date(aVal || 0);
            bVal = new Date(bVal || 0);
        }
        
        // Compare
        if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    

// Inline editing functions
function makeEditable(cell, orderId) {
    if (cell.classList.contains('editing')) return;
    
    const field = cell.dataset.field;
    const currentValue = cell.textContent.trim();
    const row = cell.parentElement;
    
    row.classList.add('editing-row');
    cell.classList.add('editing');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.dataset.orderId = orderId;
    input.dataset.field = field;
    input.dataset.originalValue = currentValue;
    
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    
    // Save on Enter, cancel on Escape
    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            await saveInlineEdit(input, cell);
        } else if (e.key === 'Escape') {
            cancelInlineEdit(input, cell);
        }
    });
    
    // Save on blur
    input.addEventListener('blur', async () => {
        await saveInlineEdit(input, cell);
    });
}

function makeEditableSelect(cell, orderId, options) {
    if (cell.classList.contains('editing')) return;
    
    const field = cell.dataset.field;
    const currentValue = cell.querySelector('span') ? cell.querySelector('span').textContent.trim() : cell.textContent.trim();
    const row = cell.parentElement;
    
    row.classList.add('editing-row');
    cell.classList.add('editing');
    
    const select = document.createElement('select');
    select.dataset.orderId = orderId;
    select.dataset.field = field;
    select.dataset.originalValue = currentValue;
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === currentValue) option.selected = true;
        select.appendChild(option);
    });
    
    cell.textContent = '';
    cell.appendChild(select);
    select.focus();
    
    // Save on change
    select.addEventListener('change', async () => {
        await saveInlineEdit(select, cell);
    });
    
    // Cancel on Escape
    select.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelInlineEdit(select, cell);
        }
    });
    
    // Save on blur
    select.addEventListener('blur', async () => {
        await saveInlineEdit(select, cell);
    });
}

async function saveInlineEdit(input, cell) {
    const orderId = input.dataset.orderId;
    const field = input.dataset.field;
    const newValue = input.value;
    const originalValue = input.dataset.originalValue;
    
    // If no change, just cancel
    if (newValue === originalValue) {
        cancelInlineEdit(input, cell);
        return;
    }
    
    try {
        showLoading();
        
        // Get current order data
        const response = await fetch(`${API_URL}/orders`);
        const orders = await response.json();
        const order = orders.find(o => o.id == orderId);
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        // Update the field
        order[field] = newValue;
        
        // Save to server
        const updateResponse = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update order');
        }
        
        // Update local data
        const orderIndex = allOrders.findIndex(o => o.id == orderId);
        if (orderIndex !== -1) {
            allOrders[orderIndex][field] = newValue;
        }
        
        // Restore cell
        cell.classList.remove('editing');
        cell.parentElement.classList.remove('editing-row');
        
        // Re-render the cell with proper formatting
        if (field === 'status') {
            cell.innerHTML = `<span class="status-badge ${getStatusClass(newValue)}">${newValue}</span>`;
        } else if (field === 'payment_status') {
            cell.innerHTML = `<span class="payment-badge ${getPaymentClass(newValue)}">${newValue}</span>`;
        } else {
            cell.textContent = newValue;
        }
        
    } catch (error) {
        console.error('Error saving inline edit:', error);
        alert('Lỗi khi lưu thay đổi: ' + error.message);
        cancelInlineEdit(input, cell);
    } finally {
        hideLoading();
    }
}

function cancelInlineEdit(input, cell) {
    const originalValue = input.dataset.originalValue;
    const field = cell.dataset.field;
    
    cell.classList.remove('editing');
    cell.parentElement.classList.remove('editing-row');
    
    // Restore original value with proper formatting
    if (field === 'status') {
        cell.innerHTML = `<span class="status-badge ${getStatusClass(originalValue)}">${originalValue}</span>`;
    } else if (field === 'payment_status') {
        cell.innerHTML = `<span class="payment-badge ${getPaymentClass(originalValue)}">${originalValue}</span>`;
    } else {
        cell.textContent = originalValue;
    }
}
    applyFilters(); // Re-display with current filters
}

// Orders Management
async function loadOrders() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/orders`);
        const orders = await response.json();
        allOrders = orders; // Store all orders globally
        applyFilters(); // Apply current filters
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Lỗi khi tải danh sách đơn hàng');
    } finally {
        hideLoading();
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.dataset.orderId = order.id;
        row.innerHTML = `
            <td class="editable" data-field="recipient_name" ondblclick="makeEditable(this, ${order.id})">${order.recipient_name || ''}</td>
            <td class="editable" data-field="address" ondblclick="makeEditable(this, ${order.id})">${order.address || ''}</td>
            <td class="editable" data-field="product_name" ondblclick="makeEditable(this, ${order.id})">${order.product_name || ''}</td>
            <td class="editable" data-field="product_category" ondblclick="makeEditable(this, ${order.id})">${order.product_category || ''}</td>
            <td class="editable" data-field="quantity" ondblclick="makeEditable(this, ${order.id})">${order.quantity || ''}</td>
            <td class="editable" data-field="order_date" ondblclick="makeEditable(this, ${order.id})">${order.order_date || ''}</td>
            <td class="editable" data-field="status" ondblclick="makeEditableSelect(this, ${order.id}, ['Chờ đặt', 'Đang giao hàng', 'Giao thành Công', 'Bị hủy'])">
                <span class="status-badge ${getStatusClass(order.status)}">${order.status || 'Chờ đặt'}</span>
            </td>
            <td class="editable" data-field="tracking_number" ondblclick="makeEditable(this, ${order.id})">${order.tracking_number || ''}</td>
            <td class="tracking-info">${order.tracking_info || ''}</td>
            <td class="editable" data-field="payment_status" ondblclick="makeEditableSelect(this, ${order.id}, ['Đã thanh toán', 'Chưa thanh toán', 'Tự đặt'])">
                <span class="payment-badge ${getPaymentClass(order.payment_status)}">${order.payment_status || 'Chưa thanh toán'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    ${order.tracking_number ? `<button class="btn btn-warning btn-sm" onclick="updateOrderTracking(${order.id})" title="Cập nhật tracking">🔄</button>` : ''}
                    <button class="btn btn-primary btn-sm" onclick="editOrder(${order.id})" title="Chỉnh sửa">✏️ Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})" title="Xóa">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const statusMap = {
        'Chờ đặt': 'status-pending',
        'Đang giao hàng': 'status-shipping',
        'Giao thành Công': 'status-delivered',
        'Bị hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

function getPaymentClass(payment) {
    const paymentMap = {
        'Đã thanh toán': 'payment-paid',
        'Chưa thanh toán': 'payment-unpaid',
        'Tự đặt': 'payment-self'
    };
    return paymentMap[payment] || 'payment-unpaid';
}

function filterOrders() {
    applyFilters(); // Use the new filter system
}


// Load products into dropdown
async function loadProductsToDropdown() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const select = document.getElementById('order-product-name');
        // Clear existing options except first one
        select.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            option.dataset.category = product.category || '';
            option.dataset.link = product.link || '';
            option.dataset.discount = product.discount_code || '';
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Update product details when selected
function updateProductDetails() {
    const select = document.getElementById('order-product-name');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        document.getElementById('order-product-category').value = selectedOption.dataset.category || '';
    } else {
        document.getElementById('order-product-category').value = '';
    }

// Generate random recipient name
function generateRecipientName() {
    const foodNames = [
        'bún bò', 'phở bò', 'nem nướng', 'mì quảng', 'chè bưởi',
        'xôi xéo', 'bánh mì', 'bánh đa cua', 'café muối', 'nước mía',
        'nem chua rán', 'bún đậu mắm tôm', 'lòng se điếu', 'vịt quay',
        'hủ tiếu nam vang', 'bánh tráng trộn', 'kem bơ', 'bánh giò',
        'thịt xiên nướng', 'súp gà ngô', 'bún riêu cua', 'miến trộn lươn',
        'bánh đúc', 'phở cuốn', 'bún chả cá', 'chả rươi', 'bánh căn',
        'mì cay', 'lẩu thái', 'pizza', 'gà rán', 'mì tôm chanh',
        'bánh su kem', 'sữa chua trân châu', 'bánh bèo', 'bún mắm',
        'cao lầu', 'bánh xèo', 'cơm tấm', 'bánh canh', 'bún bò huế',
        'cháo lòng', 'phở gà', 'bún mọc'
    ];
    
    const adjectives = [
        'tuan tu', 'tuan sat', 'tuan beo', 'tuan hao han', 'tuan cool',
        'tuan hai huoc', 'tuan ca phe', 'tuan nhiet tinh', 'tuan an vat',
        'tuan dam da', 'tuan sanh an', 'tuan vui ve', 'tuan mien tay',
        'tuan tre trung', 'tuan mat lanh', 'tuan binh dan', 'tuan duong pho',
        'tuan am ap', 'tuan dan da', 'tuan lao luyen', 'tuan xua nay',
        'tuan thanh lich', 'tuan bien ca', 'tuan dac san', 'tuan du lich',
        'tuan thach thuc', 'tuan soi noi', 'tuan hien dai', 'tuan fastfood',
        'tuan sinh vien', 'tuan ngot ngao', 'tuan ha long', 'tuan hue thuong',
        'tuan da nang', 'tuan co kinh', 'tuan hao phong', 'tuan sai gon',
        'tuan kien giang', 'tuan dam da hue', 'tuan dan choi', 'tuan tinh te',
        'tuan nhe nhang'
    ];
    
    const randomFood = foodNames[Math.floor(Math.random() * foodNames.length)];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    document.getElementById('order-recipient').value = `${randomFood} ${randomAdj}`;
}

// Generate random address
function generateAddress() {
    const recipientName = document.getElementById('order-recipient').value;
    
    if (!recipientName) {
        alert('Vui lòng tạo tên người nhận trước!');
        return;
    }
    
    // Extract username from recipient name (last word)
    const words = recipientName.trim().split(' ');
    const username = words[words.length - 1];
    
    const addresses = [
        '50/40, Mễ Trì Thượng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội',
        '50/40 Mễ Trì Thượng , Mễ Trì,  Phường Từ Liêm, Hà Nội',
        'Ngõ 116 miếu đầm , Mễ Trì,  Phường Từ Liêm, Hà Nội'
    ];
    
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    
    // Format: tên món ăn(username), địa chỉ
    document.getElementById('order-address').value = `${recipientName}(${username}), ${randomAddress}`;
}
}
async function showAddOrderModal() {
    document.getElementById('order-modal-title').textContent = 'Thêm Đơn Hàng';
    document.getElementById('order-form').reset();
    document.getElementById('order-id').value = '';
    await loadProductsToDropdown();
    document.getElementById('order-modal').style.display = 'block';
}

async function editOrder(id) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/orders`);
        const orders = await response.json();
        const order = orders.find(o => o.id === id);
        
        if (order) {
            await loadProductsToDropdown();
            document.getElementById('order-modal-title').textContent = 'Sửa Đơn Hàng';
            document.getElementById('order-id').value = order.id;
            document.getElementById('order-recipient').value = order.recipient_name || '';
            document.getElementById('order-address').value = order.address || '';
            document.getElementById('order-product-name').value = order.product_name || '';
            document.getElementById('order-product-category').value = order.product_category || '';
            document.getElementById('order-quantity').value = order.quantity || '';
            document.getElementById('order-date').value = order.order_date || '';
            document.getElementById('order-status').value = order.status || 'Chờ đặt';
            document.getElementById('order-tracking').value = order.tracking_number || '';
            document.getElementById('order-payment').value = order.payment_status || 'Chưa thanh toán';
            document.getElementById('order-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading order:', error);
        alert('Lỗi khi tải thông tin đơn hàng');
    } finally {
        hideLoading();
    }
}

async function saveOrder(event) {
    event.preventDefault();
    
    const id = document.getElementById('order-id').value;
    const orderData = {
        recipient_name: document.getElementById('order-recipient').value,
        address: document.getElementById('order-address').value,
        product_name: document.getElementById('order-product-name').value,
        product_category: document.getElementById('order-product-category').value,
        quantity: document.getElementById('order-quantity').value || null,
        order_date: document.getElementById('order-date').value,
        status: document.getElementById('order-status').value,
        tracking_number: document.getElementById('order-tracking').value,
        payment_status: document.getElementById('order-payment').value
    };
    
    try {
        showLoading();
        const url = id ? `${API_URL}/orders/${id}` : `${API_URL}/orders`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            closeOrderModal();
            loadOrders();
            alert(id ? 'Cập nhật đơn hàng thành công!' : 'Thêm đơn hàng thành công!');
        } else {
            alert('Lỗi khi lưu đơn hàng');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        alert('Lỗi khi lưu đơn hàng');
    } finally {
        hideLoading();
    }
}

async function deleteOrder(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadOrders();
            alert('Xóa đơn hàng thành công!');
        } else {
            alert('Lỗi khi xóa đơn hàng');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Lỗi khi xóa đơn hàng');
    } finally {
        hideLoading();
    }
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

async function updateOrderTracking(id) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/orders/${id}/update-tracking`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            loadOrders();
            alert('Cập nhật tracking thành công!');
        } else {
            alert('Lỗi khi cập nhật tracking: ' + result.error);
        }
    } catch (error) {
        console.error('Error updating tracking:', error);
        alert('Lỗi khi cập nhật tracking');
    } finally {
        hideLoading();
    }
}

async function updateAllTracking() {
    if (!confirm('Bạn có chắc chắn muốn cập nhật tất cả tracking? Quá trình này có thể mất vài phút.')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/orders/update-all-tracking`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            loadOrders();
            alert(result.message);
        } else {
            alert('Lỗi khi cập nhật tracking');
        }
    } catch (error) {
        console.error('Error updating all tracking:', error);
        alert('Lỗi khi cập nhật tracking');
    } finally {
        hideLoading();
    }
}

// Products Management
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Lỗi khi tải danh sách sản phẩm');
    } finally {
        hideLoading();
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name || ''}</td>
            <td>${product.category || ''}</td>
            <td>${product.quantity || 0}</td>
            <td>${product.link ? `<a href="${product.link}" target="_blank" class="product-link">🔗 Link</a>` : ''}</td>
            <td>${product.discount_code || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const rows = document.querySelectorAll('#products-tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showAddProductModal() {
    document.getElementById('product-modal-title').textContent = 'Thêm Sản Phẩm';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').style.display = 'block';
}

async function editProduct(id) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const product = products.find(p => p.id === id);
        
        if (product) {
            document.getElementById('product-modal-title').textContent = 'Sửa Sản Phẩm';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-category').value = product.category || '';
            document.getElementById('product-quantity').value = product.quantity || 0;
            document.getElementById('product-link').value = product.link || '';
            document.getElementById('product-discount').value = product.discount_code || '';
            document.getElementById('product-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Lỗi khi tải thông tin sản phẩm');
    } finally {
        hideLoading();
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        quantity: document.getElementById('product-quantity').value || 0,
        link: document.getElementById('product-link').value,
        discount_code: document.getElementById('product-discount').value
    };
    
    try {
        showLoading();
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            closeProductModal();
            loadProducts();
            alert(id ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        } else {
            alert('Lỗi khi lưu sản phẩm');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Lỗi khi lưu sản phẩm');
    } finally {
        hideLoading();
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProducts();
            alert('Xóa sản phẩm thành công!');
        } else {
            alert('Lỗi khi xóa sản phẩm');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Lỗi khi xóa sản phẩm');
    } finally {
        hideLoading();
    }
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const orderModal = document.getElementById('order-modal');
    const productModal = document.getElementById('product-modal');
    const importModal = document.getElementById('import-modal');
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
    if (event.target === productModal) {
        closeProductModal();
    }
    if (event.target === importModal) {
        closeImportModal();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

// Made with Bob

// Import functionality
function showImportModal() {
    document.getElementById('import-modal').style.display = 'block';
    document.getElementById('import-data').value = '';
    document.getElementById('preview-content').innerHTML = '';
    document.getElementById('preview-count').textContent = '0';
}

function closeImportModal() {
    document.getElementById('import-modal').style.display = 'none';
}

// Parse TSV data and show preview
document.getElementById('import-data')?.addEventListener('input', function() {
    const data = this.value.trim();
    if (!data) {
        document.getElementById('preview-content').innerHTML = '';
        document.getElementById('preview-count').textContent = '0';
        return;
    }
    
    const lines = data.split('\n').filter(line => line.trim());
    const orders = [];
    
    // Skip header row (first line) and process data rows
    lines.forEach((line, index) => {
        // Skip first line if it looks like a header
        if (index === 0 && (line.includes('Tên người nhận') || line.includes('Địa chỉ'))) {
            return;
        }
        
        const fields = line.split('\t');
        if (fields.length >= 2) {
            orders.push({
                recipient_name: fields[0]?.trim() || '',
                address: fields[1]?.trim() || '',
                product_name: fields[2]?.trim() || '',
                product_category: fields[3]?.trim() || '',
                quantity: fields[4]?.trim() || '',
                order_date: fields[5]?.trim() || '',
                status: fields[6]?.trim() || 'Chờ đặt',
                tracking_number: fields[7]?.trim() || '',
                tracking_info: fields[8]?.trim() || '',
                payment_status: fields[9]?.trim() || 'Chưa thanh toán'
            });
        }
    });
    
    document.getElementById('preview-count').textContent = orders.length;
    
    const previewHtml = orders.slice(0, 5).map((order, i) => `
        <div class="preview-item">
            <strong>${i + 1}.</strong>
            <strong>Người nhận:</strong> ${order.recipient_name} |
            <strong>Sản phẩm:</strong> ${order.product_name || 'N/A'} |
            <strong>Trạng thái:</strong> ${order.status}
        </div>
    `).join('');
    
    const moreText = orders.length > 5 ? `<p style="text-align: center; color: #718096; margin-top: 10px;">... và ${orders.length - 5} đơn hàng khác</p>` : '';
    
    document.getElementById('preview-content').innerHTML = previewHtml + moreText;
});

async function processImport() {
    const data = document.getElementById('import-data').value.trim();
    
    if (!data) {
        alert('Vui lòng nhập dữ liệu để import!');
        return;
    }
    
    const lines = data.split('\n').filter(line => line.trim());
    const orders = [];
    
    // Skip header row and process data rows
    lines.forEach((line, index) => {
        // Skip first line if it looks like a header
        if (index === 0 && (line.includes('Tên người nhận') || line.includes('Địa chỉ'))) {
            return;
        }
        
        const fields = line.split('\t');
        if (fields.length >= 2) {
            orders.push({
                recipient_name: fields[0]?.trim() || '',
                address: fields[1]?.trim() || '',
                product_name: fields[2]?.trim() || '',
                product_category: fields[3]?.trim() || '',
                quantity: fields[4]?.trim() ? parseInt(fields[4].trim()) : null,
                order_date: fields[5]?.trim() || '',
                status: fields[6]?.trim() || 'Chờ đặt',
                tracking_number: fields[7]?.trim() || '',
                tracking_info: '', // Will be fetched from API if tracking number exists
                payment_status: fields[9]?.trim() || 'Chưa thanh toán'
            });
        }
    });
    
    if (orders.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ!');
        return;
    }
    
    if (!confirm(`Bạn có chắc chắn muốn import ${orders.length} đơn hàng?`)) {
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/orders/bulk-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeImportModal();
            
            // Auto-update tracking info for orders with tracking numbers
            const ordersWithTracking = orders.filter(o => o.tracking_number);
            if (ordersWithTracking.length > 0) {
                alert(`✅ ${result.message}\n\n🔄 Đang cập nhật tracking cho ${ordersWithTracking.length} đơn hàng...`);
                
                // Wait a bit for database to save, then update tracking
                setTimeout(async () => {
                    await fetch(`${API_URL}/orders/update-all-tracking`, { method: 'POST' });
                    loadOrders();
                }, 1000);
            } else {
                loadOrders();
                alert(`✅ ${result.message}`);
            }
        } else {
            alert('❌ Lỗi khi import: ' + result.error);
        }
    } catch (error) {
        console.error('Error importing orders:', error);
        alert('❌ Lỗi khi import dữ liệu');
    } finally {
        hideLoading();
    }
}

// Product Import Functions
function showImportProductModal() {
    document.getElementById('import-product-modal').style.display = 'block';
    document.getElementById('import-product-data').value = '';
    document.getElementById('product-preview-count').textContent = '0';
    document.getElementById('product-preview-content').innerHTML = '';
}

function closeImportProductModal() {
    document.getElementById('import-product-modal').style.display = 'none';
}

// Preview product import data
document.getElementById('import-product-data')?.addEventListener('input', function() {
    const data = this.value.trim();
    if (!data) {
        document.getElementById('product-preview-count').textContent = '0';
        document.getElementById('product-preview-content').innerHTML = '';
        return;
    }
    
    const lines = data.split('\n').filter(line => line.trim());
    const products = [];
    
    lines.forEach((line, index) => {
        // Skip header row
        if (index === 0 && (line.includes('Tên') || line.includes('Phân loại') || line.includes('link'))) {
            return;
        }
        
        const fields = line.split('\t');
        if (fields.length >= 1 && fields[0]?.trim()) {
            products.push({
                name: fields[0]?.trim() || '',
                category: fields[1]?.trim() || '',
                quantity: fields[2]?.trim() ? parseInt(fields[2].trim()) : 0,
                link: fields[3]?.trim() || '',
                discount_code: fields[4]?.trim() || ''
            });
        }
    });
    
    document.getElementById('product-preview-count').textContent = products.length;
    
    const previewHtml = products.slice(0, 5).map((product, i) => `
        <div class="preview-item">
            <strong>${i + 1}.</strong>
            <strong>Tên:</strong> ${product.name} |
            <strong>Phân loại:</strong> ${product.category || 'N/A'} |
            <strong>SL:</strong> ${product.quantity} |
            <strong>Mã:</strong> ${product.discount_code || 'N/A'}
        </div>
    `).join('');
    
    const moreText = products.length > 5 ? `<p style="text-align: center; color: #718096; margin-top: 10px;">... và ${products.length - 5} sản phẩm khác</p>` : '';
    
    document.getElementById('product-preview-content').innerHTML = previewHtml + moreText;
});

async function processProductImport() {
    const data = document.getElementById('import-product-data').value.trim();
    
    if (!data) {
        alert('Vui lòng nhập dữ liệu để import!');
        return;
    }
    
    const lines = data.split('\n').filter(line => line.trim());
    const products = [];
    
    // Skip header row and process data rows
    lines.forEach((line, index) => {
        // Skip first line if it looks like a header
        if (index === 0 && (line.includes('Tên') || line.includes('Phân loại') || line.includes('link'))) {
            return;
        }
        
        const fields = line.split('\t');
        if (fields.length >= 1 && fields[0]?.trim()) {
            products.push({
                name: fields[0]?.trim() || '',
                category: fields[1]?.trim() || '',
                quantity: fields[2]?.trim() ? parseInt(fields[2].trim()) : 0,
                link: fields[3]?.trim() || '',
                discount_code: fields[4]?.trim() || ''
            });
        }
    });
    
    if (products.length === 0) {
        alert('Không tìm thấy dữ liệu hợp lệ!');
        return;
    }
    
    if (!confirm(`Bạn có chắc chắn muốn import ${products.length} sản phẩm?`)) {
        return;
    }
    
    try {
        showLoading();
        const response = await fetch(`${API_URL}/products/bulk-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeImportProductModal();
            loadProducts();
            alert(`✅ ${result.message}`);
        } else {
            alert('❌ Lỗi khi import: ' + result.error);
        }
    } catch (error) {
        console.error('Error importing products:', error);
        alert('❌ Lỗi khi import dữ liệu');
    } finally {
        hideLoading();
    }
}

// Make functions globally available for inline event handlers
window.makeEditable = function(cell, orderId) {
    if (typeof makeEditableImpl === 'function') {
        makeEditableImpl(cell, orderId);
    }
};

window.makeEditableSelect = function(cell, orderId, options) {
    if (typeof makeEditableSelectImpl === 'function') {
        makeEditableSelectImpl(cell, orderId, options);
    }
};

window.sortTable = function(column) {
    if (typeof sortTableImpl === 'function') {
        sortTableImpl(column);
    }
};
