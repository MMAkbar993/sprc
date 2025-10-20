# Quick Start Guide - Image Upload System 🖼️

## ✅ What Was Created

### Backend Files
```
✅ backend/uploads/images/profiles/      - Profile pictures folder
✅ backend/uploads/images/courses/       - Course images folder
✅ backend/uploads/images/documents/     - Documents folder
✅ backend/uploads/images/announcements/ - Announcement images folder
✅ backend/config/upload.js              - Upload configuration
✅ backend/routes/upload.js              - Upload API routes
✅ backend/server.js                     - Updated with upload routes
```

### Frontend Files
```
✅ frontend/src/components/shared/ImageUpload.jsx        - Reusable upload component
✅ frontend/src/components/shared/ImageUploadExample.jsx - Usage examples
```

### Documentation
```
✅ IMAGE_UPLOAD_SETUP.md                 - Complete setup documentation
✅ backend/uploads/README.md             - Upload folder documentation
✅ backend/uploads/.gitignore            - Prevents tracking uploaded files
```

## 🚀 How to Use (3 Simple Steps)

### Step 1: Import the Component
```jsx
import ImageUpload from './components/shared/ImageUpload';
```

### Step 2: Add to Your Component
```jsx
<ImageUpload
  uploadType="profile"
  label="Upload Your Picture"
  onUploadSuccess={(data) => {
    console.log('Uploaded to:', data.url);
    // Use data.url to save to your database
  }}
/>
```

### Step 3: That's It! 🎉
The component handles:
- File selection
- Upload to server
- Preview
- Error handling
- Loading states

## 📸 Real-World Examples

### Example 1: User Profile Page
```jsx
import React, { useState } from 'react';
import ImageUpload from './components/shared/ImageUpload';

function ProfilePage() {
  const [user, setUser] = useState({ profileImage: null });

  const handleImageUpload = async (uploadData) => {
    // Update user profile in database
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        profileImage: uploadData.url
      })
    });
    
    if (response.ok) {
      setUser({ ...user, profileImage: uploadData.url });
    }
  };

  return (
    <div className="profile-page">
      <h2>Update Profile Picture</h2>
      <ImageUpload
        uploadType="profile"
        label="Profile Picture"
        currentImage={user.profileImage}
        onUploadSuccess={handleImageUpload}
      />
    </div>
  );
}
```

### Example 2: Create Course Form
```jsx
function CreateCourseForm() {
  const [courseData, setCourseData] = useState({
    name: '',
    description: '',
    courseImage: null
  });

  const handleCourseImageUpload = (uploadData) => {
    setCourseData({
      ...courseData,
      courseImage: uploadData.url
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // courseData.courseImage now contains the uploaded image URL
    await createCourse(courseData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Course Name"
        value={courseData.name}
        onChange={(e) => setCourseData({...courseData, name: e.target.value})}
      />
      
      <ImageUpload
        uploadType="course"
        label="Course Cover Image"
        onUploadSuccess={handleCourseImageUpload}
      />
      
      <button type="submit">Create Course</button>
    </form>
  );
}
```

## 🔌 API Endpoints Available

| Endpoint | Purpose | Field Name | Max Size |
|----------|---------|------------|----------|
| `/api/upload/profile` | Profile pictures | `profile` | 5MB |
| `/api/upload/course` | Course images | `course` | 5MB |
| `/api/upload/document` | Documents | `document` | 10MB |
| `/api/upload/multiple` | Multiple images | `images` | 5MB each |

## 🌐 How to Access Uploaded Images

After uploading, images are available at:
```
http://localhost:5000/uploads/images/profiles/[filename]
```

Use in your components:
```jsx
<img 
  src={`http://localhost:5000${user.profileImage}`} 
  alt="Profile" 
/>
```

Or in CSS:
```css
background-image: url('http://localhost:5000/uploads/images/courses/image.jpg');
```

## 🎯 Common Use Cases

### 1. Profile Picture Upload
```jsx
<ImageUpload uploadType="profile" label="Profile Picture" />
```

### 2. Course Cover Image
```jsx
<ImageUpload uploadType="course" label="Course Cover" />
```

### 3. Assignment Document
```jsx
<ImageUpload 
  uploadType="document" 
  label="Upload Assignment" 
  acceptedTypes="image/*,application/pdf"
  maxSize={10}
/>
```

## 🔒 Security
- ✅ All uploads require authentication
- ✅ File type validation
- ✅ File size limits
- ✅ Unique filenames prevent conflicts

## 📱 Mobile Friendly
The ImageUpload component is fully responsive and works on:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile devices

## 🎨 Customization
You can customize the component:
```jsx
<ImageUpload
  uploadType="profile"
  label="Your Custom Label"
  acceptedTypes="image/png,image/jpeg"  // Only PNG and JPEG
  maxSize={3}                            // 3MB limit
  currentImage="/path/to/current.jpg"    // Show existing image
  onUploadSuccess={(data) => {
    // Your custom handler
  }}
/>
```

## ❓ Need Help?
- Check `IMAGE_UPLOAD_SETUP.md` for detailed documentation
- See `frontend/src/components/shared/ImageUploadExample.jsx` for more examples
- Check `backend/uploads/README.md` for API details

## 🎉 You're All Set!
Your image upload system is ready to use. Just import the component and start uploading!

