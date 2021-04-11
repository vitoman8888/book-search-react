import React, { useState } from 'react';
import { Jumbotron, Container, Col, Form, Button, Card, CardColumns } from 'react-bootstrap';

import Auth from '../utils/auth';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { QUERY_ME } from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations'

import { searchGoogleBooks } from '../utils/API';

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  const { data: userData, loading } = useQuery(QUERY_ME);
  
  const [addBook] = useMutation(SAVE_BOOK);
  const loggedIN = Auth.loggedIn();

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      // console.log(userData);
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      console.log("Books:");
      console.log(items);
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.selfLink
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    const bookInputJSON = { newBook: bookToSave };

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await addBook({
        variables: { ...bookInputJSON }
      });
      console.log("handleSaveBook:addBook SUCCESS");
      console.log(data);

    } catch (err) {
      console.log("handleSaveBook:addBook err : ");
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        {loading ? (
            <div>Loading...</div>
          ) : (
          <CardColumns>
            {searchedBooks.map((book) => {
              return (
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {loggedIN && userData ? (
                      <Button
                        disabled={userData.me.savedBooks?.some((saveBook) => saveBook.bookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {userData.me.savedBooks?.some((saveBook) => saveBook.bookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    ) : null }
                  </Card.Body>
                </Card>
              );
            })}
          </CardColumns>
        )}
        </Container>
    </>
  );
};

export default SearchBooks;

//{Auth.loggedIn() && (
//  <Button
//    disabled={savedBookIds?.some((savedBookId) => savedBookId.bookId === book.bookId)}
//    className='btn-block btn-info'
//    onClick={() => handleSaveBook(book.bookId)}>
//    {savedBookIds?.some((savedBookId) => savedBookId.bookId === book.bookId)
//      ? 'This book has already been saved!'
//      : 'Save this Book!'}
//  </Button>
//)}
