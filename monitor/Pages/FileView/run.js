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



id("deployNow").onclick = async function () {
  if (editorInstance) {
    var code = editorInstance.getValue();
    
    // Implement your deployment logic here
    console.log("Saving");
    // console.log(code);
    Toast("Saving...");
    // You can use `code` variable here for further processing
    var resp = await apiCall("monitor/filemanager/read_file", {
      NAME: fileNameElement.innerText,
      CODE: code,
    });

    if (resp.status == true) {
      Dialog("Save Success","Done!",["Ok"]);
    } else {
      Dialog("Problem While Saving",resp.message,["Ok"]);
    }
  } else {
    Toast("Editor not initialized yet.");
  }
};


const file_data = getTempPageData(PARAMS_PASSED["file_id"]);
const file_path = file_data["filePath"];

async function init(){
  var resp = await apiCall("monitor/filemanager/read_file", {
    file_path: file_path
  });


  const content = resp["content"];
  const fileName = resp["file_info"]["file_name"];

  id("fileName").innerHTML = fileName;
  
  editorInstance.setValue(content);
}





require(["vs/editor/editor.main"], function () {
  editorInstance = monaco.editor.create(document.getElementById("editor"), {
    value: "Loading Data...",
    language: "txt",
    theme: "vs-dark",
    automaticLayout: true,
  });
  setTimeout(function(){
    init();
  },1000);
});