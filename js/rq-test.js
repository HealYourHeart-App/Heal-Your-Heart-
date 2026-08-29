// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

// ฟังก์ชันสร้างปุ่ม 1-10 ด้วย JavaScript เพื่อความสะอาดของโค้ด HTML
function generateScale(containerId, inputName) {
    let container = document.getElementById(containerId);
    let html = '';
    // ไม่ใส่ required เพราะ input นี้ถูกซ่อนด้วย .rq-radio (display:none) เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้
    // ถ้าใส่ required ไว้ พอกด submit ทั้งที่ยังตอบไม่ครบ ฟอร์มจะค้างเงียบๆ ไม่มี alert เตือนเลย
    // (ดูการตรวจสอบว่าตอบครบหรือยังในตัว submit handler ด้านล่างแทน)
    for(let i=1; i<=10; i++) {
        html += `
        <label>
            <input type="radio" name="${inputName}" value="${i}" class="rq-radio">
            <span class="rq-lbl c-${i}">${i}</span>
        </label>`;
    }
    container.innerHTML = html;
}

// สร้างปุ่มให้ทั้ง 3 ข้อ
generateScale('scale-q1', 'rq1');
generateScale('scale-q2', 'rq2');
generateScale('scale-q3', 'rq3');

// จัดการเมื่อกดปุ่มบันทึก
document.getElementById('rqForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // ดึงค่าที่ผู้ใช้เลือก
    const checked1 = document.querySelector('input[name="rq1"]:checked');
    const checked2 = document.querySelector('input[name="rq2"]:checked');
    const checked3 = document.querySelector('input[name="rq3"]:checked');

    // ⚠️ ตรวจเองด้วย JS เพราะช่องตอบ (radio) ถูกซ่อนไว้ด้วย CSS (.rq-radio)
    // ใส่ required ไว้ตรงๆ ไม่ได้ เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้ ฟอร์มจะค้างเงียบๆ ไม่มีคำเตือนเลย
    if (!checked1 || !checked2 || !checked3) {
        alert('กรุณาตอบคำถามให้ครบทุกข้อก่อนไปต่อครับ 💖');
        return;
    }

    const rq1 = parseInt(checked1.value);
    const rq2 = parseInt(checked2.value);
    const rq3 = parseInt(checked3.value);

    // รวมคะแนน
    const totalScore = rq1 + rq2 + rq3;

    // บันทึกคะแนนลง LocalStorage
    localStorage.setItem('rqScore', totalScore);
    
    // ย้ายไปหน้าประมวลผล (Result)
    window.location.href = 'result.html';
});
