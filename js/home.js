// URL ใช้จาก js/config.js ไฟล์เดียว (ต้องโหลด config.js ก่อนไฟล์นี้ในหน้า .html)
const HOME_API_URL = APP_CONFIG.SCRIPT_URL + '?type=knowledge';

const HOME_BADGE_LABELS = { article: 'บทความ', video: 'วิดีโอ', activity: 'กิจกรรม', food: 'อาหารบำบัด' };
const HOME_LINK_TARGET = { article: 'knowledge.html', video: 'knowledge.html', activity: 'relax.html', food: 'relax.html' };
const HOME_READMORE_LABEL = { article: 'อ่านรายละเอียด', video: 'รับชมวิดีโอ', activity: 'อ่านรายละเอียด', food: 'อ่านรายละเอียด' };

function resolveHomeImagePath(image) {
    if (!image) return 'photo/logo01.png';
    if (image.indexOf('http') === 0) return image;
    return 'photo/' + image;
}

function renderHomeCard(item) {
    const imgSrc = resolveHomeImagePath(item.image);
    const badgeClass = 'badge-' + item.type;
    const linkTarget = HOME_LINK_TARGET[item.type] || 'knowledge.html';
        return `
        <a href="${linkTarget}" class="highlight-card">
            <div class="highlight-img-box">
                <span class="highlight-badge ${badgeClass}">${HOME_BADGE_LABELS[item.type] || item.type}</span>
                <img src="${imgSrc}" alt="${HOME_BADGE_LABELS[item.type] || ''}">
                <div class="carousel-order-num ${isFeaturedValue(item.featured) ? 'is-featured' : ''}">${item.order || ''}
                    ${isFeaturedValue(item.featured) ? '<span class="carousel-feature-star">⭐</span>' : ''}
                </div>
            </div>
            <div class="highlight-content">
                <h3>${item.title || ''}</h3>
                <div class="read-more">${HOME_READMORE_LABEL[item.type] || 'อ่านรายละเอียด'} &raquo;</div>
            </div>
        </a>`;
}

async function loadHomeCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return; // ไม่ใช่หน้านี้

    try {
        const response = await fetch(HOME_API_URL);
        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message || 'โหลดเนื้อหาไม่สำเร็จ');
        }

        // เลือกเฉพาะรายการที่ติ๊ก "แสดงในหน้าแรก" ไว้จากหน้าแอดมิน
        const featured = result.items
            .filter(item => isFeaturedValue(item.featured))
            .sort((a, b) => (parseInt(a.order || 0, 10) - parseInt(b.order || 0, 10)));

        if (featured.length === 0) {
            track.innerHTML = '<p class="loading-text">ยังไม่มีรายการที่เลือกให้แสดงในหน้าแรก (เลือกได้จากหน้าแอดมิน)</p>';
            return;
        }

        // สร้างการ์ดซ้ำ 2 ชุดต่อกัน เพื่อให้แอนิเมชันเลื่อนวนลูปได้ไม่มีรอยต่อ (ตามดีไซน์เดิม)
        const cardsHtml = featured.map(renderHomeCard).join('');
        track.innerHTML = cardsHtml + cardsHtml;

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดเนื้อหาหน้าแรก:', error);
        track.innerHTML = '<p class="loading-text">ไม่สามารถโหลดเนื้อหาได้ในขณะนี้</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadHomeCarousel);
