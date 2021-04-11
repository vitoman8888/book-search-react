import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

//import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations'

const SavedBooks = () => {
  const { data: userData, loading } = useQuery(QUERY_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    console.log("ENTER handleDeleteBook");
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    console.log("handleDeleteBook token pass");
    try {
      const { data } = await removeBook({
        variables: { doomedBook: bookId }
      });
      console.log("handleDeleteBook:removeBook SUCCESS");
      console.log(data);

    } catch (err) {
      console.log("handleDeleteBook:removeBook err");
      console.error(err);
    }
  };

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      {loading ? (
          <div>Loading...</div>
        ) : (      
        <Container>
          <h2>
            {userData.me.bookCount > 0
              ? `Viewing ${userData.me.bookCount} saved ${userData.me.bookCount === 1 ? 'book' : 'books'}:`
              : 'You have no saved books!'}
          </h2>
          <CardColumns>
            {userData.me.savedBooks.map((book) => {
              return (
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              );
            })}
          </CardColumns>
        </Container>
      )}
      </>
  );
};

export default SavedBooks;
