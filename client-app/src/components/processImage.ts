// processImage.ts
export interface ProcessResult {
    url: string;
    filename: string;
    sessionId: string;
    error: string;
  }
  
  export const processImage = async (imageName: string): Promise<ProcessResult> => {
    const response = await fetch(`/api/process?userImageName=${encodeURIComponent(imageName)}`);
  
    if (!response.ok) {
      throw new Error('Ошибка при обработке изображения');
    }
  
    const result = await response.json();
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
    return {
      url: result.url || '',
      filename: result.filename || imageName,
      sessionId,
      error: result.error || '',
    };
  };
  