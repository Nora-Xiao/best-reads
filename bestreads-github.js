// This is bestreads.js for the interaction side of the bestreads.html page which displays 
// information about books. It displays the books when the page loads, and defines the page 
// responses when the user clicks the button for re-displaying the books and when the user clicks
// each book.

"use strict";

/* global fetch */

(function() {
  /**
   * Returns the DOM element with the given id.
   *
   * @param {string} id - the id of the DOM element to retrieve
   * @return {object} the DOM object with the given id 
   */
  function $(id) {
    return document.getElementById(id);
  }

  /**
   * Pre-canned code from lecture to handle responses...
   * include this code, based on:
   * https://developers.google.com/web/updates/2015/03/introduction-to-fetch
   * updated from 
   * https://stackoverflow.com/questions/29473426/fetch-reject-promise-with-json-error-object
   */
  function checkStatus(response) {
    let responseText = response.text();
    if (response.status >= 200 && response.status < 300) {
      return responseText;
    } else {
      return responseText.then(Promise.reject.bind(Promise));
    }
  }

  /**
   * After the page loads, displays the books and defines the page responses when the user clicks
   * the button for re-displaying the books.
   */
  window.onload = function() {
    findBookInfo("books", displayBooks);
    /* when the user clicks the home button, displays all books on the page */
    $("back").onclick = function() { 
      findBookInfo("books", displayBooks);
    };
  };
  
  /**
   * If the area containing all books is empty, hides the areas containing the error message and
   * the information about a single book, and displays all books' titles and their images based on
   * the information from the given object.
   *
   * @param {object} books - the object containing all books' titles and their folder names
   */
  function displayBooks(books) {
    if (!$("allbooks").children.length) { /* check if the area containing all books is empty */
      $("error-message").classList.add("hidden");
      $("singlebook").classList.add("hidden");
      for (let i = 0; i < books["books"].length; i++) {
        let book = document.createElement("div");
        let image = document.createElement("img");
        let bookFolderName = books.books[i].folder;
        image.src = "books/" + bookFolderName + "/cover.jpg";
        image.alt = bookFolderName;
        book.appendChild(image);
        addContent("p", books.books[i].title, book);
        book.onclick = displaySingleBook;
        $("allbooks").appendChild(book);
      }
    }
  }
  
  /**
   * Empties the area containing all books. Unhides the area contaning the single book, and 
   * displays the book's image, description, info and reviews.
   */
  function displaySingleBook() {
    $("allbooks").innerHTML = "";
    $("singlebook").classList.remove("hidden");
    let bookName = this.children[0].alt;
    $("cover").src = "books/" + bookName + "/cover.jpg";
    findDescription(bookName);
    findBookInfo("info&title=" + bookName, displayInfo);
    findBookInfo("reviews&title=" + bookName, displayReviews);
  }
  
  /**
   * Finds the description of the book with the given name. If successful, displays the book's
   * description on the page. If unsuccessful, displays the error message.
   *
   * @param {string} bookName - the name of the book
   */
  function findDescription(bookName) {
    fetch("bestreads.php?mode=description&title=" + bookName, {credentials: "include"}) 
      .then(checkStatus)
      .then(displayDescription)
      .catch(displayErrorMessage);
  }
  
  /**
   * Displays the given description in the book description area on the page. 
   *
   * @param {string} description - the text for the book's description
   */
  function displayDescription(description) {
    $("description").innerText = description;
  }

  /**
   * Displays the book's title, author and number of stars from the given object in their 
   * respective container area on the page.
   *
   * @param {object} info - the object containing the book's info
   */  
  function displayInfo(info) {
    $("title").innerText = info.title;
    $("author").innerText = info.author;
    $("stars").innerText = info.stars;
  }

  /**
   * Displays the book's reviews (including the reviewers' names, the scores given by the reviewers 
   * and the reviews given by the reviewers) from the given object in the reviews area on the page.
   *
   * @param {object} reviews - the object containing the book's reviews
   */   
  function displayReviews(reviews) {
    $("reviews").innerHTML = "";
    for (let i = 0; i < reviews.length; i++) {
      addContent("h3", reviews[i].name, $("reviews"));
      let reviewContents = $("reviews").children;
      /* add the score given by the reviewer to the review title */
      addContent("span", " " + reviews[i].score, reviewContents[reviewContents.length - 1]);
      addContent("p", reviews[i].text, $("reviews"));
    }
  }

  /**
   * Displays the given text in the element with the given type in the given container area.
   *
   * @param {string} elementType - the type of the element that will be created
   * @param {string} contentText - the text to be added to the element
   * @param {object} container - the area that will contain the element 
   */    
  function addContent(elementType, contentText, container) {
    let content = document.createElement(elementType);
    content.innerText = contentText;
    container.appendChild(content);
  }

  /**
   * Sends the request to the bestreads web service with the given mode and title. If the request
   * is successful, executes the given function. If unsuccessful, displays the error message on the
   * page.
   *
   * @param {string} modeAndTitle - the mode name (one of "books", "info" and "reviews") and
   *                                the book's title
   * @param {function} displayOutput - the function to be executed when the request is successful
   */
  function findBookInfo(modeAndTitle, displayOutput) {
    fetch("bestreads.php?mode=" + modeAndTitle, {credentials: "include"}) 
      .then(checkStatus)
      .then(JSON.parse)
      .then(displayOutput)
      .catch(displayErrorMessage);    
  }

  /**
   * In the error message area on the page, displays the given message.
   *
   * @param {string} errorMessage - the error message to be displayed
   */
  function displayErrorMessage(errorMessage) {
    $("error-message").classList.remove("hidden");
    $("error-text").innerText = errorMessage;
  }
})();