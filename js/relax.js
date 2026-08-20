function openModal(imgSrc) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("fullImage");
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
    // รีเซ็ตการซูมทุกครั้งที่เปิดรูปใหม่
    modalImg.classList.remove("zoomed");
}

// ฟังก์ชันสลับการซูมรูปเข้า-ออก
function toggleZoom(event) {
    event.stopPropagation(); // หยุดไม่ให้ event ไปเรียก closeModal ด้านหลัง
    var img = document.getElementById("fullImage");
    img.classList.toggle("zoomed");
}

function closeModal(event) {
    // ป้องกันไม่ให้ปิดเมื่อคลิกที่รูปภาพตรงๆ (ให้ทำงานแค่การซูม)
    if (event && event.target.id === 'fullImage') return;
    
    document.getElementById("imageModal").style.display = "none";
}

// ==========================================
// ดึงกิจกรรม/อาหารบำบัดจาก Google Sheets (แท็บ "Content") มาแสดงแบบ dynamic
// ใช้ Apps Script ตัวเดียวกับ knowledge.html (endpoint ?type=knowledge)
// กรองด้วย item.type === 'activity' หรือ 'food'
// ==========================================

// URL ใช้จาก js/config.js ไฟล์เดียว (ต้องโหลด config.js ก่อนไฟล์นี้ในหน้า .html)
const RELAX_API_URL = APP_CONFIG.SCRIPT_URL + '?type=knowledge';

function resolveRelaxImagePath(image) {
    if (!image) return 'photo/logo01.png';
    if (image.indexOf('http') === 0) return image;
    return 'photo/' + image;
}

function renderRelaxCard(item, number) {
    const imgSrc = resolveRelaxImagePath(item.image);
    return `
    <div class="content-card">
        <div class="card-img-container">
            <div class="card-number"><span>${number}</span></div>
            <img src="${imgSrc}" alt="${item.title || ''}" class="clickable-img" onclick="openModal(this.src)">
        </div>
        <div class="card-text-container">
            <div>
                <p><span class="label-red">ชื่อบทความ :</span> ${item.title || ''}</p>
                <p><span class="label-red">เนื้อหาย่อย :</span> ${item.summary || ''}</p>
                <p><span class="label-red">${item.reference_label || 'บทความโดย'} :</span> ${item.reference_text || ''}</p>
            </div>
            ${item.link ? `<a href="${item.link}" target="_blank" class="read-more">ลิงก์บทความ อ่านต่อ....... &raquo;</a>` : ''}
        </div>
    </div>`;
}

async function loadRelaxContent() {
    const activitiesContainer = document.getElementById('activities-container');
    const foodContainer = document.getElementById('food-container');
    if (!activitiesContainer && !foodContainer) return; // ไม่ใช่หน้านี้

    try {
        const response = await fetch(RELAX_API_URL);
        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'โหลดเนื้อหาไม่สำเร็จ');
        }

        const activities = result.items.filter(item => item.type === 'activity');
        const foods = result.items.filter(item => item.type === 'food');

        if (activitiesContainer) {
            activitiesContainer.innerHTML = activities.length
                ? activities.map((item, i) => renderRelaxCard(item, i + 1)).join('')
                : '<p class="loading-text">ยังไม่มีข้อมูลกิจกรรมในขณะนี้</p>';
        }

        if (foodContainer) {
            foodContainer.innerHTML = foods.length
                ? foods.map((item, i) => renderRelaxCard(item, i + 1)).join('')
                : '<p class="loading-text">ยังไม่มีข้อมูลอาหารบำบัดในขณะนี้</p>';
        }

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดเนื้อหา:', error);
        if (activitiesContainer) activitiesContainer.innerHTML = '<p class="loading-text">ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่ภายหลัง</p>';
        if (foodContainer) foodContainer.innerHTML = '<p class="loading-text">ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่ภายหลัง</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadRelaxContent);
