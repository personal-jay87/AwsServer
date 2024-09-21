// Make file name editable
const fileNameElement = document.getElementById("fileName");
fileNameElement.addEventListener("click", function () {
  if (!this.isContentEditable) {
    this.contentEditable = true;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(this.childNodes[0], this.childNodes[0].length - 3); // Position cursor before ".py"
    range.setEnd(this.childNodes[0], this.childNodes[0].length - 3);
    sel.removeAllRanges();
    sel.addRange(range);
  }
});

fileNameElement.addEventListener("blur", function () {
  this.contentEditable = false;
  let text = this.innerText;
  renameFile(text);
});

fileNameElement.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === "Escape") {
    e.preventDefault();
    this.blur();
  }
});

var editorInstance;

// Monaco Editor setup
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs",
  },
});

id("closeNow").onclick = async function () {
  Navigate("Close");
}

id("deployNow").onclick = async function () {
  if (editorInstance) {
    var code = editorInstance.getValue();
    
    // Implement your deployment logic here
    console.log("Saving");
    // console.log(code);
    // Toast("Saving...");
    // You can use `code` variable here for further processing
    var resp = await apiCall("monitor/filemanager/write_file", {
      file_path: file_path,
      content: code,
    });

    if (resp.status == "success") {
      Toast("Save Success");
    } else {
      let traceback = "\n\nTraceback : "+resp.traceback;
      Toast("Problem While Saving : "+resp.err,5000);
    }
  } else {
    Toast("Editor not initialized yet.");
  }
};


const file_data = getTempPageData(PARAMS_PASSED["file_id"]);
var file_path = file_data["filePath"];
var file_name = file_path.split('/').pop();
console.log(file_name)
id("fileName").innerHTML = file_name;

async function init(){
  var resp = await apiCall("monitor/filemanager/read_file", {
    file_path: file_path
  });

  const content = resp["content"];
  file_name = resp["file_info"]["file_name"];

  id("fileName").innerHTML = file_name;
  editorInstance.setValue(content);
}

async function renameFile(newFileName) {
  var temp = file_path.split('/');
  temp.pop();
  temp.push(newFileName);
  var new_file_path = temp.join('/');

  var resp = await apiCall("monitor/filemanager/rename", {
    old_file_path: file_path,
    new_file_path: new_file_path,
  });

  file_path = new_file_path;

  setTempPageData({
    "filePath": file_path,
  },PARAMS_PASSED["file_id"]);

  if(resp.status == "success"){
    Toast("Rename Success");
  } else{
    let traceback = "\n\nTraceback : "+resp.traceback;
    Toast("Rename Failed : "+resp.err,5000);
  }
}




require(["vs/editor/editor.main"], function () {
  editorInstance = monaco.editor.create(document.getElementById("editor"), {
    value: "Loading Data...",
    language: "txt",
    theme: "vs-dark",
    automaticLayout: true,
  });
  init();
});