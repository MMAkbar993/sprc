import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

/**
 * Example component showing how to use the ImageUpload component
 * You can integrate this into your profile pages or any other component
 */
const ImageUploadExample = () => {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [courseImageUrl, setCourseImageUrl] = useState(null);

  const handleProfileUploadSuccess = (uploadData) => {
    console.log('Profile image uploaded:', uploadData);
    // Update user profile with the image URL
    setProfileImageUrl(`http://localhost:5000${uploadData.url}`);
    
    // You can also make an API call to update the user's profile
    // updateUserProfile({ profileImage: uploadData.url });
  };

  const handleCourseUploadSuccess = (uploadData) => {
    console.log('Course image uploaded:', uploadData);
    setCourseImageUrl(`http://localhost:5000${uploadData.url}`);
    
    // Update course with the image URL
    // updateCourse({ courseImage: uploadData.url });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Upload Examples</h1>

      <div className="space-y-8">
        {/* Profile Image Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Image Upload</h2>
          <ImageUpload
            uploadType="profile"
            label="Profile Picture"
            acceptedTypes="image/*"
            maxSize={5}
            currentImage={profileImageUrl}
            onUploadSuccess={handleProfileUploadSuccess}
          />
          {profileImageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Current Profile Image URL:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block mt-1">
                {profileImageUrl}
              </code>
            </div>
          )}
        </div>

        {/* Course Image Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Image Upload</h2>
          <ImageUpload
            uploadType="course"
            label="Course Cover Image"
            acceptedTypes="image/*"
            maxSize={5}
            currentImage={courseImageUrl}
            onUploadSuccess={handleCourseUploadSuccess}
          />
          {courseImageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Current Course Image URL:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block mt-1">
                {courseImageUrl}
              </code>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">How to Use</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Import the ImageUpload component:</p>
            <code className="block bg-white p-2 rounded">
              import ImageUpload from './components/shared/ImageUpload';
            </code>

            <p className="mt-3">2. Use it in your component:</p>
            <pre className="block bg-white p-2 rounded overflow-x-auto">
{`<ImageUpload
  uploadType="profile"
  label="Upload Profile Picture"
  acceptedTypes="image/*"
  maxSize={5}
  currentImage={currentImageUrl}
  onUploadSuccess={(data) => {
    console.log('Uploaded:', data);
    // Handle the upload success
  }}
/>`}
            </pre>

            <p className="mt-3">3. Available upload types:</p>
            <ul className="list-disc list-inside ml-4">
              <li><code>profile</code> - For profile pictures</li>
              <li><code>course</code> - For course images</li>
              <li><code>document</code> - For documents and files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadExample;

