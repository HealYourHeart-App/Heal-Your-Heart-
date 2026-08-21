function openModal(imgSrc) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("fullImage");
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
    modalImg.classList.remove("zoomed"); // รีเซ็ตการซูมทุกครั้งที่เปิด
}

// ฟังก์ชันสลับการซูม
function toggleZoom(event) {
    event.stopPropagation(); // หยุด event ไม่ให้เรียก closeModal
    var img = document.getElementById("fullImage");
    img.classList.toggle("zoomed");
}

function closeModal(event) {
    // ป้องกันปิดเมื่อคลิกที่รูป
    if (event && event.target.id === 'fullImage') return;
    document.getElementById("imageModal").style.display = "none";
}

// ==========================================
// ดึงบทความ/วิดีโอจาก Google Sheets (แท็บ "Content") มาแสดงแบบ dynamic
// เปลี่ยนเนื้อหาได้จาก Google Sheets โดยตรง ไม่ต้องแก้โค้ดไฟล์นี้เลย
// ==========================================

// URL ใช้จาก js/config.js ไฟล์เดียว (ต้องโหลด config.js ก่อนไฟล์นี้ในหน้า .html)
const KNOWLEDGE_API_URL = APP_CONFIG.SCRIPT_URL + '?type=knowledge';

// โฟลเดอร์ย่อยของ photo/ แยกตามประเภทเนื้อหา (photo/articles, photo/videos, ...)
const IMAGE_TYPE_FOLDER = { article: 'articles', video: 'videos', activity: 'activities', food: 'food' };

// รองรับทั้ง 2 แบบ: ถ้ากรอกเป็น URL เต็ม (ขึ้นต้นด้วย http) ใช้ตรงๆ
// ถ้ากรอกแค่ชื่อไฟล์ (เช่น A11.jpg) จะไปหาในโฟลเดอร์ photo/<ประเภท>/ ให้อัตโนมัติ ตามที่วางไฟล์จริงไว้
function resolveImagePath(image, type) {
    if (!image) return 'photo/logo01.png'; // รูป fallback เผื่อไม่มีรูป
    if (image.indexOf('http') === 0) return image;
    const folder = IMAGE_TYPE_FOLDER[type];
    return folder ? 'photo/' + folder + '/' + image : 'photo/' + image;
}

// สร้าง HTML การ์ด 1 อัน จากข้อมูล 1 แถว
function renderContentCard(item, number) {
    const imgSrc = resolveImagePath(item.image, item.type);

    if (item.type === 'article') {
        return `
        <div class="content-row">
            <div class="number-badge">${number}</div>
            <div class="image-box">
                <img src="${imgSrc}" alt="${item.title || 'บทความ'}" class="clickable-img" onclick="openModal(this.src)">
            </div>
            <div class="info-box">
                <p class="content-title"><span class="label-red">ชื่อบทความ :</span> ${item.title || ''}</p>
                <p><span class="label-red">เนื้อหาย่อย :</span> ${item.summary || ''}</p>
                <p class="reference"><span class="label-red">${item.reference_label || 'อ้างอิงบทความจาก'} :</span> ${item.reference_text || ''}</p>
                ${item.link ? `<a href="${item.link}" target="_blank" class="read-more-link">ลิงก์บทความ อ่านต่อ....... <span>&raquo;</span></a>` : ''}
            </div>
        </div>`;
    }

    // type === 'video'
    return `
    <div class="content-row">
        <div class="number-badge">${number}</div>
        <div class="image-box">
            <a href="${item.link || '#'}" target="_blank">
                <img src="${imgSrc}" alt="${item.title || 'วิดีโอ'}" class="clickable-img">
            </a>
        </div>
        <div class="info-box">
            <p class="content-title"><span class="label-red">ชื่อคลิปวิดีโอ :</span> ${item.title || ''}</p>
            <p><span class="label-red">เนื้อหาย่อย :</span> ${item.summary || ''}</p>
            <p class="reference"><span class="label-red">${item.reference_label || 'ลิงก์วิดีโอ (Youtube)'} :</span> ${item.link ? `<a href="${item.link}" target="_blank" style="color: #dc2626; text-decoration: underline;">${item.reference_text || 'คลิกเพื่อรับชม'}</a>` : (item.reference_text || '-')}</p>
        </div>
    </div>`;
}

async function loadKnowledgeContent() {
    const articlesContainer = document.getElementById('articles-container');
    const videosContainer = document.getElementById('videos-container');
    if (!articlesContainer && !videosContainer) return; // ไม่ใช่หน้านี้ ไม่ต้องทำอะไร

    try {
        const response = await fetch(KNOWLEDGE_API_URL);
        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'โหลดเนื้อหาไม่สำเร็จ');
        }

        const articles = result.items.filter(item => item.type === 'article');
        const videos = result.items.filter(item => item.type === 'video');

        if (articlesContainer) {
            articlesContainer.innerHTML = articles.length
                ? articles.map((item, i) => renderContentCard(item, i + 1)).join('')
                : '<p class="loading-text">ยังไม่มีบทความในขณะนี้</p>';
        }

        if (videosContainer) {
            videosContainer.innerHTML = videos.length
                ? videos.map((item, i) => renderContentCard(item, i + 1)).join('')
                : '<p class="loading-text">ยังไม่มีวิดีโอในขณะนี้</p>';
        }

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดเนื้อหา:', error);
        if (articlesContainer) articlesContainer.innerHTML = '<p class="loading-text">ไม่สามารถโหลดบทความได้ในขณะนี้ กรุณาลองใหม่ภายหลัง</p>';
        if (videosContainer) videosContainer.innerHTML = '<p class="loading-text">ไม่สามารถโหลดวิดีโอได้ในขณะนี้ กรุณาลองใหม่ภายหลัง</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadKnowledgeContent);
