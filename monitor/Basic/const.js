//Constants
const USER_DATA_STORE = "UserData";
const USER_DATA_STORE_RDB = "User_Data";
const USER_DATA_STORE_FDB = "ALLUSERS";
const INTENT_SHARABLE = "SharableDataPoint";
const QuickSet = parse("QuickSet");
const Intent = parse(INTENT_SHARABLE);


const DB_URL_Local = "http://localhost:8000/ServerApplication";
const DB_URL_Live = "https://8z0ymx6opk.execute-api.ap-south-1.amazonaws.com/ServerApplication";

var isLive = true;
DB_URL = DB_URL_Local;

console.log("Server  : " + DB_URL);

function parse(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}
