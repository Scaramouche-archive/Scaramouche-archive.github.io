const params=new URLSearchParams(window.location.search);
const currentLang=params.get("lang")||"ja";

function getCurrentSection(){
 const path=window.location.pathname.replace(/\/index\.html$/i,"");
 const parts=path.split("/").filter(Boolean);
 if(parts.length===0)return null;
 return parts[parts.length-1];
}

function formatVersion(version){
if (!version) {
    return "";
}

const match =
    /^(\d+)\.(\d+)$/.exec(version);

if (!match) {
    return version;
}

const major =
    Number(match[1]);

const minor =
    Number(match[2]);

if (major !== 6) {
    return version;
}

if (
    currentLang === "chs" ||
    currentLang === "cht"
) {

    const chineseNumbers = {
        0: "一",
        1: "二",
        2: "三",
        3: "四",
        4: "五",
        5: "六",
        6: "七",
        7: "八",
        8: "九",
        9: "十"
    };

    return `月之${chineseNumbers[minor] || minor}（${version}）`;
}

const latin = {
    0: "I",
    1: "II",
    2: "III",
    3: "IV",
    4: "V",
    5: "VI",
    6: "VII",
    7: "VIII",
    8: "IX",
    9: "X"
};

return `Luna ${latin[minor] || minor} (${version})`;
}

function buildLanguageSwitcher(languageMap){
 const c=document.getElementById("langSwitch");
 if(!c)return;
 c.innerHTML="";
 Object.entries(languageMap).forEach(([code,name])=>{
   const q=new URLSearchParams(window.location.search);
   q.set("lang",code);
   const a=document.createElement("a");
   a.href=window.location.pathname+"?"+q.toString();
   a.textContent=name;
   c.appendChild(a);
 });
}

fetch("/wandererDB.json")
.then(r=>r.json())
.then(data=>{
 buildLanguageSwitcher(data.language);
 const app=document.getElementById("app");
 app.innerHTML="";

 const sectionKey=getCurrentSection();

 if(!sectionKey||!data.sections?.[sectionKey]){
   const menu =
    document.createElement("div");

menu.className =
    "section-menu";

Object.entries(data.sections)
.forEach(([key, section]) => {

    const card =
        document.createElement("a");

    card.className =
        "section-link";

    card.href =
        `/${key}/?lang=${currentLang}`;

    card.innerHTML = `
        <div class="section-name">
            ${
                section.name?.[currentLang]
                || section.name?.ja
                || key
            }
        </div>

        <div class="section-desc">
            Open Section
        </div>
    `;

    menu.appendChild(card);
});

app.appendChild(menu);
   return;
 }

 const section=data.sections[sectionKey];
 const title=document.getElementById("pageTitle");
 if(title) title.textContent=section.name?.[currentLang]||section.name?.ja||sectionKey;

 Object.entries(section.items).forEach(([id,item])=>{
   if(item.display===false) return;

   const langs=Object.keys(data.language).filter(l=>item.description&&item.description[l]!=null);
   if(!langs.length) return;

   const card=document.createElement("div");
   card.className="card";

   const tabs=document.createElement("div");
   tabs.className="tabs";

   const content=document.createElement("div");
   content.className="content";

   function render(lang){
      content.innerHTML="";

      tabs.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
      tabs.querySelector(`[data-lang="${lang}"]`)?.classList.add("active");

      const t=document.createElement("div");
      t.className="title";
      t.textContent=item.title?.[lang]||item.title?.ja||"";
      content.appendChild(t);

      const d=document.createElement("div");
      d.innerHTML=item.description?.[lang]||"";
      content.appendChild(d);

      const images=document.createElement("div");
      images.className="images";

      (item.img||[]).forEach(group=>{
        Object.values(group).forEach(set=>{
          const path=set?.[lang];
          if(!path) return;
          const img=document.createElement("img");
          img.src="/img/"+path;
          img.loading="lazy";
          img.onerror=()=>img.remove();
          images.appendChild(img);
        });
      });

      content.appendChild(images);

      const links=document.createElement("div");
      links.className="links";

      if(item.url?.[0]?.[lang]){
        item.url[0][lang].forEach(site=>{
          Object.entries(site).forEach(([name,url])=>{
            const a=document.createElement("a");
            a.href=url;
            a.target="_blank";
            a.rel="noopener noreferrer";
            a.textContent=name;
            links.appendChild(a);
          });
        });
      }

      content.appendChild(links);

      if(item.version){
        const labels = {
    ja: "バージョン：",
    en: "Version: ",
    chs: "版本：",
    cht: "版本：",
    kr: "버전: "
};

const version =
    document.createElement(
        "div"
    );

version.className =
    "version";

version.textContent =
    (labels[currentLang]
    || "Version: ")
    +
    formatVersion(
        item.version
    );

content.appendChild(
    version
);
      }
   }

   langs.forEach(lang=>{
      const b=document.createElement("button");
      b.dataset.lang=lang;
      b.textContent=data.language[lang];
      b.onclick=()=>render(lang);
      tabs.appendChild(b);
   });

   card.appendChild(tabs);
   card.appendChild(content);
   app.appendChild(card);

   render(langs.includes(currentLang)?currentLang:langs[0]);
 });
})
.catch(e=>{
 document.getElementById("app").innerHTML=`<div class="error">${e}</div>`;
});
