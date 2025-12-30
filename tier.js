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
// CSV 読み込み（dataシートのみ）
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
    // sheet番号ごとにグループ化
    // ==========================
    const sheetGroups = {};
    rows.forEach(r => {
      if (!sheetGroups[r.sheet]) sheetGroups[r.sheet] = [];
      sheetGroups[r.sheet].push(r);
    });

    // ==========================
    // sheet番号 昇順で全量描画
    // ==========================
    Object.keys(sheetGroups)
      .map(n => Number(n))
      .sort((a, b) => a - b)
      .forEach(sheetNo => {
        const sheetRows = sheetGroups[sheetNo];

        // ======================
        // I 行（ページ情報）
        // ======================
        const infoRow = sheetRows.find(r => r.tier === "I");
        if (!infoRow) return;

        const section = document.createElement("section");
        section.className = "sheet-section";

        // ----- 見出し + I画像 -----
        const header = document.createElement("div");
        header.className = "sheet-header";

        if (infoRow.image && infoRow.image !== "---") {
          const img = document.createElement("img");
          img.src = `${BASE_URL}img/${infoRow.image}?v=${Date.now()}`;
          img.alt = infoRow.name;
          img.className = "sheet-image";
          header.appendChild(img);
        }

        const titleBox = document.createElement("div");
        titleBox.className = "sheet-title-box";
        titleBox.innerHTML = `
          <h2 class="sheet-title">
            ${infoRow.name}
            <span class="sheet-id">#${sheetNo}</span>
          </h2>
          ${
            infoRow.info && infoRow.info !== "---"
              ? `<p class="sheet-desc">${infoRow.info}</p>`
              : ""
          }
        `;

        header.appendChild(titleBox);
        section.appendChild(header);

        // ======================
        // Tier 表示（S〜F）
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
              ? `${BASE_URL}img/${item.image}?v=${Date.now()}`
              : "";

            const activeClass =
              currentSheet === item.link ? "active" : "";

            const itemDiv = document.createElement("div");
            itemDiv.className = `item ${activeClass}`;
            itemDiv.onclick = () => {
              if (item.link) {
                location.href = `index.html?sheet=${item.link}`;
              }
            };

            if (hasImage) {
              const img = document.createElement("img");
              img.src = imgSrc;
              img.alt = item.name;
              itemDiv.appendChild(img);
            }

            const name = document.createElement("div");
            name.className = "name";
            name.textContent = item.name;

            itemDiv.appendChild(name);
            itemsBox.appendChild(itemDiv);
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
