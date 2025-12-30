import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { ErrorBoundary } from './ErrorBoundary';
import { 
  HomePage, 
  SubmitPage, 
  RestroomDetailPage, 
  AboutPage, 
  NotFoundPage 
} from '../../pages';

export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route 
              path="/" 
              element={
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/submit" 
              element={
                <ErrorBoundary>
                  <SubmitPage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/restroom/:id" 
              element={
                <ErrorBoundary>
                  <RestroomDetailPage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/about" 
              element={
                <ErrorBoundary>
                  <AboutPage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="*" 
              element={
                <ErrorBoundary>
                  <NotFoundPage />
                </ErrorBoundary>
              } 
            />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}