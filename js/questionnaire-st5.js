// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

document.getElementById('st5Form').addEventListener('submit', function(e) {
    e.preventDefault();

    // ดึงค่าคะแนน (0, 1, 2, 3)
    const checked1 = document.querySelector('input[name="q1"]:checked');
    const checked2 = document.querySelector('input[name="q2"]:checked');
    const checked3 = document.querySelector('input[name="q3"]:checked');
    const checked4 = document.querySelector('input[name="q4"]:checked');
    const checked5 = document.querySelector('input[name="q5"]:checked');

    // ⚠️ ตรวจเองด้วย JS เพราะช่องตอบ (radio) ถูกซ่อนไว้ด้วย CSS (.hidden-radio)
    // ใส่ required ไว้ตรงๆ ไม่ได้ เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้ ฟอร์มจะค้างเงียบๆ ไม่มีคำเตือนเลย
    if (!checked1 || !checked2 || !checked3 || !checked4 || !checked5) {
        alert('กรุณาตอบคำถามให้ครบทุกข้อก่อนไปต่อครับ 💖');
        return;
    }

    // รวมคะแนน (เต็ม 15)
    const totalST5 = parseInt(checked1.value) + parseInt(checked2.value) + parseInt(checked3.value) + parseInt(checked4.value) + parseInt(checked5.value);

    // บันทึกใส่ Session Storage (ใช้แค่รอบประเมินนี้)
    sessionStorage.setItem('scoreST5', totalST5);
    
    // พาไปด่านต่อไป คือหน้า 2Q+
    window.location.href = 'questionnaire-2q.html';
});
