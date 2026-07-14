import DocumentEntry from './registration/DocumentEntry'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useCurrentUser } from '../../hooks/useAuth'

export default function Registration() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "staff") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);
  return <DocumentEntry />
}
