// URL และ Token ใช้จาก js/config.js ไฟล์เดียว (ต้องโหลด config.js ก่อนไฟล์นี้ในหน้า .html)
const ADMIN_API_URL = APP_CONFIG.SCRIPT_URL;
const ADMIN_KNOWLEDGE_URL = ADMIN_API_URL + '?type=knowledge';

let currentItems = [];
let editingRowIndex = null; // null = กำลังเพิ่มใหม่, มีค่า = กำลังแก้ไขแถวนั้น

// ป้ายกำกับภาษาไทยของแต่ละประเภทเนื้อหา (ใช้แสดงในตาราง)
const TYPE_LABELS = {
    article: 'บทความ',
    video: 'วิดีโอ',
    activity: 'กิจกรรม',
    food: 'อาหารบำบัด'
};

// ==========================================
// เช็ครหัสผ่าน (เก็บไว้ใน sessionStorage เฉพาะแท็บนี้ ปิดแท็บแล้วต้องใส่ใหม่)
// ==========================================
async function checkAdminPassword() {
    const pw = document.getElementById('adminPasswordInput').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.querySelector('#loginGate .btn-solid-pink');

    if (!pw) {
        errorEl.innerText = 'กรุณากรอกรหัสผ่าน';
        return;
    }

    errorEl.innerText = '';
    if (btn) { btn.disabled = true; btn.innerText = 'กำลังตรวจสอบ...'; }

    try {
        const res = await fetch(ADMIN_API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'verify_admin_password', adminPassword: pw }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await res.json();

        if (result.status === 'success') {
            // รหัสถูกต้องจริง ยืนยันจาก server แล้วเท่านั้นถึงจะเก็บและโชว์แผงควบคุม
            sessionStorage.setItem('adminPassword', pw);
            document.getElementById('loginGate').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadItems();
        } else {
            errorEl.innerText = 'รหัสผ่านไม่ถูกต้อง';
        }
    } catch (err) {
        errorEl.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message;
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = 'เข้าสู่ระบบ'; }
    }
}

// ==========================================
// โหลดรายการทั้งหมดมาแสดง
// ==========================================
async function loadItems() {
    const list = document.getElementById('itemsList');
    list.innerHTML = '<p class="loading-text">กำลังโหลดข้อมูล...</p>';

    try {
        const res = await fetch(ADMIN_KNOWLEDGE_URL);
        const result = await res.json();

        if (result.status !== 'success') {
            list.innerHTML = `<p class="error-text">โหลดข้อมูลไม่สำเร็จ: ${result.message || ''}</p>`;
            return;
        }

        currentItems = result.items;
        // ให้ devtools เข้าถึงได้ง่ายขณะดีบัก
        try { window.currentItems = currentItems; } catch (e) { /* ignore */ }

        renderItemsList();
    } catch (err) {
        list.innerHTML = `<p class="error-text">เกิดข้อผิดพลาด: ${err.message}</p>`;
    }
}

// วาดรายการใหม่จาก currentItems ในหน่วยความจำ (ไม่ยิง fetch) ใช้ตอนอัปเดตสถานะแบบทันที เช่น toggleFeatured
function renderItemsList() {
    const list = document.getElementById('itemsList');

    if (currentItems.length === 0) {
        list.innerHTML = '<p class="loading-text">ยังไม่มีรายการเนื้อหา ลองกด "+ เพิ่มรายการใหม่" ได้เลย</p>';
        return;
    }

    // จัดกลุ่มตามประเภท เรียงหมวดตามลำดับที่กำหนดไว้ (บทความ, วิดีโอ, กิจกรรม, อาหารบำบัด)
    const typeOrder = ['article', 'video', 'activity', 'food'];
    const grouped = {};
    typeOrder.forEach(t => grouped[t] = []);
    currentItems.forEach(item => {
        if (!grouped[item.type]) grouped[item.type] = []; // เผื่อมี type แปลกๆ ที่ไม่รู้จัก
        grouped[item.type].push(item);
    });

    // เรียงแต่ละหมวดตามคอลัมน์ order (แปลงเป็นตัวเลขก่อน เผื่อ backend คืนเป็นสตริง)
    Object.keys(grouped).forEach(t => grouped[t].sort((a, b) => parseInt(a.order || 0) - parseInt(b.order || 0)));

    const sectionIcons = { article: '📄', video: '🎬', activity: '🧘', food: '🍽️' };

    list.innerHTML = typeOrder
        .filter(t => grouped[t] && grouped[t].length > 0)
        .map(type => `
            <div class="type-section">
                <div class="type-section-header type-${type}">
                    <span class="type-section-title">${sectionIcons[type] || ''} ${TYPE_LABELS[type] || type}</span>
                    <span class="type-section-count">${grouped[type].length} รายการ</span>
                    <button onclick="openForm('${type}')" class="btn-outline-pink small">+ เพิ่มในหมวดนี้</button>
                </div>
                <div class="type-section-items">
                    ${grouped[type].map((item, idx) => `
                        <div class="item-row type-${type}">
                            <div class="item-order-num ${isFeaturedValue(item.featured) ? 'is-featured' : ''}">
                                ${idx + 1}
                                <span class="featured-star ${isFeaturedValue(item.featured) ? '' : 'not-featured'}" onclick="toggleFeatured(${item.rowIndex}, event)" title="${isFeaturedValue(item.featured) ? 'คลิกเพื่อเอาออกจากแถบเลื่อนหน้าแรก' : 'คลิกเพื่อแสดงในแถบเลื่อนหน้าแรก'}">⭐</span>
                            </div>
                            <div class="item-info">
                                <strong>${item.title || '(ไม่มีชื่อ)'}</strong>
                            </div>
                            <div class="item-move-actions">
                                <button onclick="moveItem(${item.rowIndex}, 'up')" class="move-btn" ${idx === 0 ? 'disabled' : ''} title="ย้ายขึ้น">▲</button>
                                <button onclick="moveItem(${item.rowIndex}, 'down')" class="move-btn" ${idx === grouped[type].length - 1 ? 'disabled' : ''} title="ย้ายลง">▼</button>
                            </div>
                            <div class="item-actions">
                                <button onclick="editItem(${item.rowIndex})" class="btn-outline-pink small">แก้ไข</button>
                                <button onclick="deleteItem(${item.rowIndex})" class="btn-outline-pink small danger">ลบ</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
}

// ==========================================
// คลิกดาวตรงเลขลำดับ เพื่อติ๊ก/ยกเลิก "แสดงในแถบเลื่อนหน้าแรก" ทันที ไม่ต้องเปิดฟอร์มแก้ไข
// ==========================================
async function toggleFeatured(rowIndex, event) {
    if (event) event.stopPropagation();
    const item = currentItems.find(i => i.rowIndex === rowIndex);
    if (!item) return;

    const previousValue = item.featured;
    item.featured = !isFeaturedValue(item.featured);
    renderItemsList(); // อัปเดตหน้าจอทันที ไม่ต้องรอ network

    try {
        await persistItem(item);
    } catch (err) {
        item.featured = previousValue; // rollback ถ้าบันทึกไม่สำเร็จ
        renderItemsList();
        alert('อัปเดตไม่สำเร็จ: ' + err.message);
    }
}

// ==========================================
// ย้ายลำดับรายการขึ้น/ลง (สลับค่า order กับรายการข้างเคียงในหมวดเดียวกัน)
// ==========================================
async function moveItem(rowIndex, direction) {
    const item = currentItems.find(i => i.rowIndex === rowIndex);
    if (!item) return;

    const sameType = currentItems.filter(i => i.type === item.type).sort((a, b) => a.order - b.order);
    const idx = sameType.findIndex(i => i.rowIndex === rowIndex);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameType.length) return; // อยู่ขอบสุดแล้ว ย้ายต่อไม่ได้

    const other = sameType[swapIdx];

    // สลับค่า order กัน
    const temp = item.order;
    item.order = other.order;
    other.order = temp;

    try {
        await persistItem(item);
        await persistItem(other);
        loadItems();
    } catch (err) {
        alert('ย้ายลำดับไม่สำเร็จ: ' + err.message);
    }
}

// บันทึกรายการ (ใช้ภายในสำหรับการย้ายลำดับ ไม่ผ่านฟอร์ม)
async function persistItem(item) {
    const payload = {
        action: 'save_content',
        adminPassword: sessionStorage.getItem('adminPassword'),
        rowIndex: item.rowIndex,
        type: item.type,
        order: item.order,
        image: item.image,
        title: item.title,
        summary: item.summary,
        reference_label: item.reference_label,
        reference_text: item.reference_text,
        link: item.link,
        // ส่งเป็น boolean เพื่อให้ backend เก็บค่าได้ตรงกว่า (รองรับทั้ง boolean และ 'yes'/'no')
        featured: !!item.featured
    };
    console.log('persistItem payload', payload);
    const res = await fetch(ADMIN_API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    const result = await res.json();
    console.log('persistItem result', result);
    if (result.status !== 'success') throw new Error(result.message || 'บันทึกไม่สำเร็จ');
}

// ==========================================
// เปิดฟอร์มเพิ่มใหม่ (ว่างเปล่า)
// ==========================================
function openForm(presetType) {
    editingRowIndex = null;
    const type = presetType || 'article';
    document.getElementById('formTitle').innerText = 'เพิ่มรายการใหม่ - ' + (TYPE_LABELS[type] || type);
    document.getElementById('f_type').value = type;
    // หาเลขลำดับถัดไปในหมวดเดียวกัน (ไม่ใช่นับรวมทุกหมวด)
    const sameTypeCount = currentItems.filter(i => i.type === type).length;
    document.getElementById('f_order').value = sameTypeCount + 1;
    document.getElementById('f_image').value = '';
    document.getElementById('f_title').value = '';
    document.getElementById('f_summary').value = '';
    document.getElementById('f_reference_label').value = 'อ้างอิงบทความจาก';
    document.getElementById('f_reference_text').value = '';
    document.getElementById('f_link').value = '';
    document.getElementById('f_featured').checked = false;
    document.getElementById('formError').innerText = '';
    document.getElementById('formModal').style.display = 'flex';
}

// ==========================================
// เปิดฟอร์มแก้ไข (เติมข้อมูลเดิมของแถวนั้น)
// ==========================================
function editItem(rowIndex) {
    const item = currentItems.find(i => i.rowIndex === rowIndex);
    if (!item) return;

    editingRowIndex = rowIndex;
    document.getElementById('formTitle').innerText = 'แก้ไขรายการ';
    document.getElementById('f_type').value = item.type;
    document.getElementById('f_order').value = item.order;
    document.getElementById('f_image').value = item.image || '';
    document.getElementById('f_title').value = item.title || '';
    document.getElementById('f_summary').value = item.summary || '';
    document.getElementById('f_reference_label').value = item.reference_label || '';
    document.getElementById('f_reference_text').value = item.reference_text || '';
    document.getElementById('f_link').value = item.link || '';
    document.getElementById('f_featured').checked = isFeaturedValue(item.featured);
    document.getElementById('formError').innerText = '';
    document.getElementById('formModal').style.display = 'flex';
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

// ==========================================
// บันทึก (เพิ่มใหม่ หรือแก้ไข ขึ้นอยู่กับ editingRowIndex)
// ==========================================
async function saveItem() {
    const payload = {
        action: 'save_content',
        adminPassword: sessionStorage.getItem('adminPassword'),
        rowIndex: editingRowIndex, // null ถ้าเพิ่มใหม่
        type: document.getElementById('f_type').value,
        order: document.getElementById('f_order').value,
        image: document.getElementById('f_image').value,
        title: document.getElementById('f_title').value,
        summary: document.getElementById('f_summary').value,
        reference_label: document.getElementById('f_reference_label').value,
        reference_text: document.getElementById('f_reference_text').value,
        link: document.getElementById('f_link').value,
        // ส่งเป็น boolean (true/false)
        featured: document.getElementById('f_featured').checked
    };

    if (!payload.title) {
        document.getElementById('formError').innerText = 'กรุณากรอกชื่อบทความ/วิดีโอ';
        return;
    }

    try {
        console.log('saveItem payload', payload);
        const res = await fetch(ADMIN_API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await res.json();
        console.log('saveItem result', result);

        if (result.status === 'success') {
            closeForm();
            loadItems();
        } else {
            document.getElementById('formError').innerText = 'บันทึกไม่สำเร็จ: ' + (result.message || '');
        }
    } catch (err) {
        document.getElementById('formError').innerText = 'เกิดข้อผิดพลาด: ' + err.message;
    }
}

// ==========================================
// ลบรายการ
// ==========================================
async function deleteItem(rowIndex) {
    if (!confirm('ยืนยันลบรายการนี้ใช่ไหม? กู้คืนไม่ได้นะครับ')) return;

    try {
        const res = await fetch(ADMIN_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'delete_content',
                adminPassword: sessionStorage.getItem('adminPassword'),
                rowIndex: rowIndex
            }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await res.json();

        if (result.status === 'success') {
            loadItems();
        } else {
            alert('ลบไม่สำเร็จ: ' + (result.message || ''));
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}
