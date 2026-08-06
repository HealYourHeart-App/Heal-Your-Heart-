// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

document.getElementById('burnoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ดึงค่าที่ผู้ใช้เลือก (บังคับเลือกครบด้วย required แล้ว)
    const b1 = parseInt(document.querySelector('input[name="b1"]:checked').value);
    const b2 = parseInt(document.querySelector('input[name="b2"]:checked').value);
    const b3 = parseInt(document.querySelector('input[name="b3"]:checked').value);
    
    // รวมคะแนน
    const totalScore = b1 + b2 + b3;

    // บันทึกคะแนนลง LocalStorage
    localStorage.setItem('burnoutScore', totalScore);
    
    // ย้ายไปหน้าประมวลผล (Result)
    window.location.href = 'result.html';
});
