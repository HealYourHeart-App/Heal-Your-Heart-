function openModal(imgSrc) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("fullImage");
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
    modalImg.classList.remove("zoomed"); // รีเซ็ตการซูมทุกครั้งที่เปิด
}

// ฟังก์ชันสลับการซูม
function toggleZoom(event) {
    event.stopPropagation(); // หยุด event ไม่ให้เรียก closeModal
    var img = document.getElementById("fullImage");
    img.classList.toggle("zoomed");
}

function closeModal(event) {
    // ป้องกันปิดเมื่อคลิกที่รูป
    if (event && event.target.id === 'fullImage') return;
    document.getElementById("imageModal").style.display = "none";
}