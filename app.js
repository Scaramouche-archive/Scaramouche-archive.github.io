
const params = new URLSearchParams(window.location.search);
const defaultLang = params.get("lang");

fetch("./wandererDB.json")
.then(response => response.json())
.then(data => {

    const app = document.getElementById("app");
    app.innerHTML = "";

    Object.entries(data.sections).forEach(([sectionKey, section]) => {

        const sectionTitle = document.createElement("h2");
        sectionTitle.className = "section-title";
        sectionTitle.textContent =
            section.name?.[defaultLang] ||
            section.name?.ja ||
            sectionKey;

        app.appendChild(sectionTitle);

        Object.entries(section.items).forEach(([id, item]) => {

            const card = document.createElement("div");
            card.className = "card";

            const tabs = document.createElement("div");
            tabs.className = "tabs";

            const content = document.createElement("div");
            content.className = "content";

            const availableLangs = Object.keys(data.language)
                .filter(lang => item.description && item.description[lang] !== null);

            if (!availableLangs.length) return;

            function render(lang) {

                content.innerHTML = "";

                const title = document.createElement("div");
                title.className = "title";
                title.textContent = item.title?.[lang] ?? item.title?.ja ?? "";
                content.appendChild(title);

                const desc = document.createElement("div");
                desc.innerHTML = item.description?.[lang] ?? "";
                content.appendChild(desc);

                const imageArea = document.createElement("div");
                imageArea.className = "images";

                if (Array.isArray(item.img)) {
                    item.img.forEach(group => {
                        Object.values(group).forEach(imageSet => {
                            const path = imageSet?.[lang];
                            if (!path) return;

                            const img = document.createElement("img");
                            img.src = "img/" + path;
                            img.loading = "lazy";
                            img.onerror = () => img.remove();

                            imageArea.appendChild(img);
                        });
                    });
                }

                content.appendChild(imageArea);

                const links = document.createElement("div");
                links.className = "links";

                if (
                    Array.isArray(item.url) &&
                    item.url[0] &&
                    item.url[0][lang]
                ) {
                    item.url[0][lang].forEach(site => {
                        Object.entries(site).forEach(([name, url]) => {
                            const a = document.createElement("a");
                            a.href = url;
                            a.target = "_blank";
                            a.rel = "noopener noreferrer";
                            a.textContent = name;
                            links.appendChild(a);
                        });
                    });
                }

                content.appendChild(links);

                tabs.querySelectorAll("button")
                    .forEach(btn => btn.classList.remove("active"));

                const activeButton =
                    tabs.querySelector(`#tab-${sectionKey}-${id}-${lang}`);

                if (activeButton) {
                    activeButton.classList.add("active");
                }
            }

            availableLangs.forEach(lang => {
                const button = document.createElement("button");
                button.id = `tab-${sectionKey}-${id}-${lang}`;
                button.textContent = data.language[lang];
                button.addEventListener("click", () => render(lang));
                tabs.appendChild(button);
            });

            card.appendChild(tabs);
            card.appendChild(content);
            app.appendChild(card);

            const initialLang =
                defaultLang && availableLangs.includes(defaultLang)
                    ? defaultLang
                    : availableLangs[0];

            render(initialLang);
        });
    });
})
.catch(error => {
    document.getElementById("app").innerHTML =
        `<div class="error">${error}</div>`;
    console.error(error);
});
