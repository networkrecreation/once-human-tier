// ==============================
// 設定
// ==============================
const BASE_URL = "https://networkrecreation.github.io/once-human-tier/";
const sheetID  = "1UXkHW7ANcE2neVo6iD6OxqwnW_scyBezZEcRFD8ImxI";

const params = new URLSearchParams(location.search);
const currentSheet = params.get("sheet") ?? "0"; // 数値ID

const tierOrder = ["S", "A", "B", "C", "D", "E", "F"];

// ==============================
// CSV パース
// ==============================
function parseCSV(text) {
  const rows = text.split(/\r?\n/).filter(r => r.trim());
  const headers = rows[0]
    .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
    .map(h => h.replace(/"/g, "").trim());

  return rows.slice(1).map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] ? cols[i].replace(/"/g, "").trim() : "";
    });
    return obj;
  });
}

// ==============================
// data シート読み込み
// ==============================
const csvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=data`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);

    const container   = document.getElementById("content");
    const subtitle    = document.getElementById("subtitle");
    const description = document.getElementById("description");

    container.innerHTML = "";
    subtitle.textContent = "";
    description.textContent = "";

    // 既存 info 画像を削除
    const oldInfoImg = document.querySelector(".info-image");
    if (oldInfoImg) oldInfoImg.remove();

    // ==========================
    // 対象 sheet 抽出
    // ==========================
    const sheetRows = rows.filter(
      r => String(r.sheet) === String(currentSheet)
    );
    if (!sheetRows.length) return;

    // ==========================
    // I 行（ページ情報）
    // ==========================
    const infoRow = sheetRows.find(r => r.tier === "I");

    if (infoRow) {
      subtitle.textContent = infoRow.name;

      if (infoRow.info && infoRow.info !== "---") {
        description.textContent = infoRow.info;
      }

      // info 用画像
      if (infoRow.image && infoRow.image !== "---") {
        const img = document.createElement("img");
        img.src = BASE_URL + "img/" + infoRow.image;
        img.alt = infoRow.name;
        img.className = "info-image";

        subtitle.parentNode.insertBefore(img, subtitle);
      }
    }

    // ==========================
    // Tier ごとに分類
    // ==========================
    const tierMap = {};
    tierOrder.forEach(t => (tierMap[t] = []));

    sheetRows.forEach(r => {
      if (tierOrder.includes(r.tier)) {
        tierMap[r.tier].push(r);
      }
    });

    // ==========================
    // Tier 描画
    // ==========================
    tierOrder.forEach(tier => {
      const items = tierMap[tier];
      if (!items.length) return;

      const section = document.createElement("div");
      section.className = "tier-section";

      section.innerHTML =
        `<div class="tier-title tier-${tier}">Tier ${tier}</div>`;

      const itemsBox = document.createElement("div");
      itemsBox.className = "tier-items";

      items.forEach(item => {
        const hasImage = item.image && item.image !== "---";
        const imgSrc = hasImage
          ? BASE_URL + "img/" + item.image
          : "";

        itemsBox.innerHTML += `
          <div class="item"
               onclick="location.href='index.html?sheet=${item.link}'">
            ${hasImage ? `<img src="${imgSrc}" alt="${item.name}">` : ""}
            <div class="name">${item.name}</div>
          </div>
        `;
      });

      section.appendChild(itemsBox);
      container.appendChild(section);
    });
  })
  .catch(err => console.error("CSV error:", err));

// ==============================
// TOP ボタン
// ==============================
const topButton = document.getElementById("topButton");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
