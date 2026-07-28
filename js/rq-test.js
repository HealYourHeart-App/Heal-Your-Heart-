// ฟังก์ชันสร้างปุ่ม 1-10 ด้วย JavaScript เพื่อความสะอาดของโค้ด HTML
function generateScale(containerId, inputName) {
    let container = document.getElementById(containerId);
    let html = '';
    for(let i=1; i<=10; i++) {
        html += `
        <label>
            <input type="radio" name="${inputName}" value="${i}" class="rq-radio" required>
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
    
    // ดึงค่าที่ผู้ใช้เลือก (คำสั่ง required จะบังคับให้เลือกครบก่อนถึงจะผ่านได้)
    const rq1 = parseInt(document.querySelector('input[name="rq1"]:checked').value);
    const rq2 = parseInt(document.querySelector('input[name="rq2"]:checked').value);
    const rq3 = parseInt(document.querySelector('input[name="rq3"]:checked').value);
    
    // รวมคะแนน
    const totalScore = rq1 + rq2 + rq3;

    // บันทึกคะแนนลง LocalStorage
    localStorage.setItem('rqScore', totalScore);
    
    // ย้ายไปหน้าประมวลผล (Result)
    window.location.href = 'result.html';
});