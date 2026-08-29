// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

document.getElementById('burnoutForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // ดึงค่าที่ผู้ใช้เลือก
    const checked1 = document.querySelector('input[name="b1"]:checked');
    const checked2 = document.querySelector('input[name="b2"]:checked');
    const checked3 = document.querySelector('input[name="b3"]:checked');

    // ⚠️ ตรวจเองด้วย JS เพราะช่องตอบ (radio) ถูกซ่อนไว้ด้วย CSS (.hidden-radio)
    // ใส่ required ไว้ตรงๆ ไม่ได้ เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้ ฟอร์มจะค้างเงียบๆ ไม่มีคำเตือนเลย
    if (!checked1 || !checked2 || !checked3) {
        alert('กรุณาตอบคำถามให้ครบทุกข้อก่อนไปต่อครับ 💖');
        return;
    }

    const b1 = parseInt(checked1.value);
    const b2 = parseInt(checked2.value);
    const b3 = parseInt(checked3.value);

    // รวมคะแนน
    const totalScore = b1 + b2 + b3;

    // บันทึกคะแนนลง LocalStorage
    localStorage.setItem('burnoutScore', totalScore);
    
    // ย้ายไปหน้าประมวลผล (Result)
    window.location.href = 'result.html';
});
