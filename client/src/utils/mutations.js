import gql from 'graphql-tag';

export const LOGIN_USER = gql`
  mutation login($emailIn: String!, $pword: String!) {
    login(email: $emailIn,  password:$pword) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($uname: String!, $emailIn: String!, $pword: String!) {
    addUser(username:$uname, email: $emailIn,  password:$pword) {
      token
      user {
        _id
      }
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation removeBook($doomedBook: String!) {
      removeBook(delBookId:$doomedBook) {
          _id
          bookCount
          savedBooks {
            bookId
            title
            authors
            description
            image
            link          
          }
      }
    }
`;

export const SAVE_BOOK = gql`
  mutation saveBook($newBook: BookInput!) {
    saveBook(input:$newBook) {
        _id
        bookCount
        savedBooks {
          bookId
          title
          authors
          description
          image
          link          
      }
    }
  }
`;

  
  