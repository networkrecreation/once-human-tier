// ==============================
// 設定
// ==============================
const BASE_URL = "https://networkrecreation.github.io/once-human-tier/";
const sheetID = "1vAozJYflA2QBeDXG_LmIo_SmHWFleFy3ZolVQsADZ8s";

const params = new URLSearchParams(location.search);
const sheetName = params.get("sheet") || "once_human";

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
// シート画像
// ==============================
const sheetImage = document.getElementById("sheetImage");
sheetImage.src = BASE_URL + "img/" + sheetName + ".png";
sheetImage.alt = sheetName;

// ==============================
// Tier 表示
// ==============================
const csvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const container = document.getElementById("content");

    // ==========================
    // I 行（ページ情報）
    // ==========================
    const infoRow = rows.find(r => r.tier === "I");
    if (infoRow) {
      document.getElementById("subtitle").textContent =
        `${infoRow.name} Tier`;

      document.getElementById("description").textContent =
        infoRow.info && infoRow.info !== "---"
          ? infoRow.info
          : "";
    }

    // ==========================
    // Tier データ
    // ==========================
    const tierItems = rows.filter(r => tierOrder.includes(r.tier));
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
    // 詳細説明
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
  if (window.scrollY > 300) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
