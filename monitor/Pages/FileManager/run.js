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
  try {
    return path.replace(/\/{2,}/g, '/');  // Replace multiple slashes with a single slash
  } catch (e) {
    return "/";
  }
}

// Updated file/folder HTML generation function with rename functionality
// Updated Rename button in htmlFileFolder() to pass event
function htmlFileFolder(i, name, isFile, path, details = {}) {
  const cleanedPath = cleanPath(path);  // Clean up the path here
  const { size, modified_date } = details || {};

  // Check if the name is the special "...Back" tile and skip adding the Rename button
  const isBackTile = name === "/...Back";

  return `
    <div id="card_element_${i}" class="tile-item ${isFile ? "file-item":"folder-item"}" data-path="${cleanedPath}" data-is-file="${isFile}">
      <div class="${isFile ? "file-name":"folder-name"}" id="name_text_${i}">${name}</div>
      <input type="text" id="rename_input_${i}" class="rename-input" style="display:none;" value="${name}" onblur="finishRename(${i}, '${cleanedPath}')" onkeydown="checkRenameKey(event, ${i}, '${cleanedPath}')" />
      
      <div class="file-actions">
        <div class="file-details" style="margin-top:15px;">
          ${(isFile
              ? `<div>${modified_date} (${size} bytes)</div>`
              : (modified_date==undefined ? `` : `<div>${modified_date}</div>`)
          )}
        </div>
        ${!isBackTile ? `<button class="file-action-button" onclick="startRename(${i}, event)">Rename</button>` : ''} <!-- Conditional Rename button -->
        ${modified_date == undefined ? `` : `<button class="file-action-button delete" onclick="delete_dat('${name}', event, ${i})">Delete</button>`}
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

  if (list_files_folders.status == "failed") {
    if (root_folder != "/") {
      get_list_files_folders("/");
    }
    return;
  }

  let htmlText = "";

  // Add a back option if not in the root folder
  if (root_folder !== "/") {
    const parent_folder = root_folder.substring(0, root_folder.lastIndexOf("/")) || "/";
    htmlText += htmlFileFolder(99, "/...Back", false, parent_folder);
  }

  let i = 100;

  // Add folders
  for (const folder of list_files_folders.folders) {
    htmlText += htmlFileFolder(i, folder.folder_name, false, `${root_folder}/${folder.folder_name}`, folder);
    i += 1;
  }

  // Add files
  for (const file of list_files_folders.files) {
    htmlText += htmlFileFolder(i, file.file_name, true, `${root_folder}/${file.file_name}`, file);
    i += 1;
  }

  return htmlText;
}

var root_folder_path = "/";
// Function to refresh the UI path display
function refreshUiPath(root_folder) {
  storeMap("lastPath", {
    "path": root_folder
  });
  root_folder_path = root_folder;
  document.getElementById("pathCur").innerHTML = root_folder;
}

// Initialize file manager
async function init() {
  let root_folder = "/";
  if (getMap("lastPath") != null) {
    root_folder = getMap("lastPath")["path"];
  }

  fileList.innerHTML = await get_list_files_folders(root_folder);
  checkNoFilesMessage();
  attachClickListeners();
}

// Start rename process: show the input field
function startRename(i, event) {
  event.stopPropagation();  // Prevent the click event from bubbling up to parent elements
  document.getElementById(`name_text_${i}`).style.display = "none";  // Hide text
  document.getElementById(`rename_input_${i}`).style.display = "block";  // Show input field
  document.getElementById(`rename_input_${i}`).focus();  // Focus input field
}


// Finish rename when the user clicks away or presses Enter
function finishRename(i, oldPath) {
  const input = document.getElementById(`rename_input_${i}`);
  const newName = input.value.trim();

  if (newName && input.style.display != "none") {
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/"));
    const newPath = parentPath + "/" + newName;
    rename(oldPath, newPath);  // Call the rename function (handled by the backend)

    // Update the displayed name and data-path attribute
    const cardElement = document.getElementById(`card_element_${i}`);
    document.getElementById(`name_text_${i}`).innerText = newName;
    cardElement.setAttribute('data-path', newPath);  // Update data-path with the new path
  }

  input.style.display = "none";  // Hide input field
  document.getElementById(`name_text_${i}`).style.display = "block";  // Show text again
}


// Handle the Enter key for renaming
function checkRenameKey(event, i, oldPath) {
  if (event.key === 'Enter') {
    finishRename(i, oldPath);
  }
}


//rename file folder
async function rename(oldPathFileName,newFileName) {
  var resp = await apiCall("monitor/filemanager/rename", {
    old_file_path: oldPathFileName,
    new_file_path: newFileName,
  });

  file_path = newFileName;

  if(resp.status == "success"){
    Toast("Rename Success");
  } else{
    let traceback = "\n\nTraceback : "+resp.traceback;
    Toast("Rename Failed : "+resp.err,5000);
  }
}

// Create new file
id("createFile").onclick = async function () {
  var new_file_path = root_folder_path + "/" + "NoName_" + getRandomDigit() + "_NewFile.txt";

  var resp = await apiCall("monitor/filemanager/create_new_file", {
    "file_path": new_file_path
  });

  if (resp.status == "success") {
    Toast("Success");
    init();
  } else {
    console.log(resp.traceback);
    Toast("Problem While Creation : " + resp.err, 5000);
  }
}

// Create new folder
id("createFolder").onclick = async function () {
  var new_file_path = root_folder_path + "/" + "NoName_" + getRandomDigit() + "_NewFolder";

  var resp = await apiCall("monitor/filemanager/create_new_folder", {
    "file_path": new_file_path
  });

  if (resp.status == "success") {
    Toast("Success");
    init();
  } else {
    console.log(resp.traceback);
    Toast("Problem While Creation : " + resp.err, 5000);
  }
}

// Delete file or folder
async function delete_dat(name, event, i) {
  event.stopPropagation(); // Prevent the click event from bubbling up
  var delete_file_path = root_folder_path + "/" + name;

  var resp = await apiCall("monitor/filemanager/delete_file", {
    "file_path": delete_file_path
  });

  if (resp.status == "success") {
    Toast("Success");
    id("card_element_" + i).remove();
  } else {
    console.log(resp.traceback);
    Toast("Problem While Deletion : " + resp.err, 5000);
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
        openFile(path);  // If it's a file, open it
      } else {
        fileList.innerHTML = await get_list_files_folders(path);  // If it's a folder, load its contents
        checkNoFilesMessage();
        attachClickListeners();
      }
    });
  });
}

// Function to open a file (implement your logic here)
function openFile(filePath) {
  console.log(filePath);
  if (filePath.endsWith('.db')) {
    Dialog("SQLite Panel", "Select panel to view the file", ["Open File", "Open Db"], function (but) {
      if (but == "Open File") {
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
      "filePath": filePath,
    });
    console.log(`Opening file: ${filePath}`);
    Navigate("FileEditor", true, {}, {}, "file_id=" + temp_data_id);
  }
}

// Initialize on page load
init();
