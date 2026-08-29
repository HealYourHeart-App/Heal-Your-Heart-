// ==========================================
// ส่งฟอร์ม "ติดต่อผู้ดูแลระบบ" ไปที่ Apps Script (action: send_contact -> handleContactForm ใน Code.gs)
// ใช้ URL จาก js/config.js ไฟล์เดียว (ต้องโหลด config.js ก่อนไฟล์นี้ในหน้า .html)
// ==========================================
document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const statusEl = document.getElementById('contactFormStatus');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!message) {
        statusEl.textContent = 'กรุณากรอกข้อความ';
        statusEl.className = 'contact-form-status error';
        return;
    }

    statusEl.textContent = '';
    statusEl.className = 'contact-form-status';
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังส่ง...';

    try {
        const res = await fetch(APP_CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'send_contact', name, email, message }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await res.json();

        if (result.status === 'success') {
            statusEl.textContent = '✅ ส่งข้อความสำเร็จ ขอบคุณที่ติดต่อเรานะครับ';
            statusEl.className = 'contact-form-status success';
            e.target.reset();
        } else {
            statusEl.textContent = 'ส่งไม่สำเร็จ: ' + (result.message || 'กรุณาลองใหม่อีกครั้ง');
            statusEl.className = 'contact-form-status error';
        }
    } catch (err) {
        statusEl.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message;
        statusEl.className = 'contact-form-status error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ส่งข้อความถึงเรา';
    }
});
