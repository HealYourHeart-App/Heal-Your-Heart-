// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

document.getElementById('q2Form').addEventListener('submit', function(e) {
    e.preventDefault();

    // ดึงค่าคะแนน
    const checked1 = document.querySelector('input[name="q1"]:checked');
    const checked2 = document.querySelector('input[name="q2"]:checked');
    const checked3 = document.querySelector('input[name="q3"]:checked');

    // ⚠️ ตรวจเองด้วย JS เพราะช่องตอบ (radio) ถูกซ่อนไว้ด้วย CSS (.hidden-radio)
    // ใส่ required ไว้ตรงๆ ไม่ได้ เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้ ฟอร์มจะค้างเงียบๆ ไม่มีคำเตือนเลย
    if (!checked1 || !checked2 || !checked3) {
        alert('กรุณาตอบคำถามให้ครบทุกข้อก่อนไปต่อครับ 💖');
        return;
    }

    const q1 = parseInt(checked1.value);
    const q2 = parseInt(checked2.value);
    const q3_suicide = parseInt(checked3.value);

    // รวมคะแนนเฉพาะ 2Q (เต็ม 2)
    const total2Q = q1 + q2;

    // บันทึกใส่ Session Storage 
    sessionStorage.setItem('score2Q', total2Q);
    
    // แอบบันทึกเรื่องเสี่ยงฆ่าตัวตายไว้ ถ้า = 1 จะเด้งเตือนตอนจบ
    // ⚠️ ใช้คีย์แยกจากข้อ 9 ของ 9Q (suicideRisk9Q) เพราะเดิมทั้งสองหน้าใช้คีย์ 'suicideRisk' ร่วมกัน
    // ทำให้ถ้าผู้ใช้ตอบ "ใช่" ที่นี่ แต่ตอบ "ไม่มีเลย" ที่ข้อ 9 ของ 9Q ทีหลัง ธงเสี่ยงจากหน้านี้จะถูกลบทิ้งไปด้วย
    if(q3_suicide === 1) {
        sessionStorage.setItem('suicideRisk2Q', 1);
    } else {
        // เคลียร์ค่าเผื่อผู้ใช้กดย้อนกลับมาแก้คำตอบ
        sessionStorage.removeItem('suicideRisk2Q');
    }
    
    // พาไปด่านสุดท้าย คือหน้า 9Q
    window.location.href = 'questionnaire-9q.html';
});
