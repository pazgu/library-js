const url = "http://localhost:8001/favorites";
const bookProperties = document.getElementById("popupBook");
const displayBooks = document.getElementById("displayBooks");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageNumberElement = document.getElementById("pageNumber");
const black = document.querySelector(".black");
const booksPerPage = 9;
let currentPage = 1;
let totalBooks = 0;
let snackbarTimeout;
const spinner = document.getElementById("spinner");

prevPageButton.addEventListener("click", () => changePage(-1));
nextPageButton.addEventListener("click", () => changePage(1));

async function getFavData() {
  spinner.classList.remove("hidden");
  displayBooks.innerHTML = "";
  displayBooks.classList.add("hidden");

  try {
    const response = await axios.get(url);
    totalBooks = response.data.length;

    if (totalBooks === 0) {
      showSnackbar("No books found");
      spinner.classList.add("hidden");
    } else {
      displayPage(response.data);
    }
  } catch (error) {
    showSnackbar("Error fetching books");
    spinner.classList.add("hidden");
  } finally {
    displayBooks.classList.remove("hidden");
  }
}

function displayPage(books) {
  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const paginatedBooks = books.slice(start, end);

  displayBooks.innerHTML = paginatedBooks
    .map(
      (book) => `
        <div class="bookCard" onclick="openBookProperties(this)">
              <span class="hidden" id="bookId">${book.id}</span>
            <img src="${book.img}" alt="${book.title}">
            <div class="bookProperties">
                <h2>${
                  book.title.slice(0, 40) +
                  (book.title.length > 40 ? "..." : "")
                }</h2>
                <p>Author: ${
                  book.author.slice(0, 10) +
                  (book.author.length > 10 ? "..." : "")
                }</p>
                <p>Description: ${
                  book.description.slice(0, 250) +
                  (book.description.length > 250 ? "..." : "")
                }</p>
            </div>
        </div>
      `
    )
    .join("");

  prevPageButton.classList.toggle("hidden", currentPage === 1);
  nextPageButton.classList.toggle("hidden", end >= totalBooks);
  pageNumberElement.innerText = currentPage;
  spinner.classList.add("hidden");
}

function changePage(direction) {
  currentPage += direction;
  getFavData();
}

async function openBookProperties(svgElement) {
  const black = document.querySelector(".black");
  const showBook = document.querySelector("#showBookProperties");
  black.classList.remove("hidden");
  const bookId = svgElement.querySelector("#bookId").outerText;
  const response = await axios.get(`${url}/${bookId}`);
  showBook.innerHTML = `
      <div class="topCard">
  
        <img id="image" src="${response.data.img}" alt="${response.data.title}">
      <button onclick="removeFromFavorites(this)" class="favorites fav" id="favoritesButton"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
    </svg></button>
        <button class="close" onClick="closeBook()"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
      </svg></button>
  
      </div>
      <form id="updateBookForm">
      <label>Title: </label>
      <p id="updateBookTitle" class="updateBookTitle">${response.data.title}</p>
      <label>Author: </label>
      <p id="updateBookAuthor">${response.data.author}</p>
      <label>Description: </label>
      <p id="updateBookDescription">${response.data.description}</p>
      <label>Categories: </label>
      <p id="updateBookCategories">${response.data.categories}</p>
      <label>Page Count: </label>
      <p id="updateBookNumPages">${response.data.pageCount}</p>
      <label>ID: </label>
      <p id="updateBookId">${response.data.id}</p>
      <label>ISBN: </label>
      <p id="updateBookISBN">${response.data.ISBN}</p>
      <label>Copies: </label>
      <p id="updateBookNumCopies">${response.data.copies}</p>
      
      </form>
      `;
  showBook.classList.remove("hidden");
}

function closeBook() {
  const black = document.querySelector(".black");
  const showBook = document.querySelector("#showBookProperties");
  black.classList.add("hidden");
  showBook.classList.add("hidden");
}

function editBook(svgElement) {
  const paragraphs = svgElement.parentNode.parentNode.querySelectorAll("p");
  const saveDeleteButtons = document.getElementById("button-group");

  paragraphs.forEach((paragraph) => {
    if (paragraph.id === "updateBookId") {
      const p = document.createElement("p");
      p.textContent = paragraph.textContent;
      p.id = paragraph.id;
      p.setAttribute("required", "");
      paragraph.parentNode.replaceChild(p, paragraph);
    } else {
      const input = document.createElement("input");
      input.setAttribute("required", "");
      input.type = "text";
      input.value = paragraph.textContent;
      input.id = paragraph.id;
      paragraph.parentNode.replaceChild(input, paragraph);
    }
  });

  const editButton = document.querySelector("#editButton");
  if (editButton) {
    editButton.classList.add("hidden");
    saveDeleteButtons.classList.remove("hidden");
  }
}

function updateBook(svgElement) {
  document
    .getElementById("updateBookForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const bookId = document.getElementById("updateBookId").innerText;
      const img = document.getElementById("image").src;
      const title = document.getElementById("updateBookTitle").value;
      const author = document.getElementById("updateBookAuthor").value;
      const pageCount = parseInt(
        document.getElementById("updateBookNumPages").value
      );
      const description = document.getElementById(
        "updateBookDescription"
      ).value;
      const categories = document.getElementById("updateBookCategories").value;
      const ISBN = document.getElementById("updateBookISBN").value;
      const copies = parseInt(
        document.getElementById("updateBookNumCopies").value
      );
      const inputs = svgElement.parentNode.parentNode.querySelectorAll("input");
      const editButton = document.querySelector("#editButton");
      const saveDeleteButtons = document.getElementById("button-group");
      if (pageCount < 1) {
        showSnackbar("Page count must be greater than zero");
        return;
      }
      if (copies < 0) {
        showSnackbar("Number of copies must be positive");
        return;
      }
      try {
        await axios.put(`http://localhost:8001/books/${bookId}`, {
          title,
          author: author.split(", "),
          pageCount,
          description,
          img,
          categories: categories.split(", "),
          ISBN,
          copies,
        });
        inputs.forEach((input) => {
          const paragraph = document.createElement("p");
          paragraph.textContent = input.value;
          paragraph.id = input.id;
          input.parentNode.replaceChild(paragraph, input);
        });
        editButton.classList.remove("hidden");
        saveDeleteButtons.classList.add("hidden");
        showSnackbar("Book updated and History item added successfully!");
        addToHistory("update", bookId);
      } catch (error) {
        showSnackbar("Error updating book");
      }
    });
}

function deleteBook() {
  const bookId = document.getElementById("updateBookId").innerText;
  const title = document.getElementById("updateBookTitle").innerText;
  const black = document.querySelector(".black");
  const showBook = document.querySelector("#showBookProperties");

  axios
    .delete(`http://localhost:8001/books/${bookId}`)
    .then(() => {
      showSnackbar(
        `Book ${title} deleted and History item added successfully!`
      );
      addToHistory("delete", bookId);
      black.classList.add("hidden");
      showBook.classList.add("hidden");
    })
    .catch((error) => {
      console.log(error);
      showSnackbar(`There was an error deleting the book ${title}`);
    });
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

async function removeFromFavorites(svgElement) {
  const card = svgElement.parentNode.parentNode;
  const properties = card.querySelector("#updateBookForm");
  const ID = properties.querySelector("#updateBookId").innerText;
  const title = properties.querySelector("#updateBookTitle").innerText;
  try {
    await axios.delete(`http://localhost:8001/favorites/${ID}`);
    showSnackbar(`Book ${title} remove from favorites successfully!`);
  } catch (error) {
    console.log(error);
    showSnackbar(`Error removing Book ${title} to favorites`);
  } finally {
    card.classList.add("hidden");
    black.classList.add("hidden");
    location.reload();
  }
}

getFavData();
