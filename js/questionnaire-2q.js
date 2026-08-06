// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

document.getElementById('q2Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ดึงค่าคะแนน 
    const q1 = parseInt(document.querySelector('input[name="q1"]:checked').value);
    const q2 = parseInt(document.querySelector('input[name="q2"]:checked').value);
    const q3_suicide = parseInt(document.querySelector('input[name="q3"]:checked').value);
    
    // รวมคะแนนเฉพาะ 2Q (เต็ม 2)
    const total2Q = q1 + q2;

    // บันทึกใส่ Session Storage 
    sessionStorage.setItem('score2Q', total2Q);
    
    // แอบบันทึกเรื่องเสี่ยงฆ่าตัวตายไว้ ถ้า = 1 จะเด้งเตือนตอนจบ
    if(q3_suicide === 1) {
        sessionStorage.setItem('suicideRisk', 1);
    } else {
        // เคลียร์ค่าเผื่อผู้ใช้กดย้อนกลับมาแก้คำตอบ
        sessionStorage.removeItem('suicideRisk'); 
    }
    
    // พาไปด่านสุดท้าย คือหน้า 9Q
    window.location.href = 'questionnaire-9q.html';
});
