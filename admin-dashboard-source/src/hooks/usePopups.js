import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Popup management hook
 * Provides state management and API functions for popup operations
 */
export const usePopups = () => {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all popups from API
   */
  const fetchPopups = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.popups.getAll();
      if (response.data && response.data.data) {
        setPopups(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setPopups(response.data);
      } else {
        setPopups([]);
      }
    } catch (err) {
      console.error('Failed to fetch popups:', err);
      setError('팝업 목록을 불러오는데 실패했습니다.');
      setPopups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new popup
   */
  const createPopup = useCallback(async (popupData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.popups.create(popupData);
      if (response.data) {
        // Refresh the popup list
        await fetchPopups();
        return response.data;
      }
    } catch (err) {
      console.error('Failed to create popup:', err);
      const errorMessage = err.response?.data?.message || '팝업 생성에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPopups]);

  /**
   * Update an existing popup
   */
  const updatePopup = useCallback(async (id, popupData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.popups.update(id, popupData);
      if (response.data) {
        // Refresh the popup list
        await fetchPopups();
        return response.data;
      }
    } catch (err) {
      console.error('Failed to update popup:', err);
      const errorMessage = err.response?.data?.message || '팝업 수정에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPopups]);

  /**
   * Delete a popup
   */
  const deletePopup = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.popups.delete(id);
      if (response.data) {
        // Refresh the popup list
        await fetchPopups();
        return response.data;
      }
    } catch (err) {
      console.error('Failed to delete popup:', err);
      const errorMessage = err.response?.data?.message || '팝업 삭제에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPopups]);

  /**
   * Toggle popup status (active/inactive)
   */
  const togglePopupStatus = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.popups.toggle(id);
      if (response.data) {
        // Refresh the popup list
        await fetchPopups();
        return response.data;
      }
    } catch (err) {
      console.error('Failed to toggle popup status:', err);
      const errorMessage = err.response?.data?.message || '팝업 상태 변경에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchPopups]);

  /**
   * Upload an image for popup
   */
  const uploadImage = useCallback(async (imageFile) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiService.popups.uploadImage(formData);
      if (response.data) {
        // API 응답에서 imageUrl 추출 (여러 가능한 위치 확인)
        const imageUrl = response.data.data?.imageUrl || response.data.imageUrl || response.data.url;
        if (imageUrl) {
          return imageUrl;
        }
      }
      throw new Error('이미지 URL을 응답에서 찾을 수 없습니다.');
    } catch (err) {
      console.error('Failed to upload image:', err);
      const errorMessage = err.response?.data?.message || '이미지 업로드에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an uploaded image
   */
  const deleteImage = useCallback(async (imageUrl) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.popups.deleteImage({ imageUrl });
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
      const errorMessage = err.response?.data?.message || '이미지 삭제에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch popups on hook initialization
  useEffect(() => {
    fetchPopups();
  }, [fetchPopups]);

  return {
    popups,
    loading,
    error,
    createPopup,
    updatePopup,
    deletePopup,
    togglePopupStatus,
    uploadImage,
    deleteImage,
    refetch: fetchPopups
  };
};

export default usePopups;