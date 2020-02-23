<?php
  # This is the bestreads.php page for sending data to the bestreads.html page which displays 
  # information about books.
  # This API requires GET parameters that have one of the following 4 values:
  #   mode=books - return the information of all books in JSON format
  #   mode=description&title=booktitle - return the description of the book with the given title in
  #                                      plain text
  #   mode=info&title=booktitle - return the info of the book with the given title in JSON format
  #   mode=reviews&title=booktitle - return the reviews of the book with the given title in JSON 
  #                                  format
  # If the parameters are missing or their values are not valid, returns a 400 invalid-request 
  # response with an error message describing the error.
    
  error_reporting(E_ALL);
  
  $modes = array("books", "description", "info", "reviews");
  # the mode is one of "books", "description", "info" or "reviews"
  if (isset($_GET["mode"]) && in_array($_GET["mode"], $modes)) { 
    if ($_GET["mode"] === $modes[0]) { # the mode is "books"
      print_books();
    } else { # the mode is one of "description", "info" or "reviews"
      if (isset($_GET["title"])) {
        if (is_existed($modes[1], $_GET["mode"])) { # the mode is "description"
          print_description();
        } else if (is_existed($modes[2], $_GET["mode"])) { # the mode is "info"
          print_info();
        } else if (is_existed($modes[3], "review1")) { # the mode is "reviews"
          print_reviews();
        } else { # the title is not valid
          print_error_message("Error: Please provide a valid book name.");
        }
      } else { # the title is not set
        print_error_message("Error: Please remember to add the title parameter when using a mode" .
                            "of description, info or reviews.");
      }
    }
  } else { # the mode is not set, or is not one of "books", "description", "info" or "reviews"
    print_error_message("Error: Please provide a mode of description, info, reviews, or books.");
  }
  
  # Prints the information of all books (including the books' title and their folder names) in JSON
  # format.
  function print_books() {
    $books = array();
    $folders = glob("books/*");
    foreach ($folders as $folder) {
      $book = array();
      $title = file("{$folder}/info.txt", FILE_IGNORE_NEW_LINES)[0];
      $book["title"] = trim($title); 
      $book["folder"] = basename($folder);
      $books[] = $book;
    }
    print_json(array("books"=>$books));
  }

  # Returns whether the mode and title GET parameters have the valid values, i.e. the mode 
  # parameter's value is the same as the given mode value and the file (with the given name and
  # is inside the folder whose name equaling the title parameter's value) exists.
  #
  # param {string} $mode - the value that the mode parameter should have
  # param {string} $file_name - the name of the file that should exist 
  # return - true if the mode and title GET parameters have valid values, false otherwise
  function is_existed($mode, $file_name) {
    return $_GET["mode"] === $mode && file_exists("books/{$_GET['title']}/{$file_name}.txt");
  }

  # Prints the description of the book whose folder name is the same as the title GET parameter's
  # value in plain text.    
  function print_description() {
    header("Content-type: text/plain");
    print trim(file_get_contents("books/{$_GET['title']}/{$_GET['mode']}.txt"));
  }

  # Prints the info (including the book's title, author and number of stars ) of the book whose 
  # folder name is the same as the title GET parameter's value in JSON format.    
  function print_info() {
    $info_file_path = "books/{$_GET['title']}/{$_GET['mode']}.txt";
    print_json(create_output($info_file_path, array("title", "author", "stars")));
  }

  # Prints the reviews (including the reviewers' names, the scores given by the reviewers and 
  # the reviews given by the reviewers) of the book whose folder name is the same as the title
  # GET parameter's value in JSON format.  
  function print_reviews() {
    $review_files = glob("books/{$_GET['title']}/review*.txt");
    $reviews = array();
    foreach ($review_files as $review_file) {
      $reviews[] = create_output($review_file, array("name", "score", "text"));
    }
    print_json($reviews);
  }
  
  # Returns the array containing the contents (with the given content names) from the file with
  # the given path.
  #
  # param {string} $file_path - the path of the file that contains the information needed
  # param {array} $content_names - the array of content names
  # return - the array containing the contents from the given file
  function create_output($file_path, $content_names) {
    $book_file = file($file_path, FILE_IGNORE_NEW_LINES);
    $output = array();
    for ($i = 0; $i < count($content_names); $i++) {
      $output[$content_names[$i]] = trim($book_file[$i]);
    }
    return $output;
  }
  
  # Prints the given error message as plain text.
  #
  # param {string} $error_message - the error message to be printed
  function print_error_message($error_message) {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-type: text/plain");
    print $error_message;
  }
  
  # Prints the given output in JSON format.
  #
  # param {array} $output - the array containing the output to be printed
  function print_json($output) {
    header("Content-Type: application/json");
    print json_encode($output);
  }
?>