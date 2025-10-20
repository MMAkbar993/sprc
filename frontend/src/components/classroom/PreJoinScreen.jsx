import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PreJoinScreen = ({ onJoin, courseName, courseCode }) => {
  const [displayName, setDisplayName] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    // Get user media for preview
    const getMediaStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Could not access camera/microphone. Please check permissions.');
      }
    };

    getMediaStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOn;
      }
    }
  }, [isVideoOn, stream]);

  useEffect(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isAudioOn;
      }
    }
  }, [isAudioOn, stream]);

  const handleJoin = () => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onJoin(displayName, isVideoOn, isAudioOn);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold text-white mb-2">
            Join <span className="text-primary-400">{courseName}</span>
          </h1>
          <p className="text-gray-400">Course Code: {courseCode}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="bg-gray-800 rounded-2xl shadow-card overflow-hidden animate-scale-in">
            <div className="relative aspect-video bg-gray-900">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <VideoOff className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <button
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isAudioOn 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={isAudioOn ? 'Mute' : 'Unmute'}
                >
                  {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isVideoOn 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>

                <button
                  className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all duration-300"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Join Form */}
          <div className="bg-gray-800 rounded-2xl shadow-card p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Ready to join?</h2>
            
            {error && (
              <div className="mb-4 flex items-center space-x-2 text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mic className="h-5 w-5 text-gray-300" />
                    <span className="text-sm text-gray-300">Microphone</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isAudioOn 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {isAudioOn ? 'On' : 'Off'}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-gray-300" />
                    <span className="text-sm text-gray-300">Camera</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isVideoOn 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {isVideoOn ? 'On' : 'Off'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoin}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-105 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-6 w-6" />
                <span>Join Classroom</span>
              </button>

              <p className="text-xs text-gray-400 text-center">
                By joining, you agree to follow classroom guidelines and etiquette
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <Video className="h-8 w-8 text-primary-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-medium">HD Video</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <Mic className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-medium">Clear Audio</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <MessageCircle className="h-8 w-8 text-accent-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-medium">Live Chat</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <Settings className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-medium">Screen Share</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default PreJoinScreen;

