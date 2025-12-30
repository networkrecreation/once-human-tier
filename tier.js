// ==============================
// 設定
// ==============================
const BASE_URL = "https://networkrecreation.github.io/once-human-tier/";
const SHEET_ID = "1UXkHW7ANcE2neVo6iD6OxqwnW_scyBezZEcRFD8ImxI";
const DATA_SHEET = "data";

// URL ?sheet=35 など
const params = new URLSearchParams(location.search);
const sheetNo = params.get("sheet") || "0";

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

// Tier 表示順
const tierOrder = ["S", "A", "B", "C", "D", "E", "F"];

// ==============================
// CSV 読み込み
// ==============================
const csvUrl =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${DATA_SHEET}`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);

    // ==========================
    // 対象 sheet のみ抽出
    // ==========================
    const pageRows = rows.filter(r => String(r.sheet) === String(sheetNo));

    if (!pageRows.length) {
      document.getElementById("content").innerHTML =
        `<p>データが見つかりません (sheet=${sheetNo})</p>`;
      return;
    }

    const container = document.getElementById("content");

    // ==========================
    // I 行（ページ情報）
    // ==========================
    const infoRow = pageRows.find(r => r.tier === "I");
    if (infoRow) {
      document.getElementById("subtitle").textContent =
        `${infoRow.name} Tier`;

      document.getElementById("description").textContent =
        infoRow.info && infoRow.info !== "---" ? infoRow.info : "";
    }

    // ==========================
    // Tier 行（S〜F）
    // ==========================
    const tierItems = pageRows.filter(r => tierOrder.includes(r.tier));

    const groups = {};
    tierItems.forEach(item => {
      if (!groups[item.tier]) groups[item.tier] = [];
      groups[item.tier].push(item);
    });

    // ==========================
    // Tier 表示
    // ==========================
    tierOrder.forEach(tier => {
      if (!groups[tier]) return;

      const section = document.createElement("div");
      section.className = "tier-section";

      section.innerHTML =
        `<div class="tier-title tier-${tier}">Tier ${tier}</div>`;

      const itemsBox = document.createElement("div");
      itemsBox.className = "tier-items";

      groups[tier].forEach(item => {
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

    // ==========================
    // 詳細説明（infoあり全量）
    // ==========================
    const detailItems = pageRows.filter(
      r => r.info && r.info !== "---" && r.tier !== "I"
    );

    if (detailItems.length) {
      const textSection = document.createElement("div");
      textSection.className = "text-section";

      const title = document.createElement("h2");
      title.textContent = "詳細説明";
      textSection.appendChild(title);

      detailItems.forEach(item => {
        const hasImage = item.image && item.image !== "---";
        const imgSrc = hasImage
          ? BASE_URL + "img/" + item.image
          : "";

        const row = document.createElement("div");
        row.className = "text-row";

        row.innerHTML = `
          <a href="index.html?sheet=${item.link}">
            ${hasImage ? `<img src="${imgSrc}" alt="${item.name}">` : ""}
          </a>
          <div class="text-row-content">
            <h3>${item.name}</h3>
            <p>${item.info}</p>
          </div>
        `;

        textSection.appendChild(row);
      });

      container.appendChild(textSection);
    }
  })
  .catch(err => console.error("CSV error:", err));

// ==============================
// TOP ボタン
// ==============================
const topButton = document.getElementById("topButton");

window.addEventListener("scroll", () => {
  topButton.classList.toggle("show", window.scrollY > 300);
});

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
