document.getElementById('st5Form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // ดึงค่าคะแนน (0, 1, 2, 3) 
    const q1 = parseInt(document.querySelector('input[name="q1"]:checked').value);
    const q2 = parseInt(document.querySelector('input[name="q2"]:checked').value);
    const q3 = parseInt(document.querySelector('input[name="q3"]:checked').value);
    const q4 = parseInt(document.querySelector('input[name="q4"]:checked').value);
    const q5 = parseInt(document.querySelector('input[name="q5"]:checked').value);
    
    // รวมคะแนน (เต็ม 15)
    const totalST5 = q1 + q2 + q3 + q4 + q5;

    // บันทึกใส่ Session Storage (ใช้แค่รอบประเมินนี้)
    sessionStorage.setItem('scoreST5', totalST5);
    
    // พาไปด่านต่อไป คือหน้า 2Q+
    window.location.href = 'questionnaire-2q.html';
});