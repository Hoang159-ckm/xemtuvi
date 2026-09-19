const zodiacSigns = [
  { name: "Bạch Dương", symbol: "♈", start: [3, 21], end: [4, 19], dates: "21/03 — 19/04", reading: "Một nguồn năng lượng tiên phong, thẳng thắn và luôn sẵn sàng mở lối." },
  { name: "Kim Ngưu", symbol: "♉", start: [4, 20], end: [5, 20], dates: "20/04 — 20/05", reading: "Kiên định, tinh tế và biết cách biến những điều nhỏ bé thành giá trị bền lâu." },
  { name: "Song Tử", symbol: "♊", start: [5, 21], end: [6, 20], dates: "21/05 — 20/06", reading: "Một tâm trí linh hoạt, tò mò và luôn tìm thấy nhiều hơn một góc nhìn." },
  { name: "Cự Giải", symbol: "♋", start: [6, 21], end: [7, 22], dates: "21/06 — 22/07", reading: "Nhạy cảm, giàu yêu thương và có khả năng tạo nên cảm giác thuộc về." },
  { name: "Sư Tử", symbol: "♌", start: [7, 23], end: [8, 22], dates: "23/07 — 22/08", reading: "Ấm áp, sáng tạo và mang trong mình ánh sáng khiến người khác muốn đến gần." },
  { name: "Xử Nữ", symbol: "♍", start: [8, 23], end: [9, 22], dates: "23/08 — 22/09", reading: "Tinh tế, thực tế và luôn âm thầm làm mọi thứ tốt hơn từng chút một." },
  { name: "Thiên Bình", symbol: "♎", start: [9, 23], end: [10, 22], dates: "23/09 — 22/10", reading: "Yêu cái đẹp, đề cao sự cân bằng và biết cách kết nối những tâm hồn khác nhau." },
  { name: "Bọ Cạp", symbol: "♏", start: [10, 23], end: [11, 21], dates: "23/10 — 21/11", reading: "Sâu sắc, mạnh mẽ và sở hữu một trực giác hiếm khi dẫn bạn đi sai hướng." },
  { name: "Nhân Mã", symbol: "♐", start: [11, 22], end: [12, 21], dates: "22/11 — 21/12", reading: "Tự do, lạc quan và luôn mang theo một câu hỏi lớn trên hành trình của mình." },
  { name: "Ma Kết", symbol: "♑", start: [12, 22], end: [1, 19], dates: "22/12 — 19/01", reading: "Bền bỉ, có định hướng và biết kiên nhẫn xây nên điều đáng tự hào." },
  { name: "Bảo Bình", symbol: "♒", start: [1, 20], end: [2, 18], dates: "20/01 — 18/02", reading: "Độc lập, khác biệt và luôn nhìn thấy một tương lai mà người khác chưa kịp nghĩ đến." },
  { name: "Song Ngư", symbol: "♓", start: [2, 19], end: [3, 20], dates: "19/02 — 20/03", reading: "Giàu cảm nhận, giàu tưởng tượng và kết nối với thế giới bằng trái tim rộng mở." }
];

const form = document.querySelector("#birth-form");
const dateInput = document.querySelector("#birth-date");
const resultSection = document.querySelector("#result-section");
const errorMessage = document.querySelector("#form-error");
const birthTimeInput = document.querySelector("#birth-time");
const birthPlaceInput = document.querySelector("#birth-place");

dateInput.max = new Date().toISOString().split("T")[0];

function getZodiac(month, day) {
  return zodiacSigns.find((sign) => {
    const afterStart = month > sign.start[0] || (month === sign.start[0] && day >= sign.start[1]);
    const beforeEnd = month < sign.end[0] || (month === sign.end[0] && day <= sign.end[1]);
    return sign.start[0] > sign.end[0] ? afterStart || beforeEnd : afterStart && beforeEnd;
  }) || zodiacSigns[0];
}

function getLifePath(dateString) {
  const digits = dateString.replaceAll("-", "").split("").map(Number);
  let total = digits.reduce((sum, digit) => sum + digit, 0);
  while (total > 9 && ![11, 22, 33].includes(total)) {
    total = String(total).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return total;
}

const animalSigns = ["Khỉ", "Gà", "Chó", "Lợn", "Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê"];
const taiGroups = {
  "Khỉ": ["Dần", "Mão", "Thìn"], "Chuột": ["Dần", "Mão", "Thìn"], "Rồng": ["Dần", "Mão", "Thìn"],
  "Hổ": ["Thân", "Dậu", "Tuất"], "Ngựa": ["Thân", "Dậu", "Tuất"], "Chó": ["Thân", "Dậu", "Tuất"],
  "Lợn": ["Tỵ", "Ngọ", "Mùi"], "Mèo": ["Tỵ", "Ngọ", "Mùi"], "Dê": ["Tỵ", "Ngọ", "Mùi"],
  "Rắn": ["Hợi", "Tý", "Sửu"], "Gà": ["Hợi", "Tý", "Sửu"], "Trâu": ["Hợi", "Tý", "Sửu"]
};
const yearBranches = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
const hexagrams = [
  { name: "Quẻ Khởi đầu", reading: "Một cánh cửa đang mở. Hãy bắt đầu bằng việc nhỏ nhất nhưng thật rõ ràng.", lines: [1, 0, 1, 1, 0, 0] },
  { name: "Quẻ Tĩnh lặng", reading: "Đừng vội ép câu trả lời xuất hiện. Khoảng dừng hôm nay cũng là một dạng tiến lên.", lines: [0, 0, 1, 0, 1, 0] },
  { name: "Quẻ Gặp gỡ", reading: "Một cuộc trò chuyện chân thành có thể đưa bạn đến nơi mà kế hoạch không thể.", lines: [1, 1, 0, 0, 1, 1] },
  { name: "Quẻ Chuyển mình", reading: "Điều cũ đang nhường chỗ cho điều phù hợp hơn. Hãy nhẹ tay với những gì cần rời đi.", lines: [0, 1, 1, 1, 1, 0] }
];

function getAnimalSign(year) {
  return animalSigns[(year - 1992) % 12];
}

function getHexagram(dateString) {
  const seed = dateString.replaceAll("-", "").split("").reduce((sum, digit) => sum + Number(digit), 0);
  return hexagrams[seed % hexagrams.length];
}

function renderHexagram(hexagram) {
  document.querySelector("#hexagram-lines").innerHTML = hexagram.lines.map((solid) => `<span class="hex-line ${solid ? "solid" : "broken"}"></span>`).join("");
}

function renderReadings(date) {
  const year = date.getFullYear();
  const animal = getAnimalSign(year);
  const currentBranch = yearBranches[(2026 - 1992) % 12];
  const taiYears = taiGroups[animal];
  const inTai = taiYears.includes(currentBranch);
  const zodiac = getZodiac(date.getMonth() + 1, date.getDate());
  const timeText = birthTimeInput.value ? ` lúc ${birthTimeInput.value}` : "";
  const placeText = birthPlaceInput.value.trim() || "nơi bạn sinh ra";
  const hexagram = getHexagram(dateInput.value);

  document.querySelector("#star-map-title").textContent = `Bầu trời ${placeText}`;
  document.querySelector("#star-map-reading").textContent = `Mặt trời ${zodiac.name} dẫn đường bằng sự tự tin${timeText}. Hãy để trực giác và sự tò mò cùng xuất hiện trong lựa chọn của bạn.`;
  document.querySelector("#sun-placement").textContent = `Mặt trời · ${zodiac.name}`;
  document.querySelector("#moon-placement").textContent = `Mặt trăng · ${["Lửa", "Đất", "Khí", "Nước"][year % 4]}`;
  document.querySelector("#rising-placement").textContent = `Cung mọc · ${birthTimeInput.value ? "đã thêm giờ sinh" : "cần giờ sinh để rõ hơn"}`;
  document.querySelector("#tai-year").textContent = "2026";
  document.querySelector("#animal-sign").textContent = animal;
  document.querySelector("#tai-title").textContent = inTai ? "Năm cần chậm lại" : "Một năm bình hòa";
  document.querySelector("#tai-reading").textContent = inTai ? `Tuổi ${animal} đang ở nhóm tam tai (${taiYears.join(" · ")}). Ưu tiên sự chắc chắn, tránh quyết định nóng vội và chăm sóc sức khỏe.` : `Tuổi ${animal} không nằm trong nhóm tam tai năm nay. Đây là lúc giữ nhịp ổn định và vun bồi điều quan trọng.`;
  document.querySelector("#hexagram-name").textContent = hexagram.name;
  document.querySelector("#hexagram-reading").textContent = hexagram.reading;
  renderHexagram(hexagram);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = new Date(`${dateInput.value}T12:00:00`);
  if (!dateInput.value || Number.isNaN(date.getTime()) || date > new Date()) {
    errorMessage.hidden = false;
    return;
  }

  errorMessage.hidden = true;
  const zodiac = getZodiac(date.getMonth() + 1, date.getDate());
  document.querySelector("#zodiac-symbol").textContent = zodiac.symbol;
  document.querySelector("#zodiac-name").textContent = zodiac.name;
  document.querySelector("#zodiac-date").textContent = zodiac.dates;
  document.querySelector("#zodiac-reading").textContent = zodiac.reading;
  document.querySelector("#life-number").textContent = getLifePath(dateInput.value);
  document.querySelector("#result-title").textContent = `Xin chào, ${date.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}`;
  renderReadings(date);
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#reset-button").addEventListener("click", () => {
  resultSection.hidden = true;
  document.querySelector("#tra-cuu").scrollIntoView({ behavior: "smooth" });
  dateInput.focus();
});

document.querySelector("#draw-again").addEventListener("click", () => {
  const randomHexagram = hexagrams[Math.floor(Math.random() * hexagrams.length)];
  document.querySelector("#hexagram-name").textContent = randomHexagram.name;
  document.querySelector("#hexagram-reading").textContent = randomHexagram.reading;
  renderHexagram(randomHexagram);
});

const paymentModal = document.querySelector("#payment-modal");
const extraReadings = document.querySelector("#extra-readings");
const transactionInput = document.querySelector("#transaction-code");
const paymentButton = document.querySelector("#payment-success");
const paymentStatus = document.querySelector("#payment-status");
const paymentVerifyEndpoint = "/api/payments/verify";

function closePaymentModal() {
  paymentModal.hidden = true;
}

document.querySelector("#unlock-button").addEventListener("click", () => {
  paymentModal.hidden = false;
  document.querySelector("#payment-success").focus();
});

document.querySelector("#close-payment").addEventListener("click", closePaymentModal);
document.querySelector("[data-close-payment]").addEventListener("click", closePaymentModal);

paymentButton.addEventListener("click", async () => {
  const transactionCode = transactionInput.value.trim();
  if (!transactionCode) {
    paymentStatus.hidden = false;
    paymentStatus.className = "payment-status";
    paymentStatus.textContent = "Vui lòng nhập mã giao dịch sau khi chuyển khoản.";
    transactionInput.focus();
    return;
  }

  paymentButton.disabled = true;
  paymentStatus.hidden = false;
  paymentStatus.className = "payment-status";
  paymentStatus.textContent = "Đang kiểm tra giao dịch...";

  try {
    const response = await fetch(paymentVerifyEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionCode, amount: 50000 })
    });
    const result = await response.json();
    if (!response.ok || result.verified !== true) {
      throw new Error(result.message || "Chưa tìm thấy giao dịch hợp lệ.");
    }

    extraReadings.classList.remove("locked-content");
    extraReadings.classList.add("unlocked-content");
    document.querySelector("#unlock-panel").remove();
    closePaymentModal();
  } catch (error) {
    paymentStatus.textContent = error instanceof TypeError
      ? "Chưa kết nối được máy chủ kiểm tra giao dịch. Vui lòng liên hệ quản trị viên."
      : error.message || "Chưa thể kiểm tra giao dịch. Vui lòng thử lại.";
  } finally {
    paymentButton.disabled = false;
  }
});
