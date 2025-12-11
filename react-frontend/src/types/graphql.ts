// GraphQL query and mutation interfaces

export interface ListRestroomsQuery {
  lat?: number;
  lng?: number;
  radius?: number;
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  query?: string;
  limit?: number;
  nextToken?: string;
}

export interface RestroomResponse {
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
  distance?: number;
  overallScore?: number;
  safetyScore?: number;
  totalFeedback?: number;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
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

export interface FeedbackInput {
  restroomId: string;
  positive: boolean;
  reasons: FeedbackReason[];
  comment?: string;
}

export type FeedbackReason =
  | 'CLEAN'
  | 'SAFE'
  | 'ACCESSIBLE'
  | 'PRIVATE'
  | 'WELL_LIT'
  | 'DIRTY'
  | 'UNSAFE'
  | 'INACCESSIBLE'
  | 'NO_PRIVACY'
  | 'POORLY_LIT';
