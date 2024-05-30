let snackbarTimeout;
let historyData = [];

async function addToHistory(oper, bID) {
  const historyItem = {
    operation: oper,
    time: new Date().toLocaleString("en-US"),
    bookId: bID,
  };
  try {
    await saveToHistory(historyItem);
    fetchData();
  } catch (error) {
    showSnackbar("Error adding history item");
  }
}

async function saveToHistory(historyItem) {
  try {
    await axios.post("http://localhost:8001/history", historyItem);
  } catch (error) {
    showSnackbar("Error saving history item:");
  }
}

async function fetchData() {
  try {
    const response = await axios.get("http://localhost:8001/history");
    historyData = response.data;
    displayTable(historyData);
  } catch (error) {
    showSnackbar("Error fetching history items");
  }
}

function displayTable(data) {
  const tBody = document.getElementById("tbody");
  tBody.innerHTML = "";
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.operation}</td>
      <td>${new Date(item.time).toLocaleString()}</td>
      <td>${item.bookId}</td>
    `;
    tBody.appendChild(row);
  });
}

function showSnackbar(message) {
  const snackbarMessage = document.getElementById("snackbar");
  snackbarMessage.innerText = message;
  snackbarMessage.classList.remove("show");
  void snackbarMessage.offsetWidth;
  snackbarMessage.classList.add("show");
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
  }
  snackbarTimeout = setTimeout(() => {
    snackbarMessage.classList.remove("show");
  }, 2400);
}

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("operations");
  const sortDirections = {
    id: true,
    operation: true,
    time: true,
    bookId: true,
  };

  table.querySelectorAll("th").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.id.replace("-header", "");
      sortTable(column, sortDirections[column]);
      sortDirections[column] = !sortDirections[column];
    });
  });

  document.querySelectorAll("input[type='text']").forEach((input) => {
    input.addEventListener("input", filterTable);
  });

  fetchData();
});

function sortTable(column, ascending) {
  historyData.sort((a, b) => {
    if (a[column] < b[column]) return ascending ? -1 : 1;
    if (a[column] > b[column]) return ascending ? 1 : -1;
    return 0;
  });
  displayTable(historyData);
}

function filterTable() {
  const idFilter = document.getElementById("id-filter").value.toLowerCase();
  const operationFilter = document
    .getElementById("operation-filter")
    .value.toLowerCase();
  const timeFilter = document.getElementById("time-filter").value.toLowerCase();
  const bookIdFilter = document
    .getElementById("bookId-filter")
    .value.toLowerCase();

  const filteredData = historyData.filter((item) => {
    return (
      item.id.toLowerCase().includes(idFilter) &&
      item.operation.toLowerCase().includes(operationFilter) &&
      new Date(item.time).toLocaleString().toLowerCase().includes(timeFilter) &&
      item.bookId.toLowerCase().includes(bookIdFilter)
    );
  });
  displayTable(filteredData);
}
