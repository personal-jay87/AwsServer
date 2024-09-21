const fileNameElement = document.getElementById("fileName");
const editorContainer = document.getElementById("editor-container");
const toggleEditorBtn = document.getElementById("toggle-editor-btn");
const tableCardsContainer = document.getElementById("tableCards");
const schemaTable = document.getElementById("schemaTable");
const dataTable = document.getElementById("data-table");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let editorInstance;
let sql_file_path = "";
let currentTableName = "";
let currentPage = 0;
const pageSize = 10;

// Make file name editable
fileNameElement.addEventListener("click", function () {
  if (!this.isContentEditable) {
    this.contentEditable = true;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(this.childNodes[0], this.childNodes[0].length - 3); // Position cursor before ".db"
    range.setEnd(this.childNodes[0], this.childNodes[0].length - 3);
    sel.removeAllRanges();
    sel.addRange(range);
  }
});

fileNameElement.addEventListener("blur", function () {
  this.contentEditable = false;
  if (!this.innerText.endsWith(".db")) {
    this.innerText += ".db";
  }
});

// Toggle editor visibility
toggleEditorBtn.addEventListener("click", function () {
  const isHidden = editorContainer.style.display === "none";
  editorContainer.style.display = isHidden ? "block" : "none";
  toggleEditorBtn.innerText = isHidden ? "Close Editor" : "Open Editor";
});

// Fetch tables and display them in cards
async function loadTables() {
  try {
    const resp = await apiCall("db/sql/get_db_info", { "database": sql_file_path });
    const { tables } = resp;
    console.log(resp);

    tables.forEach(table => {
      const tableCard = document.createElement("div");
      tableCard.classList.add("table-card");
      tableCard.innerText = table.Name;
      tableCard.addEventListener("click", () => displaySchema(table));
      tableCardsContainer.appendChild(tableCard);
    });
  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

// Display schema of the selected table
function displaySchema(table) {
  currentTableName = table.Name;
  schemaTable.style.display = "table";
  dataTable.style.display = "none";
  schemaTable.innerHTML = `
    <tr>
      <th>Column ID</th>
      <th>Name</th>
      <th>Type</th>
      <th>Not Null</th>
      <th>Primary Key</th>
    </tr>
  `;

  table.Columns.forEach(column => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${column.ColumnID}</td>
      <td>${column.Name}</td>
      <td>${column.Type}</td>
      <td>${column.NotNull}</td>
      <td>${column.PrimaryKey}</td>
    `;
    schemaTable.appendChild(row);
  });

  currentPage = 0; // Reset pagination
  loadPagedData(); // Load the first page of data
}

// Load sample data and display it in a table
async function loadPagedData() {
  try {
    const fromIndex = currentPage * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    const sampleDataResp = await apiCall("db/sql/select_view", {
      "database": sql_file_path,
      "table_name": currentTableName,
      "index_from": fromIndex,
      "index_to": toIndex
    });

    const { rows } = sampleDataResp;

    if (rows.length > 0) {
      // Destroy any previous DataTable instance
      if ($.fn.DataTable.isDataTable(dataTable)) {
        $(dataTable).DataTable().clear().destroy();
      }

      // Initialize DataTable
      $(dataTable).DataTable({
        data: rows,
        columns: rows[0].map((_, index) => ({
          title: `Column ${index + 1}`, // Create dynamic column headers
          data: index
        })),
        destroy: true // Ensure any previous instance is destroyed before creating a new one
      });

      dataTable.style.display = "table";
      loadMoreBtn.style.display = rows.length >= pageSize ? "block" : "none";
    } else {
      dataTable.style.display = "none";
      loadMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Handle Load More button click
loadMoreBtn.addEventListener("click", function () {
  currentPage++;
  loadPagedData();
});

// Monaco Editor setup
require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs" } });
require(["vs/editor/editor.main"], function () {
  editorInstance = monaco.editor.create(document.getElementById("editor"), {
    value: "# Write your SQL Query here...",
    language: "sql",
    theme: "vs-dark",
    automaticLayout: true,
  });
  init();
});

function init() {
  const file_data = getTempPageData(PARAMS_PASSED["file_id"]);
  if (file_data) {
    sql_file_path = file_data.filePath;
    fileNameElement.innerHTML = sql_file_path.split("/").pop();
    loadTables(); // Load tables after getting the file path
  }
}
