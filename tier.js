// ==============================
// 設定
// ==============================
const BASE_URL = "https://networkrecreation.github.io/once-human-tier/";
const sheetID = "1UXkHW7ANcE2neVo6iD6OxqwnW_scyBezZEcRFD8ImxI";
const DATA_SHEET = "data";

const params = new URLSearchParams(location.search);
const sheetId = params.get("sheet") ?? "0";

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

const tierOrder = ["S", "A", "B", "C", "D", "E", "F"];

// ==============================
// CSV 読み込み
// ==============================
const csvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=${DATA_SHEET}`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const container = document.getElementById("content");

    // ==========================
    // 対象 sheet ブロック抽出
    // ==========================
    const pageRows = rows.filter(r => r.sheet === sheetId);

    // ==========================
    // I / O 行（ページ情報）
    // ==========================
    const infoRow = pageRows.find(r => r.tier === "I" || r.tier === "O");
    if (infoRow) {
      document.getElementById("subtitle").textContent =
        `${infoRow.name} Tier`;

      document.getElementById("description").textContent =
        infoRow.info && infoRow.info !== "---" ? infoRow.info : "";
    }

    // ==========================
    // Tier データ
    // ==========================
    const tierItems = pageRows.filter(r => tierOrder.includes(r.tier));
    const groups = {};

    tierItems.forEach(item => {
      if (!groups[item.tier]) groups[item.tier] = [];
      groups[item.tier].push(item);
    });

    // ==========================
    // Tier 描画
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
        const imgSrc = hasImage ? BASE_URL + "img/" + item.image : "";

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
    // 詳細説明（infoあり）
    // ==========================
    const detailItems = tierItems.filter(
      item => item.info && item.info !== "---"
    );

    if (detailItems.length) {
      const textSection = document.createElement("div");
      textSection.className = "text-section";

      const title = document.createElement("h2");
      title.textContent = "詳細説明";
      textSection.appendChild(title);

      detailItems.forEach(item => {
        const hasImage = item.image && item.image !== "---";
        const imgSrc = hasImage ? BASE_URL + "img/" + item.image : "";

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
