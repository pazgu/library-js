let snackbarTimeout;
const GoogleURL = "https://www.googleapis.com/books/v1/volumes?";
const apiKey = "AIzaSyBzQ62BPJBOIsbVenJzMhUQQ2fIC8IZADs";
const black = document.querySelector(".black");
const blacktwo = document.querySelector(".blacktwo");

document
  .getElementById("createBookForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const title = document.getElementById("createBookTitle").value;
    const author = document.getElementById("createBookAuthor").value;
    const pageCount = parseInt(
      document.getElementById("createBookNumPages").value
    );
    const description = document.getElementById("createBookDescription").value;
    const img = document.getElementById("createBookImage").value;
    const categories = document.getElementById("createBookCategories").value;
    const ISBN = document.getElementById("createBookISBN").value;
    const copies = parseInt(
      document.getElementById("createBookNumCopies").value
    );
    if (pageCount < 1) {
      showSnackbar("Page count must be greater than zero");
      return;
    }
    if (copies < 0) {
      showSnackbar("Number of copies must be positive");
      return;
    }
    try {
      if (await getAllBooksISBN(ISBN)) {
        showSnackbar(`Book ${title} Already Exists, Please Try Again!`);
        return;
      }
      await axios.post("http://localhost:8001/books", {
        title,
        author: author.split(", "),
        pageCount,
        description,
        img,
        categories: categories.split(", "),
        ISBN,
        copies,
      });
      addToHistory("create", ISBN);
      showSnackbar(`Book ${title} Added and 
            History Updated Successfully`);
      resetInputs();
    } catch (error) {
      showSnackbar(`Error Adding New Book ${title}`);
    }
  });

async function getAllBooksISBN(isbn) {
  try {
    const response = await axios.get("http://localhost:8001/books");
    const books = response.data;

    const exists = books.some((book) => book.ISBN === isbn);
    return exists;
  } catch (error) {
    console.error("Error fetching books:", error);
    return false;
  }
}

function showSnackbar(message) {
  let snackbarMessage = document.getElementById("snackbar");
  snackbarMessage.innerText = message;
  snackbarMessage.classList.remove("show");
  void snackbarMessage.offsetWidth;
  snackbarMessage.classList.add("show");
  if (snackbarTimeout) {
    clearTimeout(snackbarTimeout);
  }
  snackbarTimeout = setTimeout(function () {
    snackbarMessage.classList.remove("show");
  }, 2400);
}

function resetInputs() {
  document.getElementById("createBookTitle").value = "";
  document.getElementById("createBookAuthor").value = "";
  document.getElementById("createBookNumPages").value = "";
  document.getElementById("createBookDescription").value = "";
  document.getElementById("createBookImage").value = "";
  document.getElementById("createBookCategories").value = "";
  document.getElementById("createBookISBN").value = "";
  document.getElementById("createBookNumCopies").value = "";
}

async function addToHistory(oper, bID) {
  const historyItem = {
    operation: oper,
    time: new Date().toISOString(),
    bookId: bID,
  };
  try {
    await saveToHistory(historyItem);
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

document.getElementById('searchBook').addEventListener('submit', 
async function mainSearch(e) {
    e.preventDefault();
    const resultContainer = document.getElementById('searchbyisbn')
    resultContainer.innerHTML = ''
    const bookName = document.getElementById('createBookName').value;
    const url = `${GoogleURL}q=${bookName}&key=${apiKey}&maxResults=10&startIndex=0&langRestrict=en`
    try {
      const response = await axios.get(url);
      const result = response.data.items;
      for (let book of result) {
        resultContainer.innerHTML += `
        <div class="bookCard" onclick="openBookProperties(this)">
              <span class="hidden" id="bookId">${book.id}</span>
                <img src="${book.volumeInfo.imageLinks.thumbnail}" alt="${book.volumeInfo.title}">
            <div class="bookProperties">
                <h2>${(book.volumeInfo.title).slice(0, 40) + (book.volumeInfo.title.length > 40 ? "..." : "")}</h2>
                <p>Author: ${(book.volumeInfo.authors)}</p>
                <p>Description: ${(book.volumeInfo.description)}</p>
            </div>
        </div>
      `;
      }
      black.classList.remove("hidden");
      resultContainer.classList.remove("hidden");
    } catch (e) {
      console.log(e);
      showSnackbar("Error fetching books");
    }
  });

function closeBook() {
  const black = document.querySelector(".black");
  const showBook = document.querySelector(".searchbyisbn");
  black.classList.add("hidden");
  showBook.classList.add("hidden");
}

async function openBookProperties(svgElement) {
  const black2 = document.querySelector(".blacktwo");
  const showBook = document.querySelector("#showBookPropertiesTwo");
  black2.classList.remove("hidden");
  const bookId = svgElement.querySelector("#bookId").outerText;
  const url = `${GoogleURL}q=${bookId}&key=${apiKey}`;
  const response = await axios.get(url);
  const result = response.data.items[0];
  showBook.innerHTML = `
    <div class="topCard">

      <img id="image" src="${result.volumeInfo.imageLinks.thumbnail}" alt="${result.volumeInfo.title}">
      <button class="close" onClick="closeBookTwo()"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
    </svg></button>

    </div>
    <label>Title: </label>
    <p id="updateBookTitle" class="updateBookTitle">${result.volumeInfo.title}</p>
    <label>Author: </label>
    <p id="updateBookAuthor">${result.volumeInfo.authors}</p>
    <label>Description: </label>
    <p id="updateBookDescription">${result.volumeInfo.description}</p>
    <label>Categories: </label>
    <p id="updateBookCategories">${result.volumeInfo.categories}</p>
    <label>Page Count: </label>
    <p id="updateBookNumPages">${result.volumeInfo.pageCount}</p>
    <label>ID: </label>
    <p id="updateBookId">${result.id}</p>
    <label>ISBN: </label>
    <p id="updateBookISBN">${result.volumeInfo.industryIdentifiers[0].identifier}</p>
    <button type="addToData" onClick="addToData(this)" class="addToData" id="addToData">Add To Data</button>
    `;
  showBook.classList.remove("hidden");
  document.documentElement.scrollTop = 0;
}

function closeBookTwo() {
  const black2 = document.querySelector(".blacktwo");
  const showBook = document.querySelector("#showBookPropertiesTwo");
  black2.classList.add("hidden");
  showBook.classList.add("hidden");
}

async function addToData(svgElement) {
  const card = svgElement.parentNode;
  const id = card.querySelector("#updateBookId").innerText;
  const img = card.querySelector("#image").src;
  const title = card.querySelector("#updateBookTitle").innerText;
  const author = card.querySelector("#updateBookAuthor").innerText;
  const category = card.querySelector("#updateBookCategories").innerText;
  const description = card.querySelector("#updateBookDescription").innerText;
  const pageCount = card.querySelector("#updateBookNumPages").innerText;
  const ISBN = card.querySelector("#updateBookISBN").innerText;
  const itemToAdd = {
    id,
    title,
    author: author.split(", "),
    pageCount,
    description,
    img,
    categories: category.split(", "),
    ISBN,
    copies: 1,
  };
  try {
    if (await getAllBooksISBN(ISBN)) {
      showSnackbar(`Book ${title} Already Exists, Please Try Again!`);
      return;
    }
    await axios.post("http://localhost:8001/books", itemToAdd);
    document.documentElement.scrollTop = 0;
    addToHistory("Add From Google API", ISBN);
    showSnackbar(`The book ${title} has been added to data
    History Updated Successfully`);
  } catch (error) {
    showSnackbar("Error adding book to data");
  }
  card.classList.add("hidden");
  blacktwo.classList.add("hidden");
}
