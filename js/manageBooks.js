
const url = "http://localhost:8001/books";
const displayBooksBySearch = document.getElementById("displayBooksBySearch");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageNumberElement = document.getElementById("pageNumber");
const showCategories = document.querySelector(".showCategories");
const categoryFilter = document.getElementById("categoryFilter");
const booksPerPage = 9;
let currentPage = 1;
let totalBooks = 0;
let allBooks = [];
let snackbarTimeout
const spinner = document.getElementById("spinner");

document
  .getElementById("searchBookByStr")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    currentPage = 1;
    const input = document.getElementById("searchInput").value;
    await searchBooks(input);
  });

categoryFilter.addEventListener("change", () => {
  currentPage = 1;
  const selectedCategory = categoryFilter.value;
  filterBooks(selectedCategory);
});

prevPageButton.addEventListener("click", () => changePage(-1));
nextPageButton.addEventListener("click", () => changePage(1));

async function searchBooks(query) {
  spinner.classList.remove("hidden");
  displayBooksBySearch.innerHTML = "";
  displayBooksBySearch.classList.add("hidden");

  try {
    const response = await axios.get(url);
    allBooks = response.data.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    allBooks.sort((a, b) => a.title.localeCompare(b.title));
    totalBooks = allBooks.length;
    showCategories.classList.remove("hidden");

    if (totalBooks === 0) {
      showSnackbar("No books found");
      spinner.classList.add("hidden");
      showCategories.classList.add("hidden");
    } else {
      filterBooks(categoryFilter.value);
    }
  } catch (error) {
    showSnackbar("Error fetching books");
    spinner.classList.add("hidden");
  } finally {
    displayBooksBySearch.classList.remove("hidden");
  }
}

function filterBooks(category) {
  const filteredBooks = allBooks.filter(
    (book) => category === "" || book.categories.join(", ") === category
  );
  totalBooks = filteredBooks.length;
  displayPage(filteredBooks);
}

function displayPage(books) {
  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const paginatedBooks = books.slice(start, end);

  displayBooksBySearch.innerHTML = paginatedBooks
    .map(
      (book) => `
      <div class="bookCard" onclick="openBookProperties(this)">
            <span class="hidden" id="bookId">${book.id}</span>
          <img src="${book.img}" alt="${book.title}">
          <div class="bookProperties">
              <h2>${
                book.title.slice(0, 40) + (book.title.length > 40 ? "..." : "")
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
  filterBooks(categoryFilter.value);
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

async function openBookProperties(svgElement) {
  const black = document.querySelector(".black");
  const showBook = document.querySelector("#showBookProperties");
  black.classList.remove("hidden");
  const bookId = svgElement.querySelector("#bookId").outerText;
  const response = await axios.get(`${url}/${bookId}`);
  showBook.innerHTML = `
    <div class="topCard">

      <img id="image" src="${response.data.img}" alt="${response.data.title}">
    <button onclick="addToFavorites(this)" class="favorites" id="favoritesButton"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
  </svg></button>
      <button onclick="editBook(this)" class="edit" id="editButton"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
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
    <div class="button-group hidden" id="button-group">
      <button type="submit" onClick="updateBook(this)" class="save" id="save">Save Changes</button>
      <button type="button" onClick="deleteBook()" class="delete" id="delete">Delete Book</button>
    </div>
    
    </form>
    `;
  showBook.classList.remove("hidden");
  document.documentElement.scrollTop = 0;
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
  const favButton = document.getElementById("favoritesButton");

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
    favButton.classList.add("hidden");
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
      const favButton = document.getElementById("favoritesButton");
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
        favButton.classList.remove("hidden");
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

async function addToFavorites(svgElement) {
  const card = svgElement.parentNode.parentNode;
  const topCard = svgElement.parentNode;
  const properties = card.querySelector("#updateBookForm");
  const title = properties.querySelector("#updateBookTitle").innerText;
  const author = properties.querySelector("#updateBookAuthor").innerText;
  const description = properties.querySelector(
    "#updateBookDescription"
  ).innerText;
  const img = topCard.querySelector("#image").src;
  const categories = properties.querySelector(
    "#updateBookCategories"
  ).innerText;
  const pageCount = properties.querySelector("#updateBookNumPages").innerText;
  const ID = properties.querySelector("#updateBookId").innerText;
  const ISBN = properties.querySelector("#updateBookISBN").innerText;
  const copies = properties.querySelector("#updateBookNumCopies").innerText;
  const favoriteData = {
    id: ID,
    title,
    author,
    pageCount,
    description,
    img,
    categories,
    ISBN,
    copies,
  };

  try {
    const { data: books } = await axios.get("http://localhost:8001/favorites");

    const bookExists = books.some((book) => book.id === ID);

    if (bookExists) {
      showSnackbar("Book Already In Favorites");
      return;
    }

    await axios.post("http://localhost:8001/favorites", favoriteData);
    showSnackbar(`Book ${title} added to favorites successfully!`);

    svgElement.parentNode.innerHTML = `
      <img id="image" src="${img}" alt="${title}">
      <button onclick="removeFromFavorites(this)" class="favorites" id="favoritesButton">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
        </svg>
      </button>
      <button onclick="editBook(this)" class="edit" id="editButton">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
        </svg>
      </button>
      <button class="close" onClick="closeBook()">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      </button>`;
  } catch (error) {
    console.log(error);
    showSnackbar(`Error Adding New Book ${title} to favorites`);
  }
}

async function removeFromFavorites(svgElement) {
  const card = svgElement.parentNode.parentNode;
  const properties = card.querySelector("#updateBookForm");
  const ID = properties.querySelector("#updateBookId").innerText;
  console.log(ID);
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
  }
}
