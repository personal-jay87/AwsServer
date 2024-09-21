const fileList = document.getElementById('fileList');
const noFilesMessage = document.getElementById('noFilesMessage');

// Function to handle displaying 'no files' message
function checkNoFilesMessage() {
  if (fileList.children.length > 0) {
    noFilesMessage.style.display = 'none';
  } else {
    noFilesMessage.style.display = 'block';
  }
}

// Function to clean up paths (remove duplicate slashes)
function cleanPath(path) {
  try{
    return path.replace(/\/{2,}/g, '/');  // Replace multiple slashes with a single slash
  } catch(e) {
    return "/";
  }
  
}

// Updated file/folder HTML generation function with additional details
function htmlFileFolder(i,name, isFile, path, details = {}) {
  const cleanedPath = cleanPath(path);  // Clean up the path here
  const { size, modified_date, other_info } = details || {};

  return `
    <div id="card_element_${i}" class="tile-item ${isFile ? "file-item":"folder-item"}" data-path="${cleanedPath}" data-is-file="${isFile}">
      <div class="${isFile ? "file-name":"folder-name"}">${name}</div>
      
      <div class="file-actions">
        <div class="file-details" style="margin-top:15px;">
          ${(isFile
              ? `<div>${modified_date} (${size} bytes)</div>`
              : (modified_date==undefined
                  ?``:`<div>${modified_date}</div>`)
              )
            }
        </div>
        ${modified_date==undefined?``:`<button class="file-action-button delete"  onclick="delete_dat('${name}', event, ${i})" >Delete</button>`}
      </div>
    </div>
  `;
}

// Function to fetch files and folders and update the file list
async function get_list_files_folders(root_folder) {
  refreshUiPath(root_folder);
  const list_files_folders = await apiCall("monitor/filemanager/get_dir_list", {
    "directory": root_folder
  });

  if(list_files_folders.status == "failed"){
    if(root_folder != "/"){
      get_list_files_folders("/");
    }
    return;
  }

  let htmlText = "";

  // Add a back option if not in the root folder
  if (root_folder !== "/") {
    const parent_folder = root_folder.substring(0, root_folder.lastIndexOf("/")) || "/";
    htmlText += htmlFileFolder(99,"/...Back", false, parent_folder);
  }

  let i=100;

  // Add folders
  for (const folder of list_files_folders.folders) {
    htmlText += htmlFileFolder(i,folder.folder_name, false, `${root_folder}/${folder.folder_name}`, folder);
    i+=1;
  }

  // Add files
  for (const file of list_files_folders.files) {
    htmlText += htmlFileFolder(i,file.file_name, true, `${root_folder}/${file.file_name}`, file);
    i+=1;
  }

  return htmlText;
}

var root_folder_path = "/";
// Function to refresh the UI path display
function refreshUiPath(root_folder) {
  storeMap("lastPath",{
    "path":root_folder
  });
  root_folder_path = root_folder;
  document.getElementById("pathCur").innerHTML = root_folder;
}

// Initialize file manager
async function init() {
  let root_folder = "/";
  if(getMap("lastPath") != null){
    root_folder = getMap("lastPath")["path"];
  }
  
  fileList.innerHTML = await get_list_files_folders(root_folder);
  checkNoFilesMessage();
  attachClickListeners();
}

id("createFile").onclick = async function createFile() {
  var new_file_path = root_folder_path+"/"+"NoName_"+getRandomDigit()+".txt";

  var resp = await apiCall("monitor/filemanager/create_new_file", {
    "file_path": new_file_path
  });

  if(resp.status == "success"){
    Toast("Success");
    init();
  } else {
    console.log(resp.traceback);
    Toast("Problem While Deletion : "+resp.err,5000);
  }
}

async function delete_dat(name,event,i) {
  event.stopPropagation(); // Prevent the click event from bubbling up
  var delete_file_path = root_folder_path+"/"+name;

  var resp = await apiCall("monitor/filemanager/delete_file", {
    "file_path": delete_file_path
  });

  if(resp.status == "success"){
    Toast("Success");
    id("card_element_"+i).remove();
  } else {
    console.log(resp.traceback);
    Toast("Problem While Deletion : "+resp.err,5000);
  }
}



// Function to attach click listeners to the files and folders
function attachClickListeners() {
  const fileItems = document.querySelectorAll('.tile-item');
  
  fileItems.forEach(item => {
    item.addEventListener('click', async (event) => {
      const isFile = item.getAttribute('data-is-file') === 'true';
      const path = item.getAttribute('data-path');
      
      if (isFile) {
        // If it's a file, open it (custom logic here)
        openFile(path);
      } else {
        // If it's a folder, load its contents
        fileList.innerHTML = await get_list_files_folders(path);
        checkNoFilesMessage();
        attachClickListeners();
      }
    });
  });
}

// Function to open a file (implement your logic here)
function openFile(filePath) {
  console.log(filePath)
  if(filePath.endsWith('.db')){
    Dialog("SQLite Panel","Select panel to view the file",["Open File","Open Db"],function(but){
      if(but == "Open File"){
        let temp_data_id = setTempPageData({
          "filePath": filePath,
        });
      
        console.log(`Opening file: ${filePath}`);
        Navigate("FileEditor", true, {}, {}, "file_id=" + temp_data_id);
      } else {
        let temp_data_id = setTempPageData({
          "filePath": filePath,
        });
      
        console.log(`Opening Sql file: ${filePath}`);
        Navigate("SqlPanel", true, {}, {}, "file_id=" + temp_data_id);
      }
    });
  } else {
    let temp_data_id = setTempPageData({
      "filePath":filePath,
    });
    console.log(`Opening file: ${filePath}`);
    Navigate("FileEditor",true,{},{},"file_id="+temp_data_id);
  }
  
  // Add your file opening logic (e.g., download or display)
}

// Initialize on page load
init();
