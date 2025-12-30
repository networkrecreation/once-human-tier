// ==============================
// Sidebar (sidebar_data sheet)
// ==============================

console.log("sidebar.js loaded");

// CSV URL（sidebar_data）
const sidebarCsvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=sidebar_data`;

fetch(sidebarCsvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = "";

    rows.forEach(row => {

      // ==========================
      // 親タブ
      // ==========================
      const tab = document.createElement("div");
      tab.className = "tab";

      // ▶ toggle
      let toggle = null;
      if (row.children && String(row.sheet) !== "0") {
        toggle = document.createElement("span");
        toggle.className = "sidebar-toggle";
        toggle.textContent = "▶";
        tab.appendChild(toggle);
      }

      // 親リンク領域（画像＋文字）
      const linkArea = document.createElement("div");
      linkArea.className = "tab-link";

      if (row.image && row.image !== "---") {
        const img = document.createElement("img");
        img.src = BASE_URL + "img/" + row.image;
        img.onerror = () => img.remove();
        linkArea.appendChild(img);
      }

      const label = document.createElement("span");
      label.textContent = row.name || "";
      linkArea.appendChild(label);

      tab.appendChild(linkArea);

      // active 判定（sheet番号）
      if (String(row.sheet) === String(currentSheet)) {
        tab.classList.add("active");
      }

      // 親クリック（遷移）
      linkArea.onclick = (e) => {
        e.stopPropagation();
        location.href = `index.html?sheet=${row.link}`;
      };

      sidebar.appendChild(tab);

      // ==========================
      // children
      // ==========================
      if (!row.children || String(row.sheet) === "0") return;

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
        const image = parts[2];
        const link = parts[3];

        const child = document.createElement("div");
        child.className = "child-item";

        if (image && image !== "---") {
          const childImg = document.createElement("img");
          childImg.src = BASE_URL + "img/" + image;
          childImg.onerror = () => childImg.remove();
          child.appendChild(childImg);
        }

        const childLabel = document.createElement("span");
        childLabel.textContent = `${tier} ${name}`;
        child.appendChild(childLabel);

        // active child
        if (String(link) === String(currentSheet)) {
          child.classList.add("active");
          childrenBox.style.display = "block";
          if (toggle) toggle.textContent = "▼";
        }

        // child click
        child.onclick = (e) => {
          e.stopPropagation();
          location.href = `index.html?sheet=${link}`;
        };

        childrenBox.appendChild(child);
      });

      sidebar.appendChild(childrenBox);

      // ==========================
      // 開閉
      // ==========================
      tab.onclick = () => {
        const opened = childrenBox.style.display === "block";
        childrenBox.style.display = opened ? "none" : "block";
        if (toggle) toggle.textContent = opened ? "▶" : "▼";
      };
    });
  })
  .catch(err => {
    console.error("sidebar CSV error:", err);
  });
