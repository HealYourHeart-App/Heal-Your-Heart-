// Dropdown อาชีพแบบกำหนดเอง: บังคับให้เมนูเปิดลงล่างเสมอ (select ปกติจะพลิกขึ้นเองถ้าที่ด้านล่างไม่พอ)
(function () {
    const wrapper = document.getElementById('occupationSelect');
    if (!wrapper) return;

    const nativeSelect = document.getElementById('occupation');
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const items = wrapper.querySelectorAll('.custom-select-options li');

    trigger.addEventListener('click', function () {
        wrapper.classList.toggle('open');
    });

    items.forEach(function (li) {
        li.addEventListener('click', function () {
            nativeSelect.value = li.dataset.value;
            trigger.textContent = li.textContent;
            items.forEach(function (i) { i.classList.remove('active'); });
            li.classList.add('active');
            wrapper.classList.remove('open');
        });
    });

    document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
})();

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // หยุดการเปลี่ยนหน้าไว้ก่อน

    // ⚠️ กันเหนียว: ถ้า session เดิมยังค้าง flag "adminTestMode" อยู่ (เช่น แอดมินเข้าโหมดทดสอบ
    // แล้วไม่ได้กดปุ่ม "ออกจากโหมดทดสอบ" ก่อนมาเข้าสู่ระบบจริงในแท็บเดียวกัน) ต้องล้างทิ้งก่อนเสมอ
    // เพราะการกรอกฟอร์มนี้คือการเข้าใช้งานจริง ไม่ใช่โหมดทดสอบ ถ้าไม่ล้าง js/result.js จะเข้าใจผิด
    // และข้ามการบันทึกคะแนนตอนจบแบบประเมิน ทำให้แถวที่สร้างไว้ค้างเป็น "รอประเมิน" ตลอดไป
    sessionStorage.removeItem('adminTestMode');

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
    
    // --- ส่วนที่เพิ่มใหม่: อัปเดตปุ่มและส่งข้อมูลไปจองแถวใน Google Sheets ---
    
    // ปรับ UI ปุ่มให้รู้ว่าระบบกำลังทำงาน ป้องกันการกดซ้ำ
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerText = "กำลังเข้าสู่ระบบ...";
    submitBtn.disabled = true;

    // แปลงค่าให้เป็นภาษาไทยเพื่อลงตารางสวยๆ
    const genderMap = { "male": "ชาย", "female": "หญิง", "lgbtq": "เพศทางเลือก", "not_specified": "ไม่ระบุ" };
    const ageMap = { "under18": "ต่ำกว่า 18 ปี", "18-24": "18 - 24 ปี", "25-34": "25 - 34 ปี", "35-44": "35 - 44 ปี", "45up": "45 ปีขึ้นไป" };
    const occMap = { "student": "นักเรียน / นักศึกษา", "teacher": "ครู / อาจารย์มหาวิทยาลัย", "staff": "บุคลากรในมหาวิทยาลัย", "government": "ข้าราชการ / รัฐวิสาหกิจ / พนักงานของรัฐ / พนักงานรัฐวิสาหกิจ", "business": "ธุรกิจส่วนตัว", "housewife": "พ่อบ้านแม่บ้าน", "farmer": "เกษตรกร", "other": "อื่นๆ" };

    // URL และ Token ใช้จาก js/config.js ไฟล์เดียว (ต้องโหลด config.js ก่อนไฟล์นี้ในหน้า .html)
    const scriptURL = APP_CONFIG.SCRIPT_URL;
    const SECRET_TOKEN = APP_CONFIG.SECRET_TOKEN;
    
    const visitData = {
        action: "create", 
        token: SECRET_TOKEN,   // 👈 เพิ่มเข้ามาใหม่
        gender: genderMap[gender] || gender,
        age: ageMap[age] || age,
        occupation: occMap[occupation] || occupation,
        st5: "รอประเมิน",
        q2: "รอประเมิน",
        q9: "รอประเมิน",
        happiness: "รอประเมิน",
        rq: "รอประเมิน",
        burnout: "รอประเมิน"
    };

    // ส่งข้อมูลไปหลังบ้าน
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(visitData),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: "follow"
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === "success") {
            console.log("บันทึกข้อมูลตั้งต้นที่แถว:", result.rowId);
            // เก็บเลขแถวที่ Google Sheets ส่งกลับมาไว้ใช้ตอนจบ
            sessionStorage.setItem('sheetRowId', result.rowId);
        } else {
            console.error("บันทึกข้อมูลตั้งต้นไม่สำเร็จ:", result);
        }
        // ✅ ข้อมูลบันทึกเสร็จแล้ว จึงย้ายไปหน้าแรก (Home)
        window.location.href = 'home.html';
    })
    .catch(error => {
        console.error("Error:", error);
        // ⚠️ ถ้าระบบหลังบ้านล่ม ก็ยังให้ผ่านไปหน้า home.html ได้ เพื่อไม่ให้ผู้ใช้ค้างอยู่หน้าแรก
        // (ช่วงทดสอบระบบ ถ้าอยากเห็น Error ชัดๆ ให้ลองใส่ // หน้าบรรทัดล่างนี้ไว้ก่อนได้ครับ)
        window.location.href = 'home.html';
    });
});
