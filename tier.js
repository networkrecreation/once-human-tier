// ==============================
// 設定
// ==============================
const BASE_URL = "https://networkrecreation.github.io/once-human-tier/";
const sheetID = "1UXkHW7ANcE2neVo6iD6OxqwnW_scyBezZEcRFD8ImxI";

const params = new URLSearchParams(location.search);
const currentSheet = params.get("sheet"); // 数字 or null

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
// CSV 読み込み（dataシート）
// ==============================
const csvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=data`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const container = document.getElementById("content");
    container.innerHTML = "";

    // ==========================
    // sheet ごとにグループ化
    // ==========================
    const sheetGroups = {};
    rows.forEach(r => {
      if (!sheetGroups[r.sheet]) sheetGroups[r.sheet] = [];
      sheetGroups[r.sheet].push(r);
    });

    // sheet番号昇順で処理
    Object.keys(sheetGroups)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(sheetNo => {
        const sheetRows = sheetGroups[sheetNo];

        // ======================
        // I 行（ページ情報）
        // ======================
        const infoRow = sheetRows.find(r => r.tier === "I");
        if (!infoRow) return;

        const section = document.createElement("section");
        section.className = "sheet-section";

        // 見出し
        section.innerHTML = `
          <h2 class="sheet-title">
            ${infoRow.name}
            <span class="sheet-id">#${sheetNo}</span>
          </h2>
          ${infoRow.info && infoRow.info !== "---"
            ? `<p class="sheet-desc">${infoRow.info}</p>`
            : ""}
        `;

        // ======================
        // Tier 表示
        // ======================
        tierOrder.forEach(tier => {
          const items = sheetRows.filter(r => r.tier === tier);
          if (!items.length) return;

          const tierBox = document.createElement("div");
          tierBox.className = "tier-section";

          tierBox.innerHTML =
            `<div class="tier-title tier-${tier}">Tier ${tier}</div>`;

          const itemsBox = document.createElement("div");
          itemsBox.className = "tier-items";

          items.forEach(item => {
            const hasImage = item.image && item.image !== "---";
            const imgSrc = hasImage
              ? BASE_URL + "img/" + item.image
              : "";

            const activeClass =
              currentSheet === item.link ? "active" : "";

            itemsBox.innerHTML += `
              <div class="item ${activeClass}"
                   onclick="location.href='index.html?sheet=${item.link}'">
                ${hasImage ? `<img src="${imgSrc}" alt="${item.name}">` : ""}
                <div class="name">${item.name}</div>
              </div>
            `;
          });

          tierBox.appendChild(itemsBox);
          section.appendChild(tierBox);
        });

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
