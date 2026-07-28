// ฟังก์ชันสำหรับเปิดหน้าต่าง Modal
function openSuicideModal(e) {
    e.preventDefault();
    document.getElementById('suicideModal').classList.add('active');
}

// ฟังก์ชันสำหรับปิดหน้าต่าง Modal
function closeSuicideModal() {
    document.getElementById('suicideModal').classList.remove('active');
}