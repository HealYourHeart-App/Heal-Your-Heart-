// ⚠️ ต้องตรงกับ URL Apps Script เดิม
const ADMIN_API_URL = 'https://script.google.com/macros/s/AKfycbymjqhA1WkWF5Sc0m4M2ziItq0d1luMtLdt_mSMNxcJz1fi-NeRPwK3d6F8U6KcCJ4RFw/exec';
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
function checkAdminPassword() {
    const pw = document.getElementById('adminPasswordInput').value;
    if (!pw) {
        document.getElementById('loginError').innerText = 'กรุณากรอกรหัสผ่าน';
        return;
    }
    // เก็บรหัสผ่านไว้ใช้แนบไปกับทุก request ที่แก้ไขข้อมูล (เช็คจริงฝั่ง server อีกที)
    sessionStorage.setItem('adminPassword', pw);
    document.getElementById('loginGate').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadItems();
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

        // เรียงแต่ละหมวดตามคอลัมน์ order
        Object.keys(grouped).forEach(t => grouped[t].sort((a, b) => a.order - b.order));

        const sectionIcons = { article: '📄', video: '🎬', activity: '🧘', food: '🍽️' };

        list.innerHTML = typeOrder
            .filter(t => grouped[t] && grouped[t].length > 0)
            .map(type => `
                <div class="type-section">
                    <div class="type-section-header">
                        <span class="type-section-title">${sectionIcons[type] || ''} ${TYPE_LABELS[type] || type}</span>
                        <span class="type-section-count">${grouped[type].length} รายการ</span>
                        <button onclick="openForm('${type}')" class="btn-outline-pink small">+ เพิ่มในหมวดนี้</button>
                    </div>
                    <div class="type-section-items">
                        ${grouped[type].map(item => `
                            <div class="item-row">
                                <div class="item-info">
                                    <strong>${item.title || '(ไม่มีชื่อ)'}</strong>
                                    <span class="item-order">ลำดับ: ${item.order}</span>
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

    } catch (err) {
        list.innerHTML = `<p class="error-text">เกิดข้อผิดพลาด: ${err.message}</p>`;
    }
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
        link: document.getElementById('f_link').value
    };

    if (!payload.title) {
        document.getElementById('formError').innerText = 'กรุณากรอกชื่อบทความ/วิดีโอ';
        return;
    }

    try {
        const res = await fetch(ADMIN_API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await res.json();

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
