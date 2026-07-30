// URL ของ Google Apps Script (ต้องมีฟังก์ชัน doGet() เรียบร้อยแล้ว)
const scriptURL = 'https://script.google.com/macros/s/AKfycbymjqhA1WkWF5Sc0m4M2ziItq0d1luMtLdt_mSMNxcJz1fi-NeRPwK3d6F8U6KcCJ4RFw/exec';

// สีธีมสำหรับกราฟ
const themeColors = ['#d84b6b', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'];

// ฟังก์ชันหลักดึงข้อมูลและสร้างกราฟ
async function fetchAndRenderStatistics() {
    try {
        // แสดงข้อความกำลังโหลด
        document.getElementById('totalUsers').innerText = "กำลังโหลด...";
        document.getElementById('topAgeGroup').innerText = "กำลังโหลด...";

        // ดึงข้อมูลจาก API
        const response = await fetch(scriptURL);
        const result = await response.json();

        if (result.status === "success") {
            const allData = result.data;
            const totalUsers = result.total_users;

            // 1. ตัวแปรเก็บจำนวนแต่ละหมวดหมู่
            let ageCounts = { under18: 0, '18_24': 0, '25_34': 0, '35_44': 0, over45: 0 };
            let genderCounts = { male: 0, female: 0, lgbtq: 0, not_specified: 0 };
            let occCounts = { student: 0, employee: 0, government: 0, freelance: 0, unemployed: 0, other: 0 };

            // 2. วนลูปนับข้อมูลจริงจาก Google Sheets
            allData.forEach(row => {
                // นับช่วงอายุ
                let age = row['อายุ'] || "";
                if (age.includes('ต่ำกว่า 18')) ageCounts.under18++;
                else if (age.includes('18 - 24')) ageCounts['18_24']++;
                else if (age.includes('25 - 34')) ageCounts['25_34']++;
                else if (age.includes('35 - 44')) ageCounts['35_44']++;
                else if (age.includes('45')) ageCounts.over45++;

                // นับเพศ
                let gender = row['เพศ'] || "";
                if (gender === 'ชาย') genderCounts.male++;
                else if (gender === 'หญิง') genderCounts.female++;
                else if (gender.includes('ทางเลือก')) genderCounts.lgbtq++;
                else genderCounts.not_specified++;

                // นับอาชีพ
                let occ = row['อาชีพ'] || "";
                if (occ.includes('นักเรียน') || occ.includes('นักศึกษา')) occCounts.student++;
                else if (occ.includes('บริษัท') || occ.includes('เงินเดือน')) occCounts.employee++;
                else if (occ.includes('ราชการ') || occ.includes('วิสาหกิจ')) occCounts.government++;
                else if (occ.includes('ส่วนตัว') || occ.includes('ฟรีแลนซ์')) occCounts.freelance++;
                else if (occ.includes('ว่างงาน') || occ.includes('บ้าน')) occCounts.unemployed++;
                else occCounts.other++;
            });

            // 3. แสดงผลตัวเลขสรุปด้านบน
            document.getElementById('totalUsers').innerText = totalUsers + " คน";

            // หาช่วงอายุที่เยอะที่สุด
            const ageLabelsMap = {
                under18: 'ต่ำกว่า 18 ปี', '18_24': '18 - 24 ปี', '25_34': '25 - 34 ปี', '35_44': '35 - 44 ปี', over45: '45 ปีขึ้นไป'
            };
            let topAgeKey = Object.keys(ageCounts).reduce((a, b) => ageCounts[a] > ageCounts[b] ? a : b);
            
            // ป้องกันกรณีไม่มีข้อมูลเลย
            if (ageCounts[topAgeKey] === 0) {
                document.getElementById('topAgeGroup').innerText = "ยังไม่มีข้อมูล";
            } else {
                document.getElementById('topAgeGroup').innerText = ageLabelsMap[topAgeKey];
            }

            // 4. วาดกราฟอายุ (Doughnut Chart)
            const ctxAge = document.getElementById('ageChart').getContext('2d');
            new Chart(ctxAge, {
                type: 'doughnut',
                data: {
                    labels: ['ต่ำกว่า 18 ปี', '18 - 24 ปี', '25 - 34 ปี', '35 - 44 ปี', '45 ปีขึ้นไป'],
                    datasets: [{
                        data: [ageCounts.under18, ageCounts['18_24'], ageCounts['25_34'], ageCounts['35_44'], ageCounts.over45],
                        backgroundColor: themeColors,
                        borderWidth: 2
                    }]
                },
                options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Prompt' } } } } }
            });

            // 5. วาดกราฟเพศ (Pie Chart)
            const ctxGender = document.getElementById('genderChart').getContext('2d');
            new Chart(ctxGender, {
                type: 'pie',
                data: {
                    labels: ['ชาย', 'หญิง', 'เพศทางเลือก', 'ไม่ระบุ'],
                    datasets: [{
                        data: [genderCounts.male, genderCounts.female, genderCounts.lgbtq, genderCounts.not_specified],
                        backgroundColor: ['#3b82f6', '#d84b6b', '#8b5cf6', '#cbd5e1'],
                        borderWidth: 2
                    }]
                },
                options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Prompt' } } } } }
            });

            // 6. วาดกราฟอาชีพ (Bar Chart แนวนอน)
            const ctxOcc = document.getElementById('occupationChart').getContext('2d');
            new Chart(ctxOcc, {
                type: 'bar',
                data: {
                    labels: ['นักเรียน/นักศึกษา', 'พนักงานบริษัท', 'ข้าราชการ/รัฐวิสาหกิจ', 'ธุรกิจส่วนตัว/ฟรีแลนซ์', 'ว่างงาน/พ่อบ้านแม่บ้าน', 'อื่นๆ'],
                    datasets: [{
                        label: 'จำนวนคน',
                        data: [occCounts.student, occCounts.employee, occCounts.government, occCounts.freelance, occCounts.unemployed, occCounts.other],
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
                        x: { ticks: { font: { family: 'Prompt' }, stepSize: 1 } }, // เปลี่ยน stepSize เป็น 1 เพื่อให้อ่านค่าง่ายเวลาคนน้อย
                        y: { ticks: { font: { family: 'Prompt' } } }
                    }
                }
            });

        } else {
            console.error("ไม่สามารถดึงข้อมูลได้");
            document.getElementById('totalUsers').innerText = "ข้อผิดพลาด";
            document.getElementById('topAgeGroup').innerText = "ข้อผิดพลาด";
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
        document.getElementById('totalUsers').innerText = "ข้อผิดพลาด";
        document.getElementById('topAgeGroup').innerText = "ข้อผิดพลาด";
    }
}

// เรียกใช้งานฟังก์ชันเมื่อเปิดหน้าเว็บ
document.addEventListener("DOMContentLoaded", fetchAndRenderStatistics);
