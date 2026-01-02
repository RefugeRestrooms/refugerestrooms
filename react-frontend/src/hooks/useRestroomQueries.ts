import { useQuery, useMutation, type QueryHookOptions, type MutationHookOptions } from '@apollo/client/react';
import {
  GET_RESTROOM,
  LIST_RESTROOMS,
  CREATE_RESTROOM,
  UPDATE_RESTROOM,
  DELETE_RESTROOM,
  SUBMIT_FEEDBACK,
  type Restroom,
  type RestroomConnection,
  type CreateRestroomInput,
  type UpdateRestroomInput,
  type DeleteRestroomResponse,
  type FeedbackReason,
} from '../types/generated';

// Query Variables Types
export interface GetRestroomVariables {
  id: string;
}

export interface ListRestroomsVariables {
  limit?: number;
  nextToken?: string;
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  query?: string;
}

export interface CreateRestroomVariables {
  input: CreateRestroomInput;
}

export interface UpdateRestroomVariables {
  id: string;
  input: UpdateRestroomInput;
}

export interface DeleteRestroomVariables {
  id: string;
}

export interface SubmitFeedbackVariables {
  restroomId: string;
  positive: boolean;
  reasons?: FeedbackReason[];
  comment?: string;
}

// Query Response Types
export interface GetRestroomData {
  getRestroom: Restroom;
}

export interface ListRestroomsData {
  listRestrooms: RestroomConnection;
}

export interface CreateRestroomData {
  createRestroom: Restroom;
}

export interface UpdateRestroomData {
  updateRestroom: Restroom;
}

export interface DeleteRestroomData {
  deleteRestroom: DeleteRestroomResponse;
}

export interface SubmitFeedbackData {
  submitFeedback: Restroom;
}

// Custom Hooks
export const useGetRestroomQuery = (variables?: GetRestroomVariables, options?: QueryHookOptions<GetRestroomData, GetRestroomVariables>) => {
  return useQuery<GetRestroomData, GetRestroomVariables>(GET_RESTROOM, {
    ...options,
    variables: variables || options?.variables || { id: '' },
  });
};

export const useListRestroomsQuery = (variables?: ListRestroomsVariables, options?: QueryHookOptions<ListRestroomsData, ListRestroomsVariables>) => {
  return useQuery<ListRestroomsData, ListRestroomsVariables>(LIST_RESTROOMS, {
    variables,
    ...options,
  });
};

export const useCreateRestroomMutation = (options?: MutationHookOptions<CreateRestroomData, CreateRestroomVariables>) => {
  return useMutation<CreateRestroomData, CreateRestroomVariables>(CREATE_RESTROOM, options);
};

export const useUpdateRestroomMutation = (options?: MutationHookOptions<UpdateRestroomData, UpdateRestroomVariables>) => {
  return useMutation<UpdateRestroomData, UpdateRestroomVariables>(UPDATE_RESTROOM, options);
};

export const useDeleteRestroomMutation = (options?: MutationHookOptions<DeleteRestroomData, DeleteRestroomVariables>) => {
  return useMutation<DeleteRestroomData, DeleteRestroomVariables>(DELETE_RESTROOM, options);
};

export const useSubmitFeedbackMutation = (options?: MutationHookOptions<SubmitFeedbackData, SubmitFeedbackVariables>) => {
  return useMutation<SubmitFeedbackData, SubmitFeedbackVariables>(SUBMIT_FEEDBACK, options);
};