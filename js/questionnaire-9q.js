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
                <!-- ไม่ใส่ required เพราะ input นี้ถูกซ่อนด้วย .hidden-radio (display:none) เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้
                     ถ้าใส่ required ไว้ พอกด submit ทั้งที่ยังตอบไม่ครบ ฟอร์มจะค้างเงียบๆ ไม่มี alert เตือนเลย
                     (ดูการตรวจสอบว่าตอบครบหรือยังด้านล่าง ในตัว submit handler แทน) -->
                <label><input type="radio" name="q${index+1}" value="0" class="hidden-radio"><span class="opt-btn btn-green">ไม่มีเลย</span></label>
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

    // ⚠️ ตรวจเองด้วย JS เพราะช่องตอบ (radio) ถูกซ่อนไว้ด้วย CSS (.hidden-radio)
    // ใส่ required ไว้ตรงๆ ไม่ได้ เบราว์เซอร์โฟกัสช่องที่ซ่อนไม่ได้ ฟอร์มจะค้างเงียบๆ ไม่มีคำเตือนเลย
    for (let i = 1; i <= 9; i++) {
        if (!document.querySelector(`input[name="q${i}"]:checked`)) {
            alert('กรุณาตอบคำถามให้ครบทุกข้อก่อนไปต่อครับ 💖');
            return;
        }
    }

    let total9Q = 0;
    // วนลูปบวกคะแนนทั้ง 9 ข้อ
    for(let i = 1; i <= 9; i++) {
        total9Q += parseInt(document.querySelector(`input[name="q${i}"]:checked`).value);
    }

    // บันทึกใส่ Session Storage 
    sessionStorage.setItem('score9Q', total9Q);
    
    // เช็คว่าถ้าข้อ 9 (อยากทำร้ายตัวเอง) ตอบ > 0 ให้เปิดการแจ้งเตือนรุนแรงไว้
    // และถ้าตอบ 0 (ไม่มีเลย) ต้องล้างธงเก่าทิ้งด้วย ไม่งั้นธงจากรอบก่อนหน้าจะค้างอยู่
    // ⚠️ ใช้คีย์แยกจากข้อ 3 ของ 2Q (suicideRisk2Q) เพราะเดิมทั้งสองหน้าใช้คีย์ 'suicideRisk' ร่วมกัน
    // ทำให้ถ้าผู้ใช้ตอบเสี่ยงไว้ที่หน้า 2Q แต่ตอบ "ไม่มีเลย" ที่ข้อนี้ ธงเสี่ยงจากหน้า 2Q จะถูกลบทิ้งไปด้วย
    let q9_selfharm = parseInt(document.querySelector('input[name="q9"]:checked').value);
    if(q9_selfharm > 0) {
        sessionStorage.setItem('suicideRisk9Q', 1);
    } else {
        sessionStorage.removeItem('suicideRisk9Q');
    }
    
    // เสร็จสิ้นชุดประเมินหลัก! พุ่งไปหน้า Result ทันที
    window.location.href = 'result.html';
});
