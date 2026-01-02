import React, { useState } from 'react';
import { useListRestroomsQuery, useGetRestroomQuery } from '../../hooks/useRestroomQueries';
import { useLoadingState } from '../../utils/loadingStates';
import { parseApolloError } from '../../utils/errorHandling';

/**
 * Demo component to test GraphQL integration
 * This component demonstrates:
 * - Query execution with loading states
 * - Error handling
 * - Generated TypeScript hooks
 */
export const GraphQLDemo: React.FC = () => {
  const [selectedRestroomId, setSelectedRestroomId] = useState<string>('');

  // Test the listRestrooms query
  const {
    data: restroomsData,
    loading: restroomsLoading,
    error: restroomsError,
    networkStatus: restroomsNetworkStatus,
    refetch: refetchRestrooms,
  } = useListRestroomsQuery(
    { limit: 5 },
    { errorPolicy: 'all' }
  );

  // Test the getRestroom query (only if we have a selected ID)
  const {
    data: restroomData,
    loading: restroomLoading,
    error: restroomError,
    networkStatus: restroomNetworkStatus,
  } = useGetRestroomQuery(
    undefined,
    {
      variables: { id: selectedRestroomId || '' },
      skip: !selectedRestroomId,
      errorPolicy: 'all',
    }
  );

  // Use loading state utilities
  const restroomsLoadingState = useLoadingState(
    restroomsLoading,
    restroomsNetworkStatus,
    true,
    restroomsError
  );

  const restroomLoadingState = useLoadingState(
    restroomLoading,
    restroomNetworkStatus,
    !!selectedRestroomId,
    restroomError
  );

  const handleRestroomSelect = (id: string) => {
    setSelectedRestroomId(id);
  };

  const handleRefresh = () => {
    refetchRestrooms();
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h2>GraphQL Integration Demo</h2>
      
      {/* List Restrooms Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3>List Restrooms Query</h3>
        <button onClick={handleRefresh} disabled={restroomsLoadingState.loading}>
          {restroomsLoadingState.loadingMessage || 'Refresh'}
        </button>
        
        {restroomsLoadingState.isInitialLoading && (
          <p>Loading restrooms...</p>
        )}
        
        {restroomsLoadingState.isRefetching && (
          <p>Refreshing restrooms...</p>
        )}
        
        {restroomsError && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            <strong>Error:</strong> {parseApolloError(restroomsError).message}
          </div>
        )}
        
        {restroomsData?.listRestrooms?.items && (
          <div>
            <p>Found {restroomsData.listRestrooms.items.length} restrooms</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {restroomsData.listRestrooms.items.map((restroom: { 
                id: string; 
                name: string; 
                street?: string; 
                city?: string; 
                state?: string; 
                accessible?: boolean; 
                unisex?: boolean; 
                changingTable?: boolean; 
              }) => (
                <li
                  key={restroom.id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedRestroomId === restroom.id ? '#e3f2fd' : 'white',
                  }}
                  onClick={() => handleRestroomSelect(restroom.id)}
                >
                  <strong>{restroom.name}</strong>
                  <br />
                  <small>{restroom.street}, {restroom.city}, {restroom.state}</small>
                  <br />
                  <small>
                    Features: 
                    {restroom.accessible && ' ♿ Accessible'}
                    {restroom.unisex && ' 🚻 Unisex'}
                    {restroom.changingTable && ' 👶 Changing Table'}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Get Restroom Section */}
      <div>
        <h3>Get Restroom Query</h3>
        {selectedRestroomId ? (
          <>
            <p>Selected Restroom ID: <code>{selectedRestroomId}</code></p>
            
            {restroomLoadingState.isInitialLoading && (
              <p>Loading restroom details...</p>
            )}
            
            {restroomError && (
              <div style={{ color: 'red', margin: '10px 0' }}>
                <strong>Error:</strong> {parseApolloError(restroomError).message}
              </div>
            )}
            
            {restroomData?.getRestroom && (
              <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4>{restroomData.getRestroom.name}</h4>
                <p>
                  <strong>Address:</strong> {restroomData.getRestroom.street}, {restroomData.getRestroom.city}, {restroomData.getRestroom.state}, {restroomData.getRestroom.country}
                </p>
                {restroomData.getRestroom.comment && (
                  <p><strong>Comment:</strong> {restroomData.getRestroom.comment}</p>
                )}
                <p>
                  <strong>Votes:</strong> ↑{restroomData.getRestroom.upvote} ↓{restroomData.getRestroom.downvote}
                </p>
                <p>
                  <strong>Features:</strong>
                  <span style={{ marginLeft: '10px' }}>
                    {restroomData.getRestroom.accessible && '♿ Accessible '}
                    {restroomData.getRestroom.unisex && '🚻 Unisex '}
                    {restroomData.getRestroom.changingTable && '👶 Changing Table'}
                  </span>
                </p>
              </div>
            )}
          </>
        ) : (
          <p>Click on a restroom above to see its details</p>
        )}
      </div>
    </div>
  );
};