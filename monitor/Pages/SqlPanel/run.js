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
  if (!this.innerText.endsWith(".py")) {
    this.innerText += ".py";
  }
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
require(["vs/editor/editor.main"], function () {
  editorInstance = monaco.editor.create(document.getElementById("editor"), {
    value: "# Write your Python code here...",
    language: "sql",
    theme: "vs-dark",
    automaticLayout: true,
  });
});

id("deployNow").onclick = async function () {
  if (editorInstance) {
    var code = editorInstance.getValue();
    // Implement your deployment logic here
    console.log("Deploying the following code:");
    console.log(code);
    Toast("Deploying your code...");
    // You can use `code` variable here for further processing
    var resp = await fetchAWS("py_host/files/host_file_api", {
      TOKEN: localStorage.session_token,
      NAME: fileNameElement.innerText,
      CODE: code,
    });

    if (resp.status == true) {
      Dialog("Deployment Success","All the apis in the file is hosted successfully",["Ok"]);
    } else {
      Dialog("Problem While Deploying",resp.message,["Ok"]);
    }
  } else {
    Toast("Editor not initialized yet.");
  }
};
