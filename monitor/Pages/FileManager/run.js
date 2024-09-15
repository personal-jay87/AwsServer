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
  return path.replace(/\/{2,}/g, '/');  // Replace multiple slashes with a single slash
}

// Updated file/folder HTML generation function
function htmlFileFolder(name, isFile, path) {
  const cleanedPath = cleanPath(path);  // Clean up the path here
  return `
    <div class="file-item" data-path="${cleanedPath}" data-is-file="${isFile}">
      <div class="file-name">${name}</div>
      <div class="file-actions">
        ${isFile ? '<button class="file-action-button open">Open</button>' : ''}
        <button class="file-action-button delete">Delete</button>
      </div>
    </div>
  `;
}

// Function to fetch files and folders, and update the file list
async function get_list_files_folders(root_folder) {
  const list_files_folders = await apiCall("monitor/filemanager/get_dir_list", {
    "directory": root_folder
  });

  let htmlText = "";

  // Add a back option if not in the root folder
  if (root_folder !== "/") {
    const parent_folder = root_folder.substring(0, root_folder.lastIndexOf("/")) || "/";
    htmlText += htmlFileFolder("/...Back", false, parent_folder);
  }

  // Add files
  for (const file of list_files_folders.files) {
    htmlText += htmlFileFolder(file.file_name, true, `${root_folder}/${file.file_name}`);
  }

  // Add folders
  for (const folder of list_files_folders.folders) {
    htmlText += htmlFileFolder(folder.folder_name, false, `${root_folder}/${folder.folder_name}`);
  }

  return htmlText;
}

// Initialize file manager
async function init() {
  const root_folder = "/";
  fileList.innerHTML = await get_list_files_folders(root_folder);
  checkNoFilesMessage();
  attachClickListeners();
}

// Function to attach click listeners to the files and folders
function attachClickListeners() {
  const fileItems = document.querySelectorAll('.file-item');
  
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
  let temp_data_id = setTempPageData({
    "filePath":filePath,
  });

  console.log(`Opening file: ${filePath}`);


  Navigate("FileView",true,{},{},"file_id="+temp_data_id);
  // Add your file opening logic (e.g., download or display)
}

// Initialize on page load
init();
