// ==============================
// Sidebar (sidebar_data sheet)
// ==============================

console.log("sidebar.js loaded");

const sheetID = "1UXkHW7ANcE2neVo6iD6OxqwnW_scyBezZEcRFD8ImxI";
const DATA_SHEET = "sidebar_data";

const params = new URLSearchParams(location.search);
const currentSheetId = params.get("sheet") ?? "0";

// CSV URL
const csvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=${DATA_SHEET}`;

fetch(csvUrl)
  .then(res => res.text())
  .then(text => {
    const rows = parseCSV(text);
    const sidebar = document.getElementById("sidebar");

    // ==========================
    // sheet ごとにグループ化
    // ==========================
    const groups = {};
    rows.forEach(r => {
      if (!groups[r.sheet]) groups[r.sheet] = [];
      groups[r.sheet].push(r);
    });

    // ==========================
    // 親（tier I）でループ
    // ==========================
    Object.keys(groups).forEach(sheetId => {
      const block = groups[sheetId];

      const parent = block.find(r => r.tier === "I");
      if (!parent) return;

      const children = block.filter(
        r => r.tier !== "I" && r.tier !== "O"
      );

      // ======================
      // 親タブ
      // ======================
      const tab = document.createElement("div");
      tab.className = "tab";

      // toggle
      let toggle = null;
      if (children.length) {
        toggle = document.createElement("span");
        toggle.className = "sidebar-toggle";
        toggle.textContent = "▶";
        tab.appendChild(toggle);
      }

      // 親リンク
      const linkArea = document.createElement("div");
      linkArea.className = "tab-link";

      if (parent.image && parent.image !== "---") {
        const img = document.createElement("img");
        img.src = BASE_URL + "img/" + parent.image;
        img.onerror = () => img.remove();
        linkArea.appendChild(img);
      }

      const label = document.createElement("span");
      label.textContent = parent.name;
      linkArea.appendChild(label);

      tab.appendChild(linkArea);

      // active
      if (sheetId === currentSheetId) {
        tab.classList.add("active");
      }

      linkArea.onclick = e => {
        e.stopPropagation();
        location.href = `index.html?sheet=${sheetId}`;
      };

      sidebar.appendChild(tab);

      // ======================
      // children
      // ======================
      if (!children.length) return;

      const childrenBox = document.createElement("div");
      childrenBox.className = "sidebar-children";
      childrenBox.style.display = "none";

      children.forEach(childRow => {
        const child = document.createElement("div");
        child.className = "child-item";

        if (childRow.image && childRow.image !== "---") {
          const img = document.createElement("img");
          img.src = BASE_URL + "img/" + childRow.image;
          img.onerror = () => img.remove();
          child.appendChild(img);
        }

        const label = document.createElement("span");
        label.textContent = `${childRow.tier} ${childRow.name}`;
        child.appendChild(label);

        if (childRow.link === currentSheetId) {
          child.classList.add("active");
          childrenBox.style.display = "block";
          toggle.textContent = "▼";
        }

        child.onclick = e => {
          e.stopPropagation();
          location.href = `index.html?sheet=${childRow.link}`;
        };

        childrenBox.appendChild(child);
      });

      sidebar.appendChild(childrenBox);

      // toggle open/close
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
