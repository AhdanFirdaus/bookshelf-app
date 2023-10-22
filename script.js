// Fungsi untuk mendapatkan data buku dari local storage
function getBooksFromStorage() {
  const books = JSON.parse(localStorage.getItem("books")) || [];
  return books;
}

// Fungsi untuk menyimpan data buku ke local storage
function saveBooksToStorage(books) {
  localStorage.setItem("books", JSON.stringify(books));
}

// Fungsi untuk menambahkan buku ke rak
function addBookToShelf(book, isComplete) {
  const bookShelf = isComplete
    ? document.getElementById("readBooks")
    : document.getElementById("unreadBooks");
  const bookList = bookShelf.querySelector("ul");
  const listItem = document.createElement("li");
  listItem.innerHTML = `
    <b>${book.title}</b> (${book.year}) oleh ${book.author}
    <div class="action-buttons">
      <button class="delete-button"><i class="fi fi-sr-trash"></i></button>
      <button class="read-button">${
        isComplete
          ? '<i class="fi fi-sr-time-past"></i>'
          : '<i class="fi fi-sr-check-circle"></i>'
      }</button>
      <button class="edit-button"><i class="fi fi-sr-pencil"></i></button>
    </div>
  `;

  // Menambahkan atribut data-id pada elemen li buku untuk referensi saat menghapus
  listItem.dataset.id = book.id;

  bookList.appendChild(listItem);

  // Menambahkan event listener untuk tombol hapus
  listItem
    .querySelector(".delete-button")
    .addEventListener("click", function () {
      removeBookFromShelfAndStorage(listItem, isComplete);
    });

  // Menambahkan event listener untuk tombol "Sudah Dibaca" atau "Sedang Dibaca"
  listItem.querySelector(".read-button").addEventListener("click", function () {
    moveBook(listItem, isComplete);
  });

  // Menambahkan event listener untuk tombol "Edit"
  listItem.querySelector(".edit-button").addEventListener("click", function () {
    editBook(book);
  });
}

// Fungsi untuk mengedit buku
function editBook(book) {
  const title = book.title;
  const author = book.author;
  const year = book.year;

  // Tampilkan pop-up pengeditan
  const editPopup = document.getElementById("editPopup");
  const editTitle = document.getElementById("editTitle");
  const editAuthor = document.getElementById("editAuthor");
  const editYear = document.getElementById("editYear");

  editTitle.value = title;
  editAuthor.value = author;
  editYear.value = year;

  editPopup.style.display = "block";

  // Tambahkan event listener untuk tombol "Simpan"
  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", function () {
    // Simpan perubahan ke data buku di local storage
    const editedTitle = editTitle.value;
    const editedAuthor = editAuthor.value;
    const editedYear = parseInt(editYear.value);

    if (!editedTitle || !editedAuthor || !editedYear) {
      alert("Mohon isi semua informasi buku.");
      return;
    }

    // Perbarui properti-properti buku yang sesuai
    book.title = editedTitle;
    book.author = editedAuthor;
    book.year = editedYear;

    // Simpan perubahan ke local storage
    const books = getBooksFromStorage();
    const index = books.findIndex((b) => b.id === book.id);
    books[index] = book;
    saveBooksToStorage(books);

    // Perbarui tampilan buku di rak
    const bookElement = document.querySelector(`[data-id="${book.id}"]`);
    bookElement.querySelector("b").textContent = book.title;

    // Sembunyikan pop-up pengeditan
    editPopup.style.display = "none";
  });

  // Tambahkan event listener untuk tombol "Tutup" pada pop-up
  const closeEditPopup = document.getElementById("closeEditPopup");
  closeEditPopup.addEventListener("click", function () {
    editPopup.style.display = "none";
  });
}

// Fungsi untuk memindahkan buku antara rak "Sedang Dibaca" dan "Belum Dibaca"
function moveBook(bookItem, isComplete) {
  const bookShelf = isComplete
    ? document.getElementById("readBooks")
    : document.getElementById("unreadBooks");
  const targetShelf = isComplete
    ? document.getElementById("unreadBooks")
    : document.getElementById("readBooks");
  const bookList = bookShelf.querySelector("ul");
  const targetList = targetShelf.querySelector("ul");

  // Ambil data buku dari local storage
  const books = getBooksFromStorage();
  const bookId = bookItem.dataset.id;

  // Temukan buku yang akan dipindahkan
  const bookToMove = books.find((book) => book.id.toString() === bookId);

  if (bookToMove) {
    // Ubah status buku
    bookToMove.isComplete = !isComplete;

    // Hapus buku dari rak saat ini
    bookList.removeChild(bookItem);

    // Simpan perubahan ke local storage
    saveBooksToStorage(books);

    // Tambahkan buku ke rak yang sesuai
    addBookToShelf(bookToMove, !isComplete);
  }
}

// Fungsi untuk menghapus buku dari rak dan local storage
function removeBookFromShelfAndStorage(bookItem, isComplete) {
  const bookShelf = isComplete
    ? document.getElementById("readBooks")
    : document.getElementById("unreadBooks");
  const bookList = bookShelf.querySelector("ul");
  bookList.removeChild(bookItem);

  // Mendapatkan data buku dari local storage
  const books = getBooksFromStorage();
  const bookId = bookItem.dataset.id;

  // Menghapus buku dari local storage berdasarkan id
  const updatedBooks = books.filter((book) => book.id.toString() !== bookId);

  // Menyimpan data buku yang sudah diperbarui ke local storage
  saveBooksToStorage(updatedBooks);
}

// Fungsi untuk menambahkan buku baru
function addNewBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isComplete = document.getElementById("isComplete").checked;

  if (!title || !author || !year) {
    alert("Mohon isi semua informasi buku.");
    return;
  }

  const newBook = {
    id: Date.now(),
    title: title,
    author: author,
    year: parseInt(year),
    isComplete: isComplete,
  };

  // Mendapatkan data buku dari local storage
  const books = getBooksFromStorage();
  books.push(newBook);

  // Menyimpan data buku ke local storage
  saveBooksToStorage(books);

  // Menambahkan buku ke rak
  addBookToShelf(newBook, isComplete);

  // Reset formulir
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("year").value = "";
  document.getElementById("isComplete").checked = false;
}

// Memuat buku-buku dari local storage saat halaman dimuat
window.addEventListener("load", function () {
  const books = getBooksFromStorage();
  const bookShelves = document.querySelectorAll(".book-list ul");

  // Bersihkan daftar buku di rak buku sebelum menampilkan data dari local storage
  bookShelves.forEach((shelf) => {
    shelf.innerHTML = "";
  });

  for (const book of books) {
    addBookToShelf(book, book.isComplete);
  }
});

// Tambahkan event listener untuk tombol "Tambah Buku"
document.getElementById("addBook").addEventListener("click", addNewBook);

// Fungsi untuk melakukan pencarian
function searchBooks(query) {
  const books = getBooksFromStorage();
  const searchResults = books.filter((book) =>
    book.title.toLowerCase().includes(query.toLowerCase())
  );
  return searchResults;
}

// Fungsi untuk menampilkan hasil pencarian
function displaySearchResults(results) {
  const searchResultsList = document.getElementById("searchResultsList");
  searchResultsList.innerHTML = "";

  if (results.length === 0) {
    searchResultsList.innerHTML = "<p>Tidak ada hasil yang cocok.</p>";
  } else {
    results.forEach((book) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <b>${book.title}</b> (${book.year}) oleh ${book.author}
        <span>${book.isComplete ? "Sudah Dibaca" : "Sedang Dibaca"}</span>
      `;
      searchResultsList.appendChild(listItem);
    });
  }
}

// Tambahkan event listener untuk tombol pencarian
document.getElementById("searchButton").addEventListener("click", function () {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value.trim();
  if (query === "") {
    alert("Masukkan kata kunci pencarian.");
  } else {
    const searchResults = searchBooks(query);
    displaySearchResults(searchResults);
  }
});
