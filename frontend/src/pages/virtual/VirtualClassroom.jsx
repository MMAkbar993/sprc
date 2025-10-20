import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Users,
  MessageCircle,
  Settings,
  Info,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const VirtualClassroom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jitsiContainer = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [error, setError] = useState('');

  // Course information based on classId
  const courseInfo = {
    '1': { name: 'Web Development', code: 'CS401', instructor: 'Dr. Sarah Smith' },
    '2': { name: 'Database Systems', code: 'CS402', instructor: 'Prof. John Johnson' },
    '3': { name: 'Software Engineering', code: 'CS403', instructor: 'Dr. Mike Brown' },
    'live': { name: 'Live Class', code: 'LIVE', instructor: 'Faculty' }
  };

  const currentCourse = courseInfo[classId] || courseInfo['live'];
  const roomName = `SPRC_${currentCourse.code}_${classId}`;
  const displayName = user?.name || 'Guest User';

  useEffect(() => {
    let api = null;

    // Load Jitsi Meet External API
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.JitsiMeetExternalAPI) {
          console.log('Jitsi API already loaded');
          resolve();
          return;
        }

        // Remove any existing script
        const existingScript = document.querySelector('script[src*="external_api.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
          console.log('Jitsi API loaded successfully');
          resolve();
        };
        script.onerror = (error) => {
          console.error('Failed to load Jitsi API:', error);
          reject(error);
        };
        document.body.appendChild(script);
      });
    };

    // Initialize Jitsi Meet
    const initializeJitsi = async () => {
      try {
        console.log('Starting Jitsi initialization...');
        await loadJitsiScript();
        
        // Wait a bit for the API to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!window.JitsiMeetExternalAPI) {
          throw new Error('JitsiMeetExternalAPI not available');
        }

        if (!jitsiContainer.current) {
          throw new Error('Container not ready');
        }

        console.log('Creating Jitsi meeting...');
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainer.current,
          userInfo: {
            displayName: displayName,
            email: user?.email || ''
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            subject: `${currentCourse.name} (${currentCourse.code})`
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false
          }
        };

        console.log('Options:', options);
        api = new window.JitsiMeetExternalAPI(domain, options);
        
        // Event listeners
        api.addEventListener('videoConferenceJoined', (event) => {
          console.log('✅ User joined the conference');
          setIsLoading(false);
          setIsMeetingActive(true);
          setTimeout(() => setShowInfo(false), 5000);
        });

        api.addEventListener('participantJoined', (event) => {
          console.log('👤 Participant joined');
          api.getNumberOfParticipants().then(count => {
            setParticipantCount(count);
          }).catch(err => console.log('Error getting participant count:', err));
        });

        api.addEventListener('participantLeft', (event) => {
          console.log('👤 Participant left');
          api.getNumberOfParticipants().then(count => {
            setParticipantCount(Math.max(1, count));
          }).catch(err => console.log('Error getting participant count:', err));
        });

        api.addEventListener('readyToClose', () => {
          console.log('🔴 Conference ended');
          navigate(-1);
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('🚪 User left the conference');
          navigate(-1);
        });

        setJitsiApi(api);
        console.log('✅ Jitsi initialized successfully');

      } catch (error) {
        console.error('❌ Failed to load Jitsi Meet:', error);
        setError('Failed to load video conferencing. Please refresh the page.');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      initializeJitsi();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (api) {
        try {
          api.dispose();
          console.log('Jitsi API disposed');
        } catch (err) {
          console.log('Error disposing Jitsi:', err);
        }
      }
    };
  }, []);

  const handleLeave = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-strong border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeave}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110"
              title="Leave Classroom"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {currentCourse.name} <span className="text-primary-600">({currentCourse.code})</span>
              </h1>
              <p className="text-sm text-gray-600">
                Instructor: {currentCourse.instructor} • {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
              title="Class Info"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              onClick={handleLeave}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              <span>Leave Class</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {showInfo && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 animate-slide-down">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5" />
              <p className="text-sm">
                Welcome to <strong>{currentCourse.name}</strong> virtual classroom. Please wait for the instructor to start the session.
              </p>
            </div>
              <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
              </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">Connecting to classroom...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we set up your video conference</p>
            <p className="text-gray-500 text-xs mt-4">This may take a few seconds...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
          <div className="max-w-md bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Retry
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Meet Container */}
      <div className="flex-1 relative">
        <div 
          ref={jitsiContainer} 
          className="absolute inset-0"
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Instructions Overlay (shows briefly on load) */}
      {isLoading && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-strong p-6 max-w-md z-50 animate-bounce-slow">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Quick Tips
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Allow camera and microphone access when prompted</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Use the toolbar at the bottom to control audio/video</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Click the chat icon to send messages</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>Raise your hand to ask questions</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VirtualClassroom;

