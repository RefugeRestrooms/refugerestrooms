import { gql } from '@apollo/client';

// Manual type definitions for GraphQL operations
export interface Restroom {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  comment?: string;
  directions?: string;
  upvote: number;
  downvote: number;
  approved: boolean;
  overallScore?: number;
  safetyScore?: number;
  totalFeedback?: number;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface RestroomConnection {
  items: Restroom[];
  nextToken?: string;
  count: number;
}

export interface CreateRestroomInput {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  comment?: string;
  directions?: string;
}

export interface UpdateRestroomInput {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  comment?: string;
  directions?: string;
}

export type FeedbackReason = 
  | 'SAFE'
  | 'CLEAN'
  | 'ACCESSIBLE'
  | 'ACCURATE'
  | 'PRIVATE'
  | 'UNSAFE'
  | 'DIRTY'
  | 'INACCESSIBLE'
  | 'OUTDATED'
  | 'INAPPROPRIATE';

export interface DeleteRestroomResponse {
  success: boolean;
  message: string;
  id?: string;
}

// GraphQL Documents
export const GET_RESTROOM = gql`
  query GetRestroom($id: ID!) {
    getRestroom(id: $id) {
      id
      name
      street
      city
      state
      country
      latitude
      longitude
      accessible
      unisex
      changingTable
      comment
      directions
      upvote
      downvote
      approved
      overallScore
      safetyScore
      totalFeedback
      confidence
      createdAt
      updatedAt
      distance
    }
  }
`;

export const LIST_RESTROOMS = gql`
  query ListRestrooms(
    $limit: Int
    $nextToken: String
    $accessible: Boolean
    $unisex: Boolean
    $changingTable: Boolean
    $lat: Float
    $lng: Float
    $radius: Int
    $query: String
  ) {
    listRestrooms(
      limit: $limit
      nextToken: $nextToken
      accessible: $accessible
      unisex: $unisex
      changingTable: $changingTable
      lat: $lat
      lng: $lng
      radius: $radius
      query: $query
    ) {
      items {
        id
        name
        street
        city
        state
        country
        latitude
        longitude
        accessible
        unisex
        changingTable
        comment
        directions
        upvote
        downvote
        approved
        overallScore
        safetyScore
        totalFeedback
        confidence
        createdAt
        updatedAt
        distance
      }
      nextToken
      count
    }
  }
`;

export const CREATE_RESTROOM = gql`
  mutation CreateRestroom($input: CreateRestroomInput!) {
    createRestroom(input: $input) {
      id
      name
      street
      city
      state
      country
      latitude
      longitude
      accessible
      unisex
      changingTable
      comment
      directions
      upvote
      downvote
      approved
      overallScore
      safetyScore
      totalFeedback
      confidence
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_RESTROOM = gql`
  mutation UpdateRestroom($id: ID!, $input: UpdateRestroomInput!) {
    updateRestroom(id: $id, input: $input) {
      id
      name
      street
      city
      state
      country
      latitude
      longitude
      accessible
      unisex
      changingTable
      comment
      directions
      upvote
      downvote
      approved
      overallScore
      safetyScore
      totalFeedback
      confidence
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_RESTROOM = gql`
  mutation DeleteRestroom($id: ID!) {
    deleteRestroom(id: $id) {
      success
      message
      id
    }
  }
`;

export const SUBMIT_FEEDBACK = gql`
  mutation SubmitFeedback(
    $restroomId: ID!
    $positive: Boolean!
    $reasons: [FeedbackReason!]
    $comment: String
  ) {
    submitFeedback(
      restroomId: $restroomId
      positive: $positive
      reasons: $reasons
      comment: $comment
    ) {
      id
      name
      street
      city
      state
      country
      latitude
      longitude
      accessible
      unisex
      changingTable
      comment
      directions
      upvote
      downvote
      approved
      overallScore
      safetyScore
      totalFeedback
      confidence
      createdAt
      updatedAt
    }
  }
`;