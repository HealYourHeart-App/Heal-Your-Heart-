// 1. กำหนดโครงสร้างข้อมูลสถิติ (มี Mock Data เบื้องต้นให้กราฟดูสวยงาม)
let appStats = JSON.parse(localStorage.getItem('healHeartStats'));

if (!appStats) {
    appStats = {
        total: 125, // ยอดผู้ใช้จำลองเริ่มต้น
        age: { under18: 15, '18_24': 65, '25_34': 25, '35_44': 12, over45: 8 },
        gender: { male: 45, female: 65, lgbtq: 12, not_specified: 3 },
        occupation: { student: 55, employee: 40, government: 10, freelance: 15, unemployed: 5, other: 0 }
    };
}

// 2. ดึงข้อมูลผู้ใช้ปัจจุบันจาก sessionStorage (ที่ได้จากการหน้า Login) มาบวกเพิ่ม
// ใช้เช็คเพื่อไม่ให้บวกซ้ำเวลายืนยันการรีเฟรชหน้า
if (!sessionStorage.getItem('statsAddedToDB')) {
    const currentAge = sessionStorage.getItem('userAgeGroup');
    const currentGender = sessionStorage.getItem('userGender');
    const currentOcc = sessionStorage.getItem('userOccupation');

    let hasNewData = false;

    if (currentAge && appStats.age[currentAge] !== undefined) {
        appStats.age[currentAge]++;
        appStats.total++;
        hasNewData = true;
    }
    if (currentGender && appStats.gender[currentGender] !== undefined) {
        appStats.gender[currentGender]++;
    }
    if (currentOcc && appStats.occupation[currentOcc] !== undefined) {
        appStats.occupation[currentOcc]++;
    }

    // บันทึกกลับลง localStorage
    if(hasNewData) {
        localStorage.setItem('healHeartStats', JSON.stringify(appStats));
        sessionStorage.setItem('statsAddedToDB', 'true'); // ทำเครื่องหมายว่าบวกไปแล้วใน Session นี้
    }
}

// 3. แสดงผลตัวเลขสรุปด้านบน
document.getElementById('totalUsers').innerText = appStats.total + " คน";

// หาช่วงอายุที่เยอะที่สุด
const ageLabelsMap = {
    under18: 'ต่ำกว่า 18 ปี', '18_24': '18 - 24 ปี', '25_34': '25 - 34 ปี', '35_44': '35 - 44 ปี', over45: '45 ปีขึ้นไป'
};
let topAgeKey = Object.keys(appStats.age).reduce((a, b) => appStats.age[a] > appStats.age[b] ? a : b);
document.getElementById('topAgeGroup').innerText = ageLabelsMap[topAgeKey];

// 4. การตั้งค่าสีให้เข้ากับธีมเว็บ (ชมพู-น้ำเงิน)
const themeColors = [
    '#d84b6b', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'
];

// 5. วาดกราฟอายุ (Doughnut Chart)
const ctxAge = document.getElementById('ageChart').getContext('2d');
new Chart(ctxAge, {
    type: 'doughnut',
    data: {
        labels: ['ต่ำกว่า 18 ปี', '18 - 24 ปี', '25 - 34 ปี', '35 - 44 ปี', '45 ปีขึ้นไป'],
        datasets: [{
            data: [appStats.age.under18, appStats.age['18_24'], appStats.age['25_34'], appStats.age['35_44'], appStats.age.over45],
            backgroundColor: themeColors,
            borderWidth: 2
        }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Prompt' } } } } }
});

// 6. วาดกราฟเพศ (Pie Chart)
const ctxGender = document.getElementById('genderChart').getContext('2d');
new Chart(ctxGender, {
    type: 'pie',
    data: {
        labels: ['ชาย', 'หญิง', 'เพศทางเลือก', 'ไม่ระบุ'],
        datasets: [{
            data: [appStats.gender.male, appStats.gender.female, appStats.gender.lgbtq, appStats.gender.not_specified],
            backgroundColor: ['#3b82f6', '#d84b6b', '#8b5cf6', '#cbd5e1'],
            borderWidth: 2
        }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Prompt' } } } } }
});

// 7. วาดกราฟอาชีพ (Bar Chart แนวนอน)
const ctxOcc = document.getElementById('occupationChart').getContext('2d');
new Chart(ctxOcc, {
    type: 'bar',
    data: {
        labels: ['นักเรียน/นักศึกษา', 'พนักงานบริษัท', 'ข้าราชการ/รัฐวิสาหกิจ', 'ธุรกิจส่วนตัว/ฟรีแลนซ์', 'ว่างงาน/พ่อบ้านแม่บ้าน', 'อื่นๆ'],
        datasets: [{
            label: 'จำนวนคน',
            data: [appStats.occupation.student, appStats.occupation.employee, appStats.occupation.government, appStats.occupation.freelance, appStats.occupation.unemployed, appStats.occupation.other],
            backgroundColor: '#d84b6b',
            borderRadius: 6
        }]
    },
    options: {
        indexAxis: 'y', // เปลี่ยนเป็นกราฟแท่งแนวนอน
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { font: { family: 'Prompt' }, stepSize: 10 } },
            y: { ticks: { font: { family: 'Prompt' } } }
        }
    }
});