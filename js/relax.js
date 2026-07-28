function openModal(imgSrc) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("fullImage");
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
    // รีเซ็ตการซูมทุกครั้งที่เปิดรูปใหม่
    modalImg.classList.remove("zoomed");
}

// ฟังก์ชันสลับการซูมรูปเข้า-ออก
function toggleZoom(event) {
    event.stopPropagation(); // หยุดไม่ให้ event ไปเรียก closeModal ด้านหลัง
    var img = document.getElementById("fullImage");
    img.classList.toggle("zoomed");
}

function closeModal(event) {
    // ป้องกันไม่ให้ปิดเมื่อคลิกที่รูปภาพตรงๆ (ให้ทำงานแค่การซูม)
    if (event && event.target.id === 'fullImage') return;
    
    document.getElementById("imageModal").style.display = "none";
}