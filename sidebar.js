// ==============================
// Sidebar (index sheet)
// ==============================

console.log("sidebar.js loaded");

// index sheet CSV
const indexCsvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=index`;

fetch(indexCsvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const sidebar = document.getElementById("sidebar");

    rows.forEach(row => {

      // ==========================
      // 親タブ
      // ==========================
      const tab = document.createElement("div");
      tab.className = "tab";

      // ▶ toggle
      let toggle = null;

      if (row.children && row.link !== "once_human") {
        toggle = document.createElement("span");
        toggle.className = "sidebar-toggle";
        toggle.textContent = "▶";
        tab.appendChild(toggle);
      }

      // 親リンク領域（画像＋文字）
      const linkArea = document.createElement("div");
      linkArea.className = "tab-link";

      const img = document.createElement("img");
      img.src = BASE_URL + "img/" + row.sheet + ".png";
      img.onerror = () => img.remove();

      const label = document.createElement("span");
      label.textContent = row.name;

      linkArea.appendChild(img);
      linkArea.appendChild(label);
      tab.appendChild(linkArea);

      // active 判定
      if (row.link === sheetName) {
        tab.classList.add("active");
      }

      // 親リンククリック（遷移）
      linkArea.onclick = (e) => {
        e.stopPropagation();
        location.href = `index.html?sheet=${row.link}`;
      };

      sidebar.appendChild(tab);

      // ==========================
      // children（once_human 除外）
      // ==========================
      if (!row.children || row.link === "once_human") {
        return;
      }

      const childrenBox = document.createElement("div");
      childrenBox.className = "sidebar-children";
      childrenBox.style.display = "none";

      const children = row.children
        .split(",")
        .map(c => c.trim())
        .filter(Boolean);

      children.forEach(childStr => {
        const parts = childStr.split(":");
        if (parts.length < 4) return;

        const tier = parts[0];
        const name = parts[1];
        const imgFile = parts[2];
        const link = parts[3];

        const child = document.createElement("div");
        child.className = "child-item";

        const childImg = document.createElement("img");
        childImg.src = BASE_URL + "img/" + imgFile;
        childImg.onerror = () => childImg.remove();

        const childLabel = document.createElement("span");
        childLabel.textContent = `${tier} ${name}`;

        child.appendChild(childImg);
        child.appendChild(childLabel);

        // active child
        if (link === sheetName) {
          child.classList.add("active");
          childrenBox.style.display = "block";
          toggle.textContent = "▼";
        }

        // child click（遷移）
        child.onclick = (e) => {
          e.stopPropagation();
          location.href = `index.html?sheet=${link}`;
        };

        childrenBox.appendChild(child);
      });

      sidebar.appendChild(childrenBox);

      // ==========================
      // 開閉判定（縦に広い）
      // ==========================
      tab.onclick = () => {
        const opened = childrenBox.style.display === "block";
        childrenBox.style.display = opened ? "none" : "block";
        toggle.textContent = opened ? "▶" : "▼";
      };
    });
  })
  .catch(err => {
    console.error("sidebar CSV error:", err);
  });
