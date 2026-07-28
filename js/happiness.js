// ตัวแปรสำหรับเก็บคะแนนที่ผู้ใช้เลือก
let selectedScore = null;

// ฟังก์ชันที่ถูกเรียกใช้ตอนกดปุ่ม 1-10
function selectScore(score) {
    selectedScore = score; // เก็บค่าคะแนน
    
    // 1. แสดงตัวเลขที่เลือกบนหน้าจอ ตรงคำว่า "คะแนนที่คุณเลือก: -"
    document.getElementById('displayScore').innerText = score;
    
    // 2. ลบเอฟเฟกต์ (class active) ออกจากทุกปุ่มก่อน
    const buttons = document.querySelectorAll('.scale-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // 3. ใส่เอฟเฟกต์ (class active) ให้เฉพาะปุ่มที่เพิ่งถูกกด
    // โดยอ้างอิงจากคลาสสีพื้นหลัง bg-1 ถึง bg-10
    const clickedButton = document.querySelector(`.bg-${score}`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// ฟังก์ชันจัดการตอนกดปุ่ม "บันทึกและดูผลลัพธ์"
document.getElementById('happinessForm').addEventListener('submit', function(event) {
    event.preventDefault(); // ป้องกันไม่ให้ฟอร์มรีเฟรชหน้าเว็บตามปกติ
    
    if (selectedScore !== null) {
        // บันทึกคะแนนลง localStorage ในชื่อ 'happinessScore' (ชื่อนี้ตรงกับที่ result.js รอรับพอดี)
        localStorage.setItem('happinessScore', selectedScore);
        
        // บันทึกลง sessionStorage เผื่อไว้ด้วย เพื่อความชัวร์ 100%
        sessionStorage.setItem('happinessScore', selectedScore);
        
        // เด้งไปหน้าผลลัพธ์
        window.location.href = 'result.html'; 
    } else {
        // แจ้งเตือนถ้าผู้ใช้กดบันทึกโดยที่ยังไม่เลือกคะแนน
        alert('กรุณาเลือกระดับความสุข (1-10) ก่อนบันทึกข้อมูลครับ 💖');
    }
});