document.getElementById('burnoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ดึงค่าที่ผู้ใช้เลือก (บังคับเลือกครบด้วย required แล้ว)
    const b0 = parseInt(document.querySelector('input[name="b1"]:checked').value);
    const b1 = parseInt(document.querySelector('input[name="b2"]:checked').value);
    const b2 = parseInt(document.querySelector('input[name="b3"]:checked').value);
    const b3 = parseInt(document.querySelector('input[name="b1"]:checked').value);
    // รวมคะแนน
    const totalScore = b0 + b1 + b2 + b3;

    // บันทึกคะแนนลง LocalStorage
    localStorage.setItem('burnoutScore', totalScore);
    
    // ย้ายไปหน้าประมวลผล (Result)
    window.location.href = 'result.html';
});
