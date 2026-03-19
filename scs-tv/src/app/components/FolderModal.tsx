'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

type Folder = {
  id: string;
  name: string;
};

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string | null, folderName: string, temporaryMessage?: string) => void;
  selectedFolderId?: string | null;
  folderExpiry?: number | null;
}

export default function FolderModal({ isOpen, onClose, onSelectFolder, selectedFolderId, folderExpiry }: FolderModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [temporaryMessage, setTemporaryMessage] = useState('');
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null);

  // Update timer every second
  useEffect(() => {
    if (!folderExpiry) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const diff = folderExpiry - now;

      if (diff <= 0) {
        setTimeRemaining(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [folderExpiry]);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    
    // If a folder is already selected, load its message
    if (selectedFolderId) {
      const storedMessage = localStorage.getItem('temporaryMessage') || '';
      setTemporaryMessage(storedMessage);
      setPendingFolderId(selectedFolderId);
    } else {
      setTemporaryMessage('');
      setPendingFolderId(null);
    }
    
    fetch('/api/drive-folders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFolders(data);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch folders:', err);
        setError('Failed to load folders');
      })
      .finally(() => setLoading(false));
  }, [isOpen, selectedFolderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {pendingFolderId ? 'Update Message' : 'Select a Folder'}
          </h2>
          <button
            onClick={() => {
              onClose();
              setPendingFolderId(null);
              setTemporaryMessage('');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} width="24" />
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-6 mt-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Note:</span> When selecting a folder, it will display that folder for only 48 hours. After that, it will then default back to showing all pictures that are on the root "Photos" folder only.
          </p>
        </div>

        <div className="p-6 max-h-80 overflow-y-auto">
          {loading && (
            <p className="text-center text-gray-500">Loading folders...</p>
          )}
          
          {error && (
            <p className="text-center text-red-500">{error}</p>
          )}
          
          {!loading && !error && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onSelectFolder(null, 'All Pictures (except ones in folders)', '');
                  // Dispatch custom event to notify ThemeSwitcher
                  window.dispatchEvent(new CustomEvent('temporaryMessageChanged'));
                  onClose();
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-semibold border-2 ${
                  selectedFolderId === null
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-blue-50 text-gray-800 hover:bg-blue-100 border-blue-200'
                }`}
              >
                📁 All Pictures (except ones in folders)
                {selectedFolderId === null && timeRemaining && (
                  <div className="text-sm font-normal mt-1 opacity-90">Expires in: {timeRemaining}</div>
                )}
              </button>
              
              {folders.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No additional folders found</p>
              )}
              
              {folders.length > 0 && (
                <>
                  <div className="border-t border-gray-300 my-3"></div>
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setPendingFolderId(folder.id);
                        setTemporaryMessage('');
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedFolderId === folder.id
                          ? 'bg-emerald-600 text-white border-2 border-emerald-700'
                          : 'bg-emerald-50 text-gray-800 hover:bg-emerald-100'
                      }`}
                    >
                      {folder.name}
                      {selectedFolderId === folder.id && timeRemaining && (
                        <div className="text-sm font-normal mt-1 opacity-90">Expires in: {timeRemaining}</div>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {pendingFolderId !== null && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporary Message (optional)
              </label>
              <input
                type="text"
                value={temporaryMessage}
                onChange={(e) => setTemporaryMessage(e.target.value)}
                placeholder="e.g., 8th Grade Night, Homecoming, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">This message will display instead of "Shamrock Snapshots" while this folder is active.</p>
            </div>
            <button
              onClick={() => {
                onSelectFolder(pendingFolderId, 'Selected Folder', temporaryMessage);
                setPendingFolderId(null);
                setTemporaryMessage('');
                // Dispatch custom event to notify ThemeSwitcher
                window.dispatchEvent(new CustomEvent('temporaryMessageChanged'));
                onClose();
              }}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors mb-2"
            >
              Confirm
            </button>
            <button
              onClick={() => setPendingFolderId(null)}
              className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors mb-2"
            >
              Back
            </button>
            <button
              onClick={() => {
                onClose();
                setPendingFolderId(null);
                setTemporaryMessage('');
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Cancel Without Saving
            </button>
          </div>
        )}

        {selectedFolderId === null && pendingFolderId === null && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                setPendingFolderId(null);
                setTemporaryMessage('');
              }}
              className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
