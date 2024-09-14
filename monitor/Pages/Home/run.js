const USER = getUser();

id("google-signout-button").addEventListener("click", function (event) {
  event.preventDefault();
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ action: "Navigate", to: "Login" }, Origin);
  } else {
    Navigate("Dashboard");
  }
});

function convertMillisecondsToTimestamp(milliseconds) {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Determine AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format hours to always be 2 digits
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day} ${month} ${year} ${formattedHours}:${minutes} ${ampm}`;
}

function init() {
  document.getElementById("profileImg").src = USER.ImageUrl;
  document.getElementById("Name").textContent = USER.Name;
  document.getElementById("Email").textContent = USER.Email;
  document.getElementById("LastLogin").textContent =
    convertMillisecondsToTimestamp(USER.LastLog.TimeMs);
}

init();
