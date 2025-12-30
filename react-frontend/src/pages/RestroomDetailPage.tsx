import { useParams, Navigate } from 'react-router-dom';
import { RestroomDetail } from '../components/restroom/RestroomDetail';
import styles from './RestroomDetailPage.module.css';

export function RestroomDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.restroomDetailPage}>
      <RestroomDetail restroomId={id} />
    </div>
  );
}