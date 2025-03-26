import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { hideAOIPanel } from '../../store/slices/uiSlice';
import { useAOI } from '../../hooks/useAOI';

const ViewAOIPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { current: currentAOI } = useAppSelector(state => state.home.aoi);
  const showPanel = useAppSelector(state => state.ui.showAOIPanel);
  const { updateAOI, deleteAOI } = useAOI();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is a static location (non-editable) or user AOI
  const isStaticLocation = currentAOI && typeof currentAOI.id === 'number';

  useEffect(() => {
    if (currentAOI) {
      setName(currentAOI.name);
      setDescription('location' in currentAOI ? currentAOI.description : '');
      setTags('location' in currentAOI ? currentAOI.tags : []);
      setIsEditing(false);
      setIsDeleting(false);
      setError(null);
    }
  }, [currentAOI]);

  const handleSave = async () => {
    if (!currentAOI || !name.trim() || isStaticLocation) {
      setError('Invalid operation');
      return;
    }

    try {
      setError(null);
      await updateAOI(currentAOI.id, {
        name: name.trim(),
        description: description.trim(),
        tags
      });
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update AOI');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsDeleting(false);
    setError(null);
    if (currentAOI) {
      setName(currentAOI.name);
      setDescription('location' in currentAOI ? currentAOI.description : '');
      setTags('location' in currentAOI ? currentAOI.tags : []);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = async () => {
    if (!currentAOI || isStaticLocation) return;
    
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      setError(null);
      await deleteAOI(currentAOI.id);
      dispatch(hideAOIPanel());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete AOI');
      setIsDeleting(false);
    }
  };

  if (!currentAOI || !showPanel) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600 text-lg font-semibold px-1 py-1 text-gray-900"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {!isStaticLocation && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => dispatch(hideAOIPanel())}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Description Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Enter description"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Tags Section */}
          {!isStaticLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              {isEditing && (
                <div className="mb-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Add a tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isStaticLocation && isEditing && (
            <div className="pt-4 border-t space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
              <button
                onClick={handleDelete}
                className={`
                  w-full px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2
                  ${isDeleting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border border-red-300 text-red-600 hover:bg-red-50'}
                `}
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? 'Click again to confirm' : 'Delete AOI'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAOIPanel;