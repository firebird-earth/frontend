import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { stopCreatingAOI, setSelectedAOI } from '../../store/slices/uiSlice';
import { useAOI } from '../../hooks/useAOI';
import { navigateToLocation } from '../../utils/mapUtils';
import { Edit2, Trash2, X } from 'lucide-react';

const AOIPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showAOIPanel, newAOICoordinates, isCreatingAOI, selectedAOI } = useAppSelector(state => state.ui);
  const { createAOI, updateAOI, deleteAOI } = useAOI();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (selectedAOI) {
      setName(selectedAOI.name);
      setDescription(selectedAOI.description);
      setTags(selectedAOI.tags);
      setIsEditing(false);
      setIsDeleting(false);
    }
  }, [selectedAOI]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsSubmitting(false);
    setIsEditing(false);
    setIsDeleting(false);
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

  const handleCreate = async () => {
    if (!name.trim() || !newAOICoordinates || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const newAOI = await createAOI({
        name,
        description,
        location: {
          center: newAOICoordinates,
          zoom: 15
        },
        tags
      });

      // Navigate to the location first
      navigateToLocation({
        id: parseInt(newAOI.id),
        name: newAOI.name,
        coordinates: newAOI.location.center
      });

      // Then reset form and close panel
      resetForm();
      dispatch(stopCreatingAOI());
    } catch (error) {
      console.error('Failed to create AOI:', error);
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAOI || !name.trim() || name === selectedAOI.name) {
      setName(selectedAOI?.name || '');
      setIsEditing(false);
      return;
    }

    try {
      const updatedAOI = await updateAOI(selectedAOI.id, { 
        name,
        description,
        tags 
      });
      dispatch(setSelectedAOI(updatedAOI));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update AOI:', error);
      setName(selectedAOI.name);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAOI) return;
    
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      await deleteAOI(selectedAOI.id);
      dispatch(setSelectedAOI(null));
    } catch (error) {
      console.error('Failed to delete AOI:', error);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (isCreatingAOI && name.trim() && newAOICoordinates && !isSubmitting) {
          handleCreate();
        } else if (isEditing) {
          handleUpdate();
        }
      }
    };

    if (showAOIPanel) {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [showAOIPanel, name, newAOICoordinates, isSubmitting, isEditing]);

  useEffect(() => {
    if (!showAOIPanel) {
      resetForm();
    }
  }, [showAOIPanel]);

  if (!showAOIPanel) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {isCreatingAOI ? (
            <h3 className="text-lg font-semibold text-gray-900">New AOI</h3>
          ) : (
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleUpdate}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-600 text-lg font-semibold"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => {
              if (isCreatingAOI) {
                dispatch(stopCreatingAOI());
              } else {
                dispatch(setSelectedAOI(null));
              }
            }}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Description Field - Always shown for create, only shown if exists for view */}
          {(isCreatingAOI || selectedAOI?.description) && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              {isCreatingAOI ? (
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter description"
                />
              ) : (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
          )}

          {/* Tags Section */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            {isCreatingAOI && (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add tags"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Add
                </button>
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    {isCreatingAOI && (
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
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {isCreatingAOI ? (
              <>
                <button
                  onClick={() => dispatch(stopCreatingAOI())}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium
                    ${(name.trim() && newAOICoordinates && !isSubmitting)
                      ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                  `}
                  disabled={!name.trim() || !newAOICoordinates || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AOIPanel;