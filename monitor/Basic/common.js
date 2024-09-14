function log(...log_txt) {
  console.log(...log_txt);
}

function id(val) {
  return document.getElementById(val);
}

function get(id, qry) {
  return document.querySelector("#" + id + ">" + qry);
}

function hs(eid, val) {
  if (val == 0) {
    hide(eid);
  } else {
    show(eid);
  }
}

function hide(eid) {
  style(eid, "display", "none");
}

function show(eid) {
  style(eid, "display", "block");
}

function style(eid, ele, value) {
  id(eid).style[ele] = value;
}

function html(eid, val) {
  id(eid).innerHTML = val;
}

function animateValue(start, end, duration, onUpdate, onComplete) {
  let startTime;

  function update(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = start + (end - start) * progress;

    onUpdate(value);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(update);
}

function Toast(message, timeout) {
  if (timeout == undefined) {
    timeout = 1500;
  }

  // Create a new div element
  var toastDiv = document.createElement("div");
  toastDiv.classList.add("toast");
  toastDiv.textContent = message;

  // Append the div to the body
  document.body.appendChild(toastDiv);

  // Trigger slide-in animation
  toastDiv.classList.add("slide-in");

  // Trigger slide-out animation after 3 seconds
  setTimeout(function () {
    toastDiv.classList.remove("slide-in");
    toastDiv.classList.add("slide-out");

    // Remove the toast from the DOM after the animation completes
    setTimeout(function () {
      toastDiv.remove();
    }, 300);
  }, timeout + 1000);
}

function Dialog(title, description, buttons, onclick) {
  // Create overlay
  var overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.onclick = function () {};
  document.body.appendChild(overlay);

  // Create dialog
  var dialog = document.createElement("div");
  dialog.classList.add("dialog");

  var titleElem = document.createElement("h2");
  titleElem.textContent = title;
  dialog.appendChild(titleElem);

  var descElem = document.createElement("p");
  descElem.textContent = description;
  dialog.appendChild(descElem);

  var buttonContainer = document.createElement("div");
  buttonContainer.classList.add("buttons");
  dialog.appendChild(buttonContainer);

  buttons.forEach(function (button) {
    var buttonElem = document.createElement("button");
    buttonElem.textContent = button;
    buttonElem.addEventListener("click", function () {
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
      if (typeof onclick === "function") onclick(button);
    });
    buttonContainer.appendChild(buttonElem);
  });

  document.body.appendChild(dialog);
  return dialog;
}

function inputDialog(title, inputElements, buttons, onclick) {
  var br = document.createElement("br");

  // Create overlay
  var overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.onclick = function () {};
  document.body.appendChild(overlay);

  // Create dialog
  var dialog = document.createElement("div");
  dialog.classList.add("dialog");

  var titleElem = document.createElement("h2");
  titleElem.textContent = title;
  dialog.appendChild(titleElem);

  var descElem = document.createElement("div");
  dialog.appendChild(descElem);

  inputElements.forEach(function (inputElement) {
    descElem.innerHTML += inputElement;
    descElem.appendChild(br);
  });

  var buttonContainer = document.createElement("div");
  buttonContainer.classList.add("buttons");
  dialog.appendChild(br);
  dialog.appendChild(br);
  dialog.appendChild(buttonContainer);

  buttons.forEach(function (button) {
    var buttonElem = document.createElement("button");
    buttonElem.textContent = button;
    buttonElem.addEventListener("click", function () {
      function closeCallback() {
        document.body.removeChild(dialog);
        document.body.removeChild(overlay);
      }
      if (typeof onclick === "function") onclick(button, closeCallback);
      else closeCallback();
    });
    buttonContainer.appendChild(buttonElem);
  });

  document.body.appendChild(dialog);
}

//input box
function inpBox(Text, ElementID, typ, rows, columns) {
  if (typ == "number") {
    typeOfElement = typ;
  } else {
    typeOfElement = "text";
  }

  var inputElement;
  if (typ == "multiline") {
    inputElement =
      "<textarea id='" +
      ElementID +
      "' rows='" +
      rows +
      "' columns='" +
      columns +
      "' placeholder=''></textarea>";
  } else {
    inputElement =
      "<input type='" +
      typeOfElement +
      "' id='" +
      ElementID +
      "' placeholder=''>";
  }

  var text =
    "<label for='" +
    ElementID +
    "' class='inp'>" +
    inputElement +
    "<span class='label'>" +
    Text +
    "</span><span class='focus-bg'></span></label><br>";

  return text;
}

function customInpBox(Text, ElementID, value, typ) {
  if (typ == "string") {
    return (
      "<label for='np' class='inp'><input class='noSpinners' type='" +
      "text" +
      "' id='" +
      ElementID +
      "' placeholder='&nbsp;' value='" +
      value +
      "'><span class='label'>" +
      Text +
      "</span><span class='focus-bg'></span></label><br>"
    );
  }
  if (typ == "date") {
    return (
      "<label for='np' class='inp'><input class='noSpinners' type='" +
      "date" +
      "' id='" +
      ElementID +
      "' placeholder='&nbsp;' value='" +
      value +
      "'><span class='label'>" +
      Text +
      "</span><span class='focus-bg'></span></label><br>"
    );
  }
  if (typ == "time") {
    return (
      "<label for='np' class='inp'><input class='noSpinners' type='" +
      "time" +
      "' id='" +
      ElementID +
      "' placeholder='&nbsp;' value='" +
      value +
      "'><span class='label'>" +
      Text +
      "</span><span class='focus-bg'></span></label><br>"
    );
  }
  if (typ == "number") {
    return (
      "<label for='np' class='inp'><input class='noSpinners' type='" +
      "number" +
      "' id='" +
      ElementID +
      "' placeholder='&nbsp;' value='" +
      value +
      "'><span class='label'>" +
      Text +
      "</span><span class='focus-bg'></span></label><br>"
    );
  }
  if (typ == "phone") {
    return (
      "<label for='np' class='inp'><input class='noSpinners' type='" +
      "tel" +
      "' maxlength='15' id='" +
      ElementID +
      "' placeholder='&nbsp;' value='" +
      value +
      "'><span class='label'>" +
      Text +
      "</span><span class='focus-bg'></span></label><br>"
    );
  } else {
    typeOfElement = "text";
  }
  var text =
    "<label for='np' class='inp'><input class='noSpinners' type='" +
    typeOfElement +
    "' maxlength='200' id='" +
    ElementID +
    "' placeholder='&nbsp;' value='" +
    value +
    "'><span class='label'>" +
    Text +
    "</span><span class='focus-bg'></span></label><br>";
  return text;
}

function selectBox(Text, ElementID, options) {
  var text =
    "<label for='" +
    ElementID +
    "' class='inp'><select id='" +
    ElementID +
    "'>";

  for (var i = 0; i < options.length; i++) {
    text += "<option value='" + i + "'>" + options[i] + "</option>";
  }

  text +=
    "</select><span class='label'>" +
    Text +
    "</span><span class='focus-bg'></span></label><br>";
  return text;
}

function customSelectBox(Text, ElementID, options) {
  var text =
    "<label for='" +
    ElementID +
    "' class='inp'><select id='" +
    ElementID +
    "'>";

  for (var i = 0; i < options.length; i++) {
    text += "<option value='" + i + "'>" + options[i] + "</option>";
  }

  text +=
    "</select><span class='label'>" +
    Text +
    "</span><span class='focus-bg'></span></label><br>";
  return text;
}

function getLoader(nameLoader, parentContainer) {
  const loader_obj = id(nameLoader);

  if (loader_obj != null) {
    return loader_obj;
  }

  const loaderContainer = document.createElement("div");
  loaderContainer.onclick = function () {};
  loaderContainer.id = nameLoader;
  loaderContainer.classList.add("overlay");
  loaderContainer.classList.add("loaderContainer");
  parentContainer.appendChild(loaderContainer);

  const loader = document.createElement("div");
  loader.classList.add("loader");
  document.body.appendChild(loaderContainer);

  // Create loader elements dynamically
  const innerOne = document.createElement("div");
  innerOne.classList.add("inner", "one");
  loader.appendChild(innerOne);

  const innerTwo = document.createElement("div");
  innerTwo.classList.add("inner", "two");
  loader.appendChild(innerTwo);

  const innerThree = document.createElement("div");
  innerThree.classList.add("inner", "three");
  loader.appendChild(innerThree);

  loaderContainer.appendChild(loader);
  return loaderContainer;
}

function Loading(show_, element) {
  var nameLoader = "";
  var parentContainer = null;
  if (element) {
    nameLoader = element + "Loader";
    parentContainer = id(element);
  } else {
    nameLoader = "body" + "Loader";
    parentContainer = document.body;
  }
  getLoader(nameLoader, parentContainer);

  if (show_ == true) {
    show(nameLoader);
  } else {
    hide(nameLoader);
  }
}

function After(ms, callback) {
  setTimeout(callback, ms);
}

// // Example usage:
// const startValue = 0;
// const endValue = 100;
// const animationDuration = 1000; // in milliseconds

// animateValue(startValue, endValue, animationDuration, function(value) {
//     console.log(value); // Log the current animated value
// }, function() {
//     console.log("Animation complete");
// });

//Shared Data Store
function storeMap(key, map) {
  localStorage.setItem(key, JSON.stringify(map));
}

function getMap(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return {};
  }
}

async function getUserDataByToken(token) {
  return await fetchAWS("py_host/token/get_user_data_for_token_api", {
    TOKEN: token,
  });
}

//Login Preference Data
async function LoginStore(data) {
  if (data === null || data == "null") {
    return null;
  }

  var UserData = {};

  UserData.UID = data.UID;
  UserData.Name = data.Name;
  UserData.ImageUrl = data.ImageUrl;
  UserData.Email = data.Email;
  UserData.OAuth = data.OAuth;
  UserData.isLoggedIn = true;

  // console.log(UserData);

  const timeMs = new Date().getTime();
  UserData.LastLog = {
    TimeMs: timeMs,
    TimeStamp: convertMillisecondsToTimestamp(timeMs),
  };

  storeMap(USER_DATA_STORE, UserData);
  return UserData;
}

function isLogedIn() {
  var UserData = getMap(USER_DATA_STORE);
  if (UserData == null) {
    return false;
  }
  return UserData.isLoggedIn;
}

function getUser() {
  var UserData = getMap(USER_DATA_STORE);
  if (UserData == null) {
    return {};
  }
  return UserData;
}

function Logout() {
  if (isLogedIn()) {
    storeMap(USER_DATA_STORE, null);
    console.log("Logout Success");
  } else {
    // console.log("Not Logged In");
  }
}

//Others
function convertMillisecondsToTimestamp(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getMs(dateobj) {
  return dateobj.getTime();
}

function getDate(datems) {
  return new Date(datems);
}

function tableHeaderView(columns) {
  let Column_Html = "<tr>";
  for (let index = 0; index < columns.length; index++) {
    Column_Html += `<th>${columns[index]}</th>`;
  }
  return Column_Html + "</tr>";
}

function tableBodyView(rows) {
  let Row_Html = "";
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    Row_Html += "<tr>";
    for (let index = 0; index < row.length; index++) {
      const element = row[index];
      Row_Html += `<td>${element}</td>`;
    }
    Row_Html += "</tr>";
  }
  return Row_Html;
}

function tableView(columns, rows) {
  const Column_Html = tableHeaderView(columns);
  const Rows_Html = tableBodyView(rows);

  return `
        <table class="table">
            <thead>
                ${Column_Html}
            </thead>
            <tbody>
                ${Rows_Html}
            </tbody>
        </table>`;
}
