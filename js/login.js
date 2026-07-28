document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // หยุดการเปลี่ยนหน้าไว้ก่อน
    
    // ดึงค่าที่ผู้ใช้เลือก
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const occupation = document.getElementById('occupation').value;
    
    // 🔥 ตรวจสอบว่าถ้าช่องไหนยังไม่ได้เลือก (ค่าเป็นว่าง) ให้เด้งแจ้งเตือนและหยุดการเข้าระบบ 🔥
    if (!gender || !age || !occupation) {
        alert("กรุณาเลือกข้อมูลให้ครบถ้วนทั้ง 3 ช่องก่อนเข้าสู่ระบบครับ 💖");
        return; // จบการทำงานตรงนี้ ไม่เปลี่ยนหน้า
    }

    // ถ้ากรอกครบแล้ว บันทึกข้อมูลลงใน Session Storage
    sessionStorage.setItem('gender', gender);
    sessionStorage.setItem('age', age);
    sessionStorage.setItem('occupation', occupation);
    
    // ย้ายไปหน้าแรก (Home)
    window.location.href = 'home.html';
});