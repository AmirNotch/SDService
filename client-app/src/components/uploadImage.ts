// uploadImage.ts
export const uploadImage = async (imageBlob: Blob): Promise<{ name: string }> => {
    const formData = new FormData();
    formData.append('file', imageBlob);
  
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Ошибка при загрузке изображения');
    }
  
    const result = await response.json();
    return { name: result.filename };
  };
  