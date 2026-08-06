// ⚠️ เช็คว่าล็อกอินผ่านมาแล้วหรือยัง (มี sheetRowId ใน sessionStorage ไหม)
// ถ้าไม่มี แปลว่าเข้ามาหน้านี้ตรงๆ โดยไม่ผ่าน login -> เด้งกลับไปกรอกข้อมูลก่อน
if (!sessionStorage.getItem('sheetRowId')) {
    alert('กรุณากรอกข้อมูลเบื้องต้น (เพศ/อายุ/อาชีพ) ก่อนเริ่มทำแบบประเมินครับ 💖');
    window.location.href = 'index.html';
}

// รายการคำถาม 9 ข้อ
const questions = [
    "1.) เบื่อ ไม่สนใจอยากทำอะไร",
    "2.) ไม่สบายใจ ซึมเศร้า ท้อแท้",
    "3.) หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากไป",
    "4.) เหนื่อยง่าย หรือไม่ค่อยมีแรง",
    "5.) เบื่ออาหาร หรือกินมากเกินไป",
    "6.) รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้ครอบครัวผิดหวัง",
    "7.) สมาธิไม่ดีเวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ หรือทำงานที่ต้องใช้ความตั้งใจ",
    "8.) พูดช้า ทำอะไรช้าลงจนคนอื่นสังเกตเห็นได้ หรือกระสับกระส่ายไม่สามารถอยู่นิ่งได้",
    "9.) คิดทำร้ายตัวเอง หรือคิดว่าถ้าตายไปคงจะดี"
];

// สร้าง HTML สำหรับคำถามทั้ง 9 ข้อ
let htmlContent = '';
questions.forEach((q, index) => {
    let isLast = (index === 8) ? 'style="border-bottom: none;"' : '';
    htmlContent += `
        <div class="question-row" ${isLast}>
            <div class="q-text">${q}</div>
            <div class="q-options opts-4">
                <label><input type="radio" name="q${index+1}" value="0" class="hidden-radio" required><span class="opt-btn btn-green">ไม่มีเลย</span></label>
                <label><input type="radio" name="q${index+1}" value="1" class="hidden-radio"><span class="opt-btn btn-blue">เป็นบางวัน (1-7 วัน)</span></label>
                <label><input type="radio" name="q${index+1}" value="2" class="hidden-radio"><span class="opt-btn btn-yellow">เป็นบ่อย (มากกว่า 7 วัน)</span></label>
                <label><input type="radio" name="q${index+1}" value="3" class="hidden-radio"><span class="opt-btn btn-red">เป็นทุกวัน</span></label>
            </div>
        </div>
    `;
});
document.getElementById('questionsContainer').innerHTML = htmlContent;

// ประมวลผลตอนกด Submit
document.getElementById('q9Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let total9Q = 0;
    // วนลูปบวกคะแนนทั้ง 9 ข้อ
    for(let i = 1; i <= 9; i++) {
        total9Q += parseInt(document.querySelector(`input[name="q${i}"]:checked`).value);
    }

    // บันทึกใส่ Session Storage 
    sessionStorage.setItem('score9Q', total9Q);
    
    // เช็คว่าถ้าข้อ 9 (อยากทำร้ายตัวเอง) ตอบ > 0 ให้เปิดการแจ้งเตือนรุนแรงไว้
    let q9_selfharm = parseInt(document.querySelector('input[name="q9"]:checked').value);
    if(q9_selfharm > 0) {
        sessionStorage.setItem('suicideRisk', 1);
    }
    
    // เสร็จสิ้นชุดประเมินหลัก! พุ่งไปหน้า Result ทันที
    window.location.href = 'result.html';
});
