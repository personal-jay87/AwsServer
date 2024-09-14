//Constants
const USER_DATA_STORE = "UserData";
const USER_DATA_STORE_RDB = "User_Data";
const USER_DATA_STORE_FDB = "ALLUSERS";
const INTENT_SHARABLE = "SharableDataPoint";
const QuickSet = parse("QuickSet");
const Intent = parse(INTENT_SHARABLE);

const isLive = true;
// const isLive = false;

var DB_PROTOCALL = "";
var DB_DOMAIN = "";

if (isLive) {
  DB_PROTOCALL = "https";
  DB_DOMAIN = "jayservice.fun";
} else {
  DB_PROTOCALL = "http";
  DB_DOMAIN = "localhost";
}

// const DB_PROTOCALL = "http";
// const DB_DOMAIN = "localhost";

// const DB_PROTOCALL = "https";
// const DB_DOMAIN = "jayservice.fun";

// const DB_DOMAIN = "ec2-43-205-140-144.ap-south-1.compute.amazonaws.com";

const DB_PORT = "7777";

const DB_URL = DB_PROTOCALL + "://" + DB_DOMAIN + ":" + DB_PORT;

console.log("Server  : " + DB_URL);

function parse(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}
