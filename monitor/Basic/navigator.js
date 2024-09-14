function checkLogin() {
  if (getCurrentPage() != "Login" && getCurrentPage() != "Dashboard") {
    if (isLogedIn() == false) {
      Navigate("Dashboard");
    }
  }
}

function setCurrentPage(PageName) {
  if (PageName == "") {
    localStorage.CurrentlyAtPage = "Index";
  } else {
    localStorage.CurrentlyAtPage = PageName;
  }
}

function getCurrentPage() {
  return localStorage.CurrentlyAtPage;
}

function Navigate(
  PageName,
  OpenInNewWindow,
  IntContent,
  QuickSetContent,
  UrlParameter
) {
  QuickSetContent = QuickSetContent ?? {};
  IntContent = IntContent ?? {};
  UrlParameter = UrlParameter ?? "";

  if (UrlParameter != "") {
    UrlParameter = "?" + UrlParameter;
  }

  localStorage.setItem("QuickSet", JSON.stringify(QuickSetContent));
  localStorage.setItem(INTENT_SHARABLE, JSON.stringify(IntContent));

  // console.log(QuickSetContent);
  // console.log(IntContent);
  // return 0;

  const URL_DOM = new URL(window.location.href).origin + "/"; //dynamic

  if (PageName == "Back") {
    window.history.back();
    return;
  }

  var page_url = "";

  if (PageName == "Close") {
    window.close();
  } else {
    page_url = URL_DOM + "Pages/" + PageName + "/index.html" + UrlParameter;
  }

  if (OpenInNewWindow == true) {
    window.open(page_url, "_blank");
  } else {
    window.location.href = page_url;
  }
}
