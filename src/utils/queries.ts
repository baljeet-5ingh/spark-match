import gql from "graphql-tag";

export const CHECK_USER = gql`
  query CheckUser($clerkId: String!) {
    checkExistingUser(clerkId: $clerkId)
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($clerkId: String!) {
    getCurrentUser(clerkId: $clerkId) {
      id
      clerkId
      email
      name
      age
      bio
      gender
      birthday
      photos
      preferences {
        minAge
        maxAge
        distanceKm
        gender
      }
      location {
        lat
        lng
      }
      city
      isOnline
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($userId: String!) {
    getUserById(userId: $userId) {
      id
      clerkId
      name
      age
      bio
      gender
      birthday
      photos
      preferences {
        minAge
        maxAge
        distanceKm
        gender
      }
      location {
        lat
        lng
      }
      isOnline
      createdAt
    }
  }
`;

export const GET_PREFERRED_USERS = gql`
  query Query(
    $clerkId: String!
    $limit: Int
    $cursor: String
    $distanceKm: Int
    $currentLocation: LocationInput
  ) {
    getPreferredUsers(
      clerkId: $clerkId
      limit: $limit
      cursor: $cursor
      distanceKm: $distanceKm
      currentLocation: $currentLocation
    ) {
      id
      name
      age
      photos
      bio
      isOnline
      location {
        lat
        lng
      }
    }
  }
`;

export const GET_USERS_WHO_LIKED_ME = gql`
  query GetUsersWhoLikedMe($clerkId: String!) {
    getUsersWhoLikedMe(clerkId: $clerkId) {
      id
      name
      age
      photos
      bio
      isOnline
    }
  }
`;

export const GET_MY_MATCHES = gql`
  query GetMyMatches($clerkId: String!) {
    getMyMatches(clerkId: $clerkId) {
      id
      name
      age
      photos
      isOnline
      lastActiveAt
    }
  }
`;
