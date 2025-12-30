// ==============================
// Sidebar (sidebar_data sheet)
// ==============================

console.log("sidebar.js loaded");

const sidebarCsvUrl =
  `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=sidebar_data`;

fetch(sidebarCsvUrl)
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

      let toggle = null;

      if (row.children) {
        toggle = document.createElement("span");
        toggle.className = "sidebar-toggle";
        toggle.textContent = "▶";
        tab.appendChild(toggle);
      }

      const linkArea = document.createElement("div");
      linkArea.className = "tab-link";

      const label = document.createElement("span");
      label.textContent = row.name;

      linkArea.appendChild(label);
      tab.appendChild(linkArea);

      // active
      if (String(row.link) === sheetName) {
        tab.classList.add("active");
      }

      linkArea.onclick = (e) => {
        e.stopPropagation();
        location.href = `index.html?sheet=${row.link}`;
      };

      sidebar.appendChild(tab);

      // ==========================
      // children
      // ==========================
      if (!row.children) return;

      const childrenBox = document.createElement("div");
      childrenBox.className = "sidebar-children";
      childrenBox.style.display = "none";

      const children = row.children
        .split(",")
        .map(c => c.trim())
        .filter(Boolean);

      children.forEach(childStr => {
        // tier:name:image:link
        const [tier, name, image, link] = childStr.split(":");
        if (!tier || !name || !link) return;

        const child = document.createElement("div");
        child.className = "child-item";

        if (image && image !== "---") {
          const img = document.createElement("img");
          img.src = BASE_URL + "img/" + image;
          img.onerror = () => img.remove();
          child.appendChild(img);
        }

        const label = document.createElement("span");
        label.textContent = `${tier} ${name}`;
        child.appendChild(label);

        if (String(link) === sheetName) {
          child.classList.add("active");
          childrenBox.style.display = "block";
          toggle.textContent = "▼";
        }

        child.onclick = (e) => {
          e.stopPropagation();
          location.href = `index.html?sheet=${link}`;
        };

        childrenBox.appendChild(child);
      });

      sidebar.appendChild(childrenBox);

      // ==========================
      // toggle
      // ==========================
      tab.onclick = () => {
        const opened = childrenBox.style.display === "block";
        childrenBox.style.display = opened ? "none" : "block";
        toggle.textContent = opened ? "▶" : "▼";
      };
    });
  })
  .catch(err => console.error("sidebar CSV error:", err));
