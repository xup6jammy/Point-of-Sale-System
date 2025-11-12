// 全局變量
let products = [];
let sales = [];
let saleToDeleteIndex = -1;

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    renderProducts();
    renderSales();
    updateStatistics();

    // 綁定搜索框的即時搜索
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProductsAdmin();
        });
    }
});

// 載入本地數據
function loadLocalData() {
    const storedData = localStorage.getItem('posData');
    if (storedData) {
        const data = JSON.parse(storedData);
        products = data.products || [];
        sales = data.sales || [];
    }
}

// 從 JSON 檔案載入數據
function loadJSONFile() {
    const fileInput = document.getElementById('jsonFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('請選擇 JSON 檔案');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.products || !Array.isArray(data.products)) {
                alert('JSON 檔案格式錯誤：缺少 products 陣列');
                return;
            }

            // 載入商品數據
            products = data.products;

            // 保留現有的銷售記錄，或從檔案載入
            if (data.sales && Array.isArray(data.sales)) {
                sales = data.sales;
            }

            // 保存到 localStorage
            saveData();

            // 重新渲染
            renderProducts();
            renderSales();
            updateStatistics();

            alert('數據載入成功！');
            fileInput.value = ''; // 清空檔案選擇
        } catch (error) {
            alert('JSON 檔案解析失敗: ' + error.message);
        }
    };

    reader.readAsText(file);
}


// 保存數據到 localStorage
function saveData() {
    const data = {
        products: products,
        sales: sales
    };
    localStorage.setItem('posData', JSON.stringify(data));
}

// 渲染商品列表
function renderProducts(filteredProducts = null) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    const productsToRender = filteredProducts || products;

    productsToRender.forEach((product, index) => {
        // 如果是過濾後的產品，需要找到原始索引
        const originalIndex = products.findIndex(p => p.id === product.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>
                <input type="text" value="${product.name}" id="name-${originalIndex}" onchange="updateProduct(${originalIndex}, 'name', this.value)">
            </td>
            <td>
                <input type="number" value="${product.price}" id="price-${originalIndex}" min="0" onchange="updateProduct(${originalIndex}, 'price', parseFloat(this.value))">
            </td>
            <td>
                <button class="edit-btn" onclick="confirmUpdate(${originalIndex})">確認修改</button>
                <button class="delete-btn" onclick="deleteProduct(${originalIndex})">刪除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // 如果沒有商品顯示提示
    if (productsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">找不到相關商品</td></tr>';
    }
}

// 更新商品資料（即時更新內存中的數據）
function updateProduct(index, field, value) {
    products[index][field] = value;
}

// 確認修改並保存
function confirmUpdate(index) {
    saveData();
    alert('商品資料已更新');
    renderProducts();
}

// 刪除商品
function deleteProduct(index) {
    if (confirm('確定要刪除此商品嗎？')) {
        products.splice(index, 1);
        saveData();
        renderProducts();
    }
}

// 新增商品
function addProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value);

    if (!name) {
        alert('請輸入商品名稱');
        return;
    }

    if (isNaN(price) || price < 0) {
        alert('請輸入有效的價格');
        return;
    }

    // 生成新的 ID（取最大 ID + 1）
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        name: name,
        price: price
    };

    products.push(newProduct);
    saveData();
    renderProducts();

    // 清空輸入框
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';

    alert('商品新增成功');
}

// 渲染銷售記錄
function renderSales() {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';

    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">暫無銷售記錄</td></tr>';
        return;
    }

    // 反向顯示（最新的在上面）
    [...sales].reverse().forEach((sale, reverseIndex) => {
        const tr = document.createElement('tr');
        const originalIndex = sales.length - 1 - reverseIndex;

        // 組合商品明細 - 每個商品一行
        const itemsDetails = sale.items.map(item => {
            const itemTotal = item.price * item.quantity;
            const itemDiscount = item.discount || 0;
            const itemFinalTotal = itemTotal - itemDiscount;

            let itemHtml = `${item.name} ×${item.quantity} ($${item.price} = $${itemTotal})`;

            // 如果有折扣，顯示折扣後價格
            if (itemDiscount > 0) {
                itemHtml += ` <span style="color: #ff9800;">→ $${itemFinalTotal}</span>`;
                if (item.discountNote) {
                    itemHtml += `<br><small style="color: #999;">${item.discountNote}</small>`;
                }
            }

            return itemHtml;
        }).join('<br>');

        // 折扣和備註顯示
        const discount = sale.discount || 0;
        const discountNote = sale.discountNote || '-';

        tr.innerHTML = `
            <td>${sale.date}</td>
            <td style="line-height: 1.8;">${itemsDetails}</td>
            <td>${discount > 0 ? '-$' + discount : '-'}</td>
            <td style="white-space: pre-wrap; max-width: 200px;">${discountNote}</td>
            <td>$${sale.total}</td>
            <td>$${sale.received}</td>
            <td>$${sale.change.toFixed(0)}</td>
            <td><button class="delete-sale-btn" onclick="showDeleteSaleModal(${originalIndex})">✕</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// 更新統計數據
function updateStatistics() {
    let totalSales = 0;
    let totalItems = 0;

    sales.forEach(sale => {
        totalSales += sale.total;
        sale.items.forEach(item => {
            totalItems += item.quantity;
        });
    });

    document.getElementById('totalSales').textContent = `$${totalSales}`;
    document.getElementById('totalOrders').textContent = sales.length;
    document.getElementById('totalItems').textContent = totalItems;
}

// 導出為 CSV 格式 (可用 Excel 開啟)
function exportToCSV() {
    if (sales.length === 0) {
        alert('沒有銷售記錄可以導出');
        return;
    }

    // CSV 標題行
    let csv = '\uFEFF'; // UTF-8 BOM，讓 Excel 正確識別中文
    csv += '序號,時間,商品名稱,單價,數量,小計,商品折扣,折扣備註,折扣後金額,訂單總額\n';

    let totalQuantity = 0;
    let totalAmount = 0;
    let totalDiscount = 0;

    // 處理每筆銷售記錄
    sales.forEach((sale, saleIndex) => {
        sale.items.forEach((item, itemIndex) => {
            const itemSubtotal = item.price * item.quantity;
            const itemDiscount = item.discount || 0;
            const itemFinalAmount = itemSubtotal - itemDiscount;
            const itemDiscountNote = item.discountNote || '';

            const row = [
                saleIndex + 1,
                sale.date,
                `"${item.name}"`, // 使用雙引號包裹以處理逗號
                item.price,
                item.quantity,
                itemSubtotal,
                itemDiscount > 0 ? itemDiscount : '', // 每個商品自己的折扣
                itemDiscount > 0 ? `"${itemDiscountNote}"` : '', // 每個商品的折扣備註
                itemFinalAmount, // 折扣後金額
                itemIndex === 0 ? sale.total : '' // 只在第一行顯示訂單總額
            ];
            csv += row.join(',') + '\n';

            // 累計總數量、總金額和總折扣
            totalQuantity += item.quantity;
            totalAmount += itemSubtotal;
            totalDiscount += itemDiscount;
        });

        // 添加空行分隔不同訂單
        csv += '\n';
    });

    // 添加總計行
    csv += `,,總計,,${totalQuantity},${totalAmount},${totalDiscount},,${totalAmount - totalDiscount},\n`;

    // 下載檔案
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `銷售記錄_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    alert('CSV 檔案已導出，可用 Excel 開啟');
}


// 顯示清空緩存確認彈窗
function showClearCacheModal() {
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
    sales = [];

    // 更新顯示
    renderProducts();
    renderSales();
    updateStatistics();

    // 關閉彈窗
    closeClearCacheModal();

    // 提示用戶
    alert('✓ 緩存已清空！\n\n請重新載入 JSON 檔案來導入商品數據。');
}

// 搜索商品（後台）
function searchProductsAdmin() {
    const searchTerm = document.getElementById('productSearchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        renderProducts();
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.id.toString().includes(searchTerm)
    );

    renderProducts(filteredProducts);
}

// 清空搜索（後台）
function clearSearchAdmin() {
    document.getElementById('productSearchInput').value = '';
    renderProducts();
}

// 顯示刪除銷售記錄確認彈窗
function showDeleteSaleModal(index) {
    saleToDeleteIndex = index;
    const modal = document.getElementById('deleteSaleModal');
    modal.classList.add('show');
}

// 關閉刪除銷售記錄彈窗
function closeDeleteSaleModal() {
    saleToDeleteIndex = -1;
    const modal = document.getElementById('deleteSaleModal');
    modal.classList.remove('show');
}

// 確認刪除銷售記錄
function confirmDeleteSale() {
    if (saleToDeleteIndex !== -1) {
        sales.splice(saleToDeleteIndex, 1);
        saveData();
        renderSales();
        updateStatistics();
        closeDeleteSaleModal();
        alert('銷售記錄已刪除');
    }
}
