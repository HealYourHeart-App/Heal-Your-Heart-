// ==========================================
// แถบแจ้งเตือน "โหมดทดสอบแอดมิน" — แสดงเฉพาะตอนเข้ามาจากปุ่ม "🧪 ทดสอบแบบประเมิน" ในหน้าแอดมิน
// (ดู sessionStorage.adminTestMode ที่ตั้งค่าไว้ใน js/admin.js -> startAdminAssessmentTest)
// ไม่ทำอะไรเลยถ้าเป็นผู้ใช้งานทั่วไป กันสับสนว่าเป็นแบบทดสอบที่ไม่ถูกนับสถิติ
// ==========================================
(function () {
    if (sessionStorage.getItem('adminTestMode') !== '1') return;

    function exitAdminTestMode() {
        var keys = ['adminTestMode', 'sheetRowId', 'gender', 'age', 'occupation',
            'scoreST5', 'score2Q', 'score9Q', 'happinessScore', 'rqScore', 'burnoutScore',
            'lastSavedData', 'suicideRisk2Q', 'suicideRisk9Q'];
        keys.forEach(function (k) {
            sessionStorage.removeItem(k);
            localStorage.removeItem(k);
        });
        window.location.href = 'admin.html';
    }
    window.exitAdminTestMode = exitAdminTestMode;

    // ป้ายกำกับภาษาไทยของช่วงอายุ ใช้ค่าเดียวกับที่เลือกในหน้าแอดมิน (ดู admin.html #adminTestAge)
    var ageLabelMap = {
        under18: 'ต่ำกว่า 18 ปี', '18-24': '18 - 24 ปี', '25-34': '25 - 34 ปี',
        '35-44': '35 - 44 ปี', '45up': '45 ปีขึ้นไป'
    };

    document.addEventListener('DOMContentLoaded', function () {
        var ageVal = sessionStorage.getItem('age') || '';
        var ageLabel = ageLabelMap[ageVal] || ageVal || 'ไม่ระบุ';

        var bar = document.createElement('div');
        bar.id = 'adminTestBadge';
        bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;' +
            'background:#F59E0B;color:#fff;font-family:"Prompt",sans-serif;' +
            'font-size:14px;font-weight:600;text-align:center;padding:10px 16px;' +
            'box-shadow:0 2px 8px rgba(0,0,0,0.2);';
        bar.innerHTML = '🧪 โหมดทดสอบแอดมิน (ช่วงอายุที่ทดสอบ: ' + ageLabel + ')' +
            ' — ข้อมูลในโหมดนี้จะไม่ถูกนับรวมในสถิติผู้ใช้งาน' +
            '&nbsp;&nbsp;<a href="#" onclick="exitAdminTestMode();return false;" ' +
            'style="color:#fff;text-decoration:underline;">ออกจากโหมดทดสอบ →</a>';
        document.body.prepend(bar);
        // อ่าน padding-top เดิมของ body จริงๆ ก่อนทับ เพราะแต่ละหน้าตั้งค่าไม่เท่ากัน
        // (เช่น css/privacy.css ตั้ง body padding เป็น 0 ต่างจากหน้าอื่นที่ใช้ 20px จาก home.css)
        const basePaddingTop = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
        document.body.style.paddingTop = (basePaddingTop + bar.offsetHeight) + 'px';
    });
})();
