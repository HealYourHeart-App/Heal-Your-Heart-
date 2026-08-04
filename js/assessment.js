// ฟังก์ชันสำหรับเปิดหน้าต่าง Modal
function openSuicideModal(e) {
    e.preventDefault();
    document.getElementById('suicideModal').classList.add('active');
}

// ฟังก์ชันสำหรับปิดหน้าต่าง Modal
function closeSuicideModal() {
    document.getElementById('suicideModal').classList.remove('active');
}
// ==========================================
// ฟังก์ชันล้างคะแนนเก่าเมื่อโหลดเข้าหน้าเลือกแบบประเมิน
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // กำหนดชื่อคีย์คะแนนและสถานะที่ต้องการล้างทิ้ง 
    const scoreKeys = [
        'scoreST5', 'score2Q', 'score9Q', 
        'happinessScore', 'rqScore', 'burnoutScore',
        'isSavedToSheet' 
    ];
    
    // สั่งลบออกจากทั้ง localStorage และ sessionStorage
    scoreKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    
    console.log("เคลียร์คะแนนเก่าและสถานะการเซฟเรียบร้อย พร้อมสำหรับประเมินรอบใหม่!");
});
