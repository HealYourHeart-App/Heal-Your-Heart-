// ==========================================
// ตั้งค่ากลางของทั้งเว็บไซต์ (URL ของ Apps Script + Token ลับ)
// ⚠️ ไฟล์นี้ต้องถูกโหลดก่อนไฟล์ .js อื่นๆ ที่คุยกับ Google Sheets เสมอ
//    (ดู <script src="js/config.js"> ในแต่ละหน้า .html — ต้องมาก่อน script ของหน้านั้น)
// แก้ URL หรือ Token ที่นี่ที่เดียว ไม่ต้องไล่แก้ทีละไฟล์เหมือนเดิมอีกต่อไป
// ==========================================
const APP_CONFIG = {
    // URL ของ Google Apps Script เวอร์ชัน deploy ปัจจุบัน (ต้องตรงกับที่ Deploy ไว้ใน Code.gs)
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbymjqhA1WkWF5Sc0m4M2ziItq0d1luMtLdt_mSMNxcJz1fi-NeRPwK3d6F8U6KcCJ4RFw/exec',
    // ⚠️ ต้องตรงกับ SECRET_TOKEN ใน Code.gs เป๊ะๆ
    SECRET_TOKEN: 'MQLkPm6QkD79LbcAt8kpTQ6Yxz-p5lTI1WoxmR-VfMc'
};

// ตรวจสอบว่าค่า featured จาก Google Sheets ถือว่าเป็น "เด่น / แสดงในแถบเลื่อนหน้าแรก" หรือไม่
// รองรับทั้ง boolean (checkbox TRUE ของ Sheets) และข้อความ "yes" / "true" / "1"
function isFeaturedValue(val) {
    if (val === true) return true;
    const s = (val || '').toString().trim().toLowerCase();
    return s === 'yes' || s === 'true' || s === '1';
}
