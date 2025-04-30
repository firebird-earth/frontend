import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { stopCreatingAOI } from '../../store/slices/uiSlice';
import { clearAOI, setCoordinates } from '../../store/slices/homeSlice/actions';
import { clearActiveLocation } from '../../store/slices/mapSlice';
import { clearActiveLayers } from '../../store/slices/layersSlice';
import { useAOI } from '../../hooks/useAOI';

const CreateAOIPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isCreatingAOI } = useAppSelector(state => state.ui);
  const coordinates = useAppSelector(state => state.home.aoi.coordinates);
  const { createAOI } = useAOI();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    dispatch(stopCreatingAOI());
    dispatch(clearAOI());
    dispatch(clearActiveLocation());
    resetForm();
  };

  const handleSave = async () => {
    if (!name.trim() || !coordinates || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createAOI({
        name,
        description,
        location: {
          center: coordinates,
          zoom: 15
        },
        tags
      });
      
      // Reset form and close panel
      resetForm();
      dispatch(stopCreatingAOI());
    } catch (error) {
      console.error('Failed to create AOI:', error);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && name.trim() && coordinates && !isSubmitting) {
        e.preventDefault();
        handleSave();
      }
    };

    if (isCreatingAOI) {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [isCreatingAOI, name, coordinates, isSubmitting]);

  useEffect(() => {
    if (!isCreatingAOI) {
      resetForm();
    }
  }, [isCreatingAOI]);

  if (!isCreatingAOI) return null;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">New Location</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
              placeholder="Enter AOI name"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                placeholder="Add tags"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                ${(name.trim() && coordinates && !isSubmitting)
                  ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
              `}
              disabled={!name.trim() || !coordinates || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAOIPanel;