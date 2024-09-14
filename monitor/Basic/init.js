var path = window.location.pathname.trim().split("/");
const CURRENT_PAGE = path[path.length - 2];

const searchParams = new URLSearchParams(window.location.search);

const PARAMS_PASSED = {};
for (const [key, value] of searchParams) {
  PARAMS_PASSED[key] = value;
}

const isIndexPage = CURRENT_PAGE == "";
console.log((isIndexPage ? "Index" : CURRENT_PAGE) + " Page");

const Origin = new URL(window.location.href).origin;

const URL_DOM = Origin + "/"; // dynamic
console.log("Running : " + URL_DOM);

// const URL_DOM = new URL(window.location.href).origin + '/';//dynamic
// const URL_DOM = "http://127.0.0.1:5500/";//local
// const URL_DOM = "https://talentov-jay.web.app/";//live firebase
// const URL_DOM = "https://test-serverv12.talentovjay.repl.co/" //test replit

async function load(module) {
  if (!module.includes(".js")) {
    module = module + ".js";
  }
  console.log("Loading : " + module);
  await loadScript(module);
}

function loadScript(scriptUrl) {
  return new Promise((resolve, reject) => {
    var script = document.createElement("script");
    script.src = scriptUrl;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// List of script URLs

var scriptUrls = [
  URL_DOM + "Basic/const.js",
  // "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js",
  // "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js",
  // "https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js",
  // "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js",
  // "https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js",
  URL_DOM + "Basic/navigator.js",
  URL_DOM + "Basic/common.js",
  URL_DOM + "Basic/firebase.js",
  "run.js",
];

function getPath(page_name) {
  return URL_DOM + "Pages/" + page_name + "/index.html";
}

//Before Running Main Code run.js
function run() {
  setCurrentPage(CURRENT_PAGE);
  // checkLogin();
  if (getUser().Email) {
    console.log("Mail : " + getUser().Email);
  }
  console.log("Running Main Code");

  if (isIndexPage) {
    Navigate("Dashboard");
  }
}

// Load scripts sequentially using async/await
async function loadAllScripts() {
  for (const scriptUrl of scriptUrls) {
    if (scriptUrl == "run.js") {
      run();
    } else if (scriptUrl == "pre.js") {
      console.log("Loading : " + "qucik-action-script.js");
    } else {
      console.log(
        "Loading : " + scriptUrl.substring(scriptUrl.lastIndexOf("/") + 1)
      );
    }
    if (!(isIndexPage && scriptUrl == "run.js")) {
      await loadScript(scriptUrl);
    }
  }
}

// Call the function to load scripts sequentially
loadAllScripts();
