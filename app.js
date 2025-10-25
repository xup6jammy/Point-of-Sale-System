// 全局變量
let products = [];
let currentOrder = [];
let totalAmount = 0;
let originalTotalAmount = 0;
let discountMode = 'percent'; // 'percent' 或 'amount'
let currentDiscountItemIndex = -1; // 當前正在設定折扣的商品索引
let currentPriceModifyItemIndex = -1; // 當前正在修改價格的商品索引

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateHeaderTime();
    updateTodayStats();
    // 每秒更新時間
    setInterval(updateHeaderTime, 1000);

    // 綁定搜索框的即時搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProducts();
        });
    }

    // 綁定收款金額的即時計算找零
    const receivedAmountInput = document.getElementById('receivedAmount');
    if (receivedAmountInput) {
        receivedAmountInput.addEventListener('input', function() {
            calculateChangeAuto();
        });
    }
});

// 更新標題時間
function updateHeaderTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('headerTime').textContent = timeString;
}

// 載入數據
function loadData() {
    // 從 localStorage 載入數據
    const storedData = localStorage.getItem('posData');

    if (storedData) {
        const data = JSON.parse(storedData);
        products = data.products || [];
        renderProducts();
        alert('數據已從本地儲存載入');
    } else {
        // 如果沒有本地數據，提示用戶需要從 JSON 檔案載入
        alert('請先到後台管理頁面載入數據檔案 (data.json)');
    }
}

// 渲染商品列表
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const button = document.createElement('button');
        button.className = 'product-btn';
        button.onclick = () => addToOrder(product);

        button.innerHTML = `
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price}</div>
        `;

        productsGrid.appendChild(button);
    });
}

// 添加商品到訂單
function addToOrder(product) {
    // 檢查訂單中是否已有該商品
    const existingItem = currentOrder.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.price, // 保存原始價格
            quantity: 1,
            discount: 0,
            discountNote: '',
            priceModified: false // 標記價格是否被修改過
        });
    }

    updateOrderDisplay();
}

// 更新訂單顯示
function updateOrderDisplay(resetDiscount = false) {
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = '';

    originalTotalAmount = 0;
    totalAmount = 0;
    let totalDiscount = 0;

    currentOrder.forEach((item, index) => {
        const itemOriginalTotal = item.price * item.quantity;
        const itemDiscount = item.discount || 0;
        const itemFinalTotal = itemOriginalTotal - itemDiscount;

        originalTotalAmount += itemOriginalTotal;
        totalAmount += itemFinalTotal;
        totalDiscount += itemDiscount;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';

        // 構建折扣標籤
        const discountBadge = itemDiscount > 0
            ? '<span class="discount-badge">折扣</span>'
            : '';

        // 構建價格顯示
        const priceModifiedBadge = item.priceModified
            ? '<span class="price-modified-badge">改價</span>'
            : '';

        let priceDisplay = `$${item.price} × ${item.quantity} = $${itemOriginalTotal}`;
        if (itemDiscount > 0) {
            priceDisplay += ` <span class="discount-arrow">→</span> <span class="discounted-price">$${itemFinalTotal}</span>`;
        }

        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name-row">
                    ${discountBadge}
                    ${priceModifiedBadge}
                    <div class="item-name">${item.name}</div>
                </div>
                <div class="item-details">${priceDisplay}</div>
                ${itemDiscount > 0 ? `<div class="item-discount-note">折扣: -$${itemDiscount} ${item.discountNote ? '(' + item.discountNote + ')' : ''}</div>` : ''}
            </div>
            <div class="item-controls">
                <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
                <button class="item-price-btn" onclick="showModifyPriceModal(${index})" title="修改價格">$</button>
                <button class="item-discount-btn" onclick="showItemDiscountModal(${index})" title="設定折扣">%</button>
                <button class="item-remove" onclick="removeFromOrder(${index})">移除</button>
            </div>
        `;

        orderItems.appendChild(itemDiv);
    });

    // 隱藏舊的全局折扣區域和按鈕
    document.getElementById('orderDiscountSection').style.display = 'none';
    document.getElementById('discountBtn').style.display = 'none';

    // 更新總計顯示
    if (totalDiscount > 0) {
        document.getElementById('totalAmount').innerHTML = `
            <span style="text-decoration: line-through; opacity: 0.6; font-size: 0.8em;">$${originalTotalAmount}</span>
            <span style="color: #fff; margin-left: 8px;">$${totalAmount}</span>
        `;
    } else {
        document.getElementById('totalAmount').textContent = `$${totalAmount}`;
    }

    // 重新計算找零
    calculateChangeAuto();
}

// 增加數量
function increaseQuantity(index) {
    const item = currentOrder[index];
    item.quantity++;
    updateOrderDisplay();
}

// 減少數量
function decreaseQuantity(index) {
    const item = currentOrder[index];

    if (item.quantity > 1) {
        item.quantity--;
        updateOrderDisplay();
    } else {
        // 如果數量為1，減少就是移除
        removeFromOrder(index);
    }
}

// 從訂單中移除商品
function removeFromOrder(index) {
    currentOrder.splice(index, 1);
    updateOrderDisplay();
}

// 顯示通知訊息
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageSpan = document.getElementById('notificationMessage');
    const icon = notification.querySelector('.icon');

    // 設置訊息內容
    messageSpan.textContent = message;

    // 設置圖示和樣式
    if (type === 'success') {
        icon.textContent = '✓';
        notification.className = 'notification success';
    } else if (type === 'error') {
        icon.textContent = '✕';
        notification.className = 'notification error';
    }

    // 顯示通知
    notification.classList.add('show');

    // 3秒後自動隱藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 自動計算找零（即時）
function calculateChangeAuto() {
    const receivedAmount = parseFloat(document.getElementById('receivedAmount').value);
    const changeDisplay = document.querySelector('.change-display');
    const changeAmountElement = document.getElementById('changeAmount');

    // 如果輸入為空或無效，顯示 $0
    if (isNaN(receivedAmount) || receivedAmount < 0) {
        changeAmountElement.textContent = '$0';
        changeDisplay.classList.remove('active');
        changeDisplay.classList.remove('negative');
        return;
    }

    // 計算找零（包含負數情況）
    const change = receivedAmount - totalAmount;

    // 如果金額不足，顯示負數
    if (change < 0) {
        changeAmountElement.textContent = `-$${Math.abs(change).toFixed(0)}`;
        changeDisplay.classList.add('negative');
        changeDisplay.classList.remove('active');
    } else {
        // 金額足夠，顯示正數找零
        changeAmountElement.textContent = `$${change.toFixed(0)}`;
        changeDisplay.classList.remove('negative');
        changeDisplay.classList.add('active');
        setTimeout(() => {
            changeDisplay.classList.remove('active');
        }, 500);
    }
}

// 計算找零（保留舊函數以防其他地方調用）
function calculateChange() {
    calculateChangeAuto();
    // 顯示計算完成通知
    const receivedAmount = parseFloat(document.getElementById('receivedAmount').value);
    if (!isNaN(receivedAmount) && receivedAmount >= totalAmount) {
        const change = receivedAmount - totalAmount;
        showNotification(`找零計算完成：$${change.toFixed(0)}`);
    }
}

// 完成訂單
function completeOrder() {
    if (currentOrder.length === 0) {
        alert('訂單為空！');
        return;
    }

    const receivedAmount = parseFloat(document.getElementById('receivedAmount').value);

    // 檢查是否輸入了金額
    if (isNaN(receivedAmount) || receivedAmount <= 0) {
        alert('請輸入收取金額！');
        return;
    }

    // 檢查金額是否足夠
    if (receivedAmount < totalAmount) {
        showErrorModal(totalAmount, receivedAmount);
        return;
    }

    // 計算總折扣和收集折扣備註
    let totalDiscount = 0;
    let discountNotes = [];
    currentOrder.forEach(item => {
        if (item.discount && item.discount > 0) {
            totalDiscount += item.discount;
            if (item.discountNote) {
                discountNotes.push(`${item.name}: ${item.discountNote}`);
            }
        }
    });

    // 記錄銷售
    const sale = {
        date: new Date().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        items: [...currentOrder],
        originalTotal: originalTotalAmount,
        discount: totalDiscount,
        discountNote: discountNotes.length > 0 ? discountNotes.join('; ') : '',
        total: totalAmount,
        received: receivedAmount,
        change: receivedAmount - totalAmount
    };

    // 保存到 localStorage
    const storedData = JSON.parse(localStorage.getItem('posData')) || { products: [], sales: [] };
    storedData.products = products;
    storedData.sales = storedData.sales || [];
    storedData.sales.push(sale);
    localStorage.setItem('posData', JSON.stringify(storedData));

    // 顯示交易完成彈跳視窗
    showTransactionModal(sale);

    // 更新今日統計
    updateTodayStats();

    // 清空訂單
    clearOrder();
}

// 顯示交易完成彈跳視窗
function showTransactionModal(sale) {
    // 填充交易資訊
    document.getElementById('modalTime').textContent = sale.date;

    // 計算商品總數量
    const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('modalItemCount').textContent = `${totalItems} 件`;

    document.getElementById('modalReceived').textContent = `$${sale.received}`;
    document.getElementById('modalChange').textContent = `$${sale.change.toFixed(0)}`;
    document.getElementById('modalTotal').textContent = `$${sale.total}`;

    // 填充商品明細
    const itemsList = document.getElementById('modalItemsList');
    itemsList.innerHTML = '';
    sale.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'transaction-item';
        itemDiv.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>$${item.price * item.quantity}</span>
        `;
        itemsList.appendChild(itemDiv);
    });

    // 顯示彈跳視窗
    const modal = document.getElementById('transactionModal');
    modal.classList.add('show');
}

// 關閉交易完成彈跳視窗
function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    modal.classList.remove('show');
}

// 顯示金額不足彈跳視窗
function showErrorModal(totalAmount, receivedAmount) {
    document.getElementById('errorTotalAmount').textContent = `$${totalAmount}`;
    document.getElementById('errorReceivedAmount').textContent = `$${receivedAmount}`;
    const shortAmount = totalAmount - receivedAmount;
    document.getElementById('errorShortAmount').textContent = `$${shortAmount.toFixed(0)}`;

    const modal = document.getElementById('errorModal');
    modal.classList.add('show');
}

// 關閉錯誤彈跳視窗
function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('show');
}

// 清空訂單
function clearOrder() {
    currentOrder = [];
    totalAmount = 0;
    originalTotalAmount = 0;
    updateOrderDisplay(true);
    updateTodayStats();
}

// 搜索商品
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    // 過濾商品
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );

    // 如果沒有搜索結果
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">找不到相關商品</div>';
        return;
    }

    // 渲染過濾後的商品
    filteredProducts.forEach(product => {
        const button = document.createElement('button');
        button.className = 'product-btn';
        button.onclick = () => addToOrder(product);

        // 高亮匹配的文字
        let displayName = product.name;
        if (searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayName = product.name.replace(regex, '<mark style="background: #ffeb3b; padding: 2px 0;">$1</mark>');
        }

        button.innerHTML = `
            <div class="product-name">${displayName}</div>
            <div class="product-price">$${product.price}</div>
        `;

        productsGrid.appendChild(button);
    });
}

// 清空搜索
function clearSearch() {
    document.getElementById('searchInput').value = '';
    renderProducts();
}

// 顯示清空緩存確認彈窗
function clearCache() {
    const modal = document.getElementById('clearCacheModal');
    modal.classList.add('show');
}

// 關閉清空緩存彈窗
function closeClearCacheModal() {
    const modal = document.getElementById('clearCacheModal');
    modal.classList.remove('show');
}

// 確認清空緩存
function confirmClearCache() {
    // 清空 localStorage
    localStorage.removeItem('posData');

    // 重置全局變量
    products = [];
    currentOrder = [];
    totalAmount = 0;

    // 更新顯示
    renderProducts();
    updateOrderDisplay();
    updateTodayStats();

    // 關閉彈窗
    closeClearCacheModal();

    // 顯示通知
    showNotification('緩存已清空，請到後台管理載入數據', 'success');
}

// 切換折扣模式
function switchDiscountMode(mode) {
    discountMode = mode;

    // 更新按鈕狀態
    document.getElementById('percentModeBtn').classList.toggle('active', mode === 'percent');
    document.getElementById('amountModeBtn').classList.toggle('active', mode === 'amount');

    // 更新UI顯示
    const discountValueLabel = document.getElementById('discountValueLabel');
    const discountHint = document.getElementById('discountHint');
    const discountValueInput = document.getElementById('discountValue');
    const quickButtons = document.getElementById('percentQuickButtons');

    if (mode === 'percent') {
        discountValueLabel.textContent = '折扣百分比 (%):';
        discountValueInput.placeholder = '輸入折扣百分比';
        discountValueInput.max = 100;
        discountHint.textContent = '例如：輸入 15 代表打 85 折';
        quickButtons.style.display = 'block';
    } else {
        discountValueLabel.textContent = '折扣金額:';
        discountValueInput.placeholder = '輸入折扣金額';
        discountValueInput.max = originalTotalAmount;
        discountHint.textContent = '例如：輸入 100 代表折扣 $100';
        quickButtons.style.display = 'none';
    }

    // 清空輸入值和 active 狀態
    discountValueInput.value = '';
    const quickDiscountButtons = document.querySelectorAll('.quick-discount-btn');
    quickDiscountButtons.forEach(btn => btn.classList.remove('active'));
    updateDiscountCalculation();
}

// 應用快捷折扣
function applyQuickDiscount(percent) {
    document.getElementById('discountValue').value = percent;

    // 移除所有快捷按鈕的 active 狀態
    const quickButtons = document.querySelectorAll('.quick-discount-btn');
    quickButtons.forEach(btn => btn.classList.remove('active'));

    // 為被點擊的按鈕添加 active 狀態
    const clickedButton = document.querySelector(`.quick-discount-btn[data-percent="${percent}"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    updateDiscountCalculation();
}

// 取消快捷折扣
function cancelQuickDiscount() {
    // 清空折扣輸入
    document.getElementById('discountValue').value = '';

    // 移除所有快捷按鈕的 active 狀態
    const quickButtons = document.querySelectorAll('.quick-discount-btn');
    quickButtons.forEach(btn => btn.classList.remove('active'));

    // 更新計算
    updateDiscountCalculation();
}

// 顯示修改價格彈窗
function showModifyPriceModal(itemIndex) {
    currentPriceModifyItemIndex = itemIndex;
    const item = currentOrder[itemIndex];

    // 填充信息
    document.getElementById('modifyPriceItemName').textContent = item.name;
    document.getElementById('modifyPriceOriginal').textContent = `$${item.originalPrice}`;
    document.getElementById('modifyPriceCurrent').textContent = `$${item.price}`;
    document.getElementById('modifyPriceQuantity').textContent = item.quantity;

    // 設置輸入框的當前值
    const newPriceInput = document.getElementById('newPriceInput');
    newPriceInput.value = item.price;

    // 更新預覽
    updatePriceModificationPreview();

    // 綁定即時預覽
    newPriceInput.oninput = updatePriceModificationPreview;

    // 顯示彈窗
    const modal = document.getElementById('modifyPriceModal');
    modal.classList.add('show');
}

// 更新價格修改預覽
function updatePriceModificationPreview() {
    if (currentPriceModifyItemIndex < 0) return;

    const item = currentOrder[currentPriceModifyItemIndex];
    const newPrice = parseFloat(document.getElementById('newPriceInput').value) || 0;
    const newTotal = newPrice * item.quantity;

    document.getElementById('modifyPriceNewTotal').textContent = `$${newTotal}`;
}

// 關閉修改價格彈窗
function closeModifyPriceModal() {
    currentPriceModifyItemIndex = -1;
    const modal = document.getElementById('modifyPriceModal');
    modal.classList.remove('show');
}

// 應用價格修改
function applyPriceModification() {
    if (currentPriceModifyItemIndex < 0 || currentPriceModifyItemIndex >= currentOrder.length) {
        alert('無效的商品索引！');
        return;
    }

    const item = currentOrder[currentPriceModifyItemIndex];
    const newPrice = parseFloat(document.getElementById('newPriceInput').value);

    // 驗證價格
    if (isNaN(newPrice) || newPrice < 0) {
        alert('請輸入有效的價格（0或正數）！');
        return;
    }

    // 應用新價格
    const oldPrice = item.price;
    item.price = newPrice;
    item.priceModified = (newPrice !== item.originalPrice);

    // 更新顯示
    updateOrderDisplay();

    // 關閉彈窗
    closeModifyPriceModal();

    // 顯示通知
    if (item.priceModified) {
        showNotification(`已修改「${item.name}」價格：$${oldPrice} → $${newPrice}`, 'success');
    } else {
        showNotification(`已將「${item.name}」價格還原為原價 $${newPrice}`, 'success');
    }
}

// 顯示單個商品的折扣彈窗
function showItemDiscountModal(itemIndex) {
    currentDiscountItemIndex = itemIndex;
    const item = currentOrder[itemIndex];
    const itemOriginalTotal = item.price * item.quantity;

    // 更新彈窗標題
    document.querySelector('#discountModal .modal-header h2').textContent = `設定折扣 - ${item.name}`;

    // 填充商品明細
    const itemsList = document.getElementById('discountItemsList');
    itemsList.innerHTML = `
        <div class="discount-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>$${itemOriginalTotal}</span>
        </div>
    `;

    // 設置原價總計
    document.getElementById('discountOriginalTotal').textContent = `$${itemOriginalTotal}`;

    // 重置為百分比模式
    discountMode = 'percent';
    switchDiscountMode('percent');

    // 清空所有快捷按鈕的 active 狀態
    const quickButtons = document.querySelectorAll('.quick-discount-btn');
    quickButtons.forEach(btn => btn.classList.remove('active'));

    // 設置當前折扣值
    document.getElementById('discountValue').value = '';
    document.getElementById('discountNote').value = item.discountNote || '';

    // 更新折扣後總計
    updateItemDiscountCalculation(itemOriginalTotal);

    // 綁定折扣輸入的即時計算
    const discountValueInput = document.getElementById('discountValue');
    discountValueInput.oninput = () => updateItemDiscountCalculation(itemOriginalTotal);

    // 顯示彈窗
    const modal = document.getElementById('discountModal');
    modal.classList.add('show');
}

// 更新單個商品的折扣計算
function updateItemDiscountCalculation(itemOriginalTotal) {
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    let discountAmount = 0;

    if (discountMode === 'percent') {
        // 百分比模式：計算百分比折扣
        discountAmount = Math.round(itemOriginalTotal * (discountValue / 100));
    } else {
        // 固定金額模式：直接使用輸入的金額
        discountAmount = discountValue;
    }

    // 確保折扣金額不超過原價總計
    discountAmount = Math.min(discountAmount, itemOriginalTotal);

    const finalTotal = Math.max(0, itemOriginalTotal - discountAmount);

    document.getElementById('discountAmountPreview').textContent = `-$${discountAmount}`;
    document.getElementById('discountFinalTotal').textContent = `$${finalTotal}`;
}

// 舊的折扣計算函數（保留兼容性）
function updateDiscountCalculation() {
    if (currentDiscountItemIndex >= 0) {
        const item = currentOrder[currentDiscountItemIndex];
        const itemOriginalTotal = item.price * item.quantity;
        updateItemDiscountCalculation(itemOriginalTotal);
    }
}

// 關閉折扣彈窗
function closeDiscountModal() {
    const modal = document.getElementById('discountModal');
    modal.classList.remove('show');
}

// 應用折扣到單個商品
function applyDiscount() {
    if (currentDiscountItemIndex < 0 || currentDiscountItemIndex >= currentOrder.length) {
        alert('無效的商品索引！');
        return;
    }

    const item = currentOrder[currentDiscountItemIndex];
    const itemOriginalTotal = item.price * item.quantity;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const discountNote = document.getElementById('discountNote').value.trim();

    let discountAmount = 0;
    let discountDescription = '';

    if (discountMode === 'percent') {
        // 百分比模式
        if (discountValue < 0 || discountValue > 100) {
            alert('折扣百分比必須在 0-100 之間！');
            return;
        }
        discountAmount = Math.round(itemOriginalTotal * (discountValue / 100));
        discountDescription = discountValue > 0 ? `${100 - discountValue}折` : '';
    } else {
        // 固定金額模式
        if (discountValue < 0) {
            alert('折扣金額不能為負數！');
            return;
        }
        if (discountValue > itemOriginalTotal) {
            alert('折扣金額不能超過商品總價！');
            return;
        }
        discountAmount = discountValue;
        discountDescription = `折扣$${discountAmount}`;
    }

    // 應用折扣到該商品
    item.discount = discountAmount;
    // 組合折扣備註：[商品折扣][使用者輸入原因]
    if (discountNote) {
        item.discountNote = `[商品折扣][${discountNote}]`;
    } else {
        item.discountNote = `[商品折扣][${discountDescription}]`;
    }

    // 更新顯示
    updateOrderDisplay();

    // 關閉彈窗
    closeDiscountModal();

    // 顯示通知
    if (discountAmount > 0) {
        const notificationMsg = discountMode === 'percent'
            ? `已為「${item.name}」套用折扣：${discountDescription} (折扣 $${discountAmount})`
            : `已為「${item.name}」套用折扣 $${discountAmount}`;
        showNotification(notificationMsg, 'success');
    } else {
        showNotification(`已取消「${item.name}」的折扣`, 'success');
    }

    // 重置當前折扣商品索引
    currentDiscountItemIndex = -1;
}

// 更新今日統計（參照 admin-section 的銷售統計算法）
function updateTodayStats() {
    const storedData = localStorage.getItem('posData');
    if (!storedData) return;

    const data = JSON.parse(storedData);
    const sales = data.sales || [];

    // 計算總銷售額、總訂單數、總商品數量（與 admin.js updateStatistics 相同邏輯）
    let totalSales = 0;
    let totalItems = 0;

    sales.forEach(sale => {
        totalSales += sale.total;
        sale.items.forEach(item => {
            totalItems += item.quantity;
        });
    });

    // 更新顯示
    const revenueElement = document.getElementById('todayRevenue');
    const quantityElement = document.getElementById('todayQuantity');
    const ordersElement = document.getElementById('totalOrders');

    if (revenueElement) {
        revenueElement.textContent = `$${totalSales}`;
    }
    if (quantityElement) {
        quantityElement.textContent = `${totalItems}`;
    }
    if (ordersElement) {
        ordersElement.textContent = `${sales.length}`;
    }
}
