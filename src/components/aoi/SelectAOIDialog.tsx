import React from 'react';
import { AlertTriangle, Navigation } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setActiveTab } from '../../store/slices/uiSlice';

interface SelectAOIDialogProps {
  onClose: () => void;
}

const SelectAOIDialog: React.FC<SelectAOIDialogProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();

  const handleGoToHome = () => {
    dispatch(setActiveTab('home'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">No Location Selected</h3>
            <p className="mt-2 text-sm text-gray-600">
              You need to select a location. 
              Please go to the Home tab and select an existing location or create a new one.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToHome}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center space-x-2"
              >
                <Navigation className="h-4 w-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectAOIDialog;