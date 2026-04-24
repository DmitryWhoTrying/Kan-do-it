import React, {useRef, useState, useCallback} from "react";
import { boardService } from "../../services/board-service";
import { TaskImage } from "../../../../shared/types";

interface TaskImageUploadProps {
    taskId: number;
    boardId: number;
    onImageAdded?: (image: TaskImage) => void;
}

export const TaskImageUpload: React.FC<TaskImageUploadProps> = ({ taskId, boardId, onImageAdded }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileSelect = useCallback((file: File)=> {
        if (!file.type.startsWith('image/')) {
            alert('Только изображения.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Макс размер 5 МБ.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleUpload = useCallback(async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file || ! preview) return;

        try{
            setIsUploading(true);

            const formData = new FormData();
            formData.append('image', file);

            const uploadedImage = await boardService.uploadTaskImage(boardId, taskId, formData);

            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            onImageAdded?.(uploadedImage);
        }
        catch (error) {
        console.error('Upload failed:', error);
        alert('Не удалось загрузить изображение');
        } 
        finally {
        setIsUploading(false);
        }
    }, [preview, boardId, taskId, onImageAdded]);

    return (
    <div className="task-image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        disabled={isUploading}
        className="file-input"
      />
      
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" className="preview-img" />
          <div className="preview-actions">
            <button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Загрузка...' : 'Прикрепить'}
            </button>
            <button onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}