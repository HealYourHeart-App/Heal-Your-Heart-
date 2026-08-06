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
    
    // --- ส่วนที่เพิ่มใหม่: อัปเดตปุ่มและส่งข้อมูลไปจองแถวใน Google Sheets ---
    
    // ปรับ UI ปุ่มให้รู้ว่าระบบกำลังทำงาน ป้องกันการกดซ้ำ
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerText = "กำลังเข้าสู่ระบบ...";
    submitBtn.disabled = true;

    // แปลงค่าให้เป็นภาษาไทยเพื่อลงตารางสวยๆ
    const genderMap = { "male": "ชาย", "female": "หญิง", "lgbtq": "เพศทางเลือก", "not_specified": "ไม่ระบุ" };
    const ageMap = { "under18": "ต่ำกว่า 18 ปี", "18-24": "18 - 24 ปี", "25-34": "25 - 34 ปี", "35-44": "35 - 44 ปี", "45up": "45 ปีขึ้นไป" };
    const occMap = { "student": "นักเรียน / นักศึกษา", "employee": "พนักงานบริษัท / ลูกจ้าง", "government": "ข้าราชการ / รัฐวิสาหกิจ", "freelance": "ธุรกิจส่วนตัว / ฟรีแลนซ์", "unemployed": "ว่างงาน", "other": "อื่นๆ" };

    // ✅ แก้ไข URL ให้ถูกต้อง 100% แล้ว (ระวังห้ามเว้นวรรคนะครับ)
   const scriptURL = 'https://script.google.com/macros/s/AKfycbymjqhA1WkWF5Sc0m4M2ziItq0d1luMtLdt_mSMNxcJz1fi-NeRPwK3d6F8U6KcCJ4RFw/exec';

    // ⚠️ ต้องตรงกับ SECRET_TOKEN ใน Apps Script (Code.gs) เป๊ะๆ และตรงกับ token ใน result.js ด้วย
    const SECRET_TOKEN = "MQLkPm6QkD79LbcAt8kpTQ6Yxz-p5lTI1WoxmR-VfMc";
    
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
