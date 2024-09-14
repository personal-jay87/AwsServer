id("sidebar").style.left = "-200px";
function showSideBar() {
  animateValue(
    parseFloat(id("sidebar").style.left),
    0,
    300,
    function (value) {
      id("sidebar").style.left = value + "px";
    },
    function () {}
  );
}

function hideSideBar() {
  animateValue(
    parseFloat(id("sidebar").style.left),
    -200,
    500,
    function (value) {
      id("sidebar").style.left = value + "px";
    },
    function () {}
  );
}

var enableSidebar = false;
id("sidebarImg").addEventListener("mouseover", function () {
  if (enableSidebar) showSideBar();
});

id("sidebar").addEventListener("mouseleave", function () {
  if (enableSidebar) hideSideBar();
});

PageNames = {
  Home: "",
  ApiPanel: "Api Control Panel",
  SqlPanel: "Sql DB Management"
};

function Navigate(page, name) {
  // if (page == "Profile") {
  //   enableSidebar = false;
  //   showSideBar();
  // } else
  if (page == "Login") {
    enableSidebar = false;
    hideSideBar();
  } else {
    enableSidebar = true;
  }
  if (name) {
    id("headTitle").innerHTML = name;
  } else {
    id("headTitle").innerHTML = PageNames[page];
  }
  // console.log(d)
  Loading(true);
  // Create a new iframe element
  var iframe = id("iframe");
  // Set attributes for the iframe
  iframe.src = getPath(page);
  iframe.frameborder = "0";

  iframe.onload = function () {
    After(500, function () {
      Loading(false);
    });
  };
}

async function init() {
  Navigate("Home");
}

init();

// Listen for messages
window.addEventListener("message", (event) => {
  console.log("Trigger : " + event.data);
  if (event.origin == Origin) {
    const dat = event.data;
    if (dat.action == "Navigate") {
      if (isLogedIn()) {
        Navigate(dat.to);
      } else {
        Navigate("Login");
      }
    }
  }
});
