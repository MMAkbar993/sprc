# Image Upload System - Setup Complete ✅

## 📁 Folder Structure Created

```
backend/
├── uploads/
│   ├── images/
│   │   ├── profiles/        # User profile pictures
│   │   ├── courses/         # Course images
│   │   ├── documents/       # General documents
│   │   └── announcements/   # Announcement images
│   ├── .gitignore          # Prevents uploaded files from being tracked
│   └── README.md           # Upload documentation
├── config/
│   └── upload.js           # Multer configuration for file uploads
└── routes/
    └── upload.js           # Upload API endpoints

frontend/
└── src/
    └── components/
        └── shared/
            ├── ImageUpload.jsx         # Reusable upload component
            └── ImageUploadExample.jsx  # Usage examples
```

## 🚀 Features Implemented

### Backend
1. ✅ Created organized folder structure for images
2. ✅ Configured Multer for file uploads
3. ✅ Added upload routes with authentication
4. ✅ Set up static file serving
5. ✅ Added file validation (type, size)
6. ✅ Automatic file naming to prevent conflicts

### Frontend
1. ✅ Created reusable ImageUpload component
2. ✅ Added image preview functionality
3. ✅ Loading states and error handling
4. ✅ Responsive design with Tailwind CSS

## 📝 API Endpoints

### 1. Upload Profile Image
- **Endpoint:** `POST /api/upload/profile`
- **Auth:** Required (Bearer Token)
- **Field Name:** `profile`
- **File Types:** Images only (jpg, png, gif)
- **Max Size:** 5MB
- **Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "filename": "profile-1234567890-123456789.jpg",
    "url": "/uploads/images/profiles/profile-1234567890-123456789.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

### 2. Upload Course Image
- **Endpoint:** `POST /api/upload/course`
- **Auth:** Required (Bearer Token)
- **Field Name:** `course`
- **File Types:** Images only
- **Max Size:** 5MB

### 3. Upload Document
- **Endpoint:** `POST /api/upload/document`
- **Auth:** Required (Bearer Token)
- **Field Name:** `document`
- **File Types:** Images, PDF, DOC, DOCX, TXT
- **Max Size:** 10MB

### 4. Upload Multiple Images
- **Endpoint:** `POST /api/upload/multiple`
- **Auth:** Required (Bearer Token)
- **Field Name:** `images` (array)
- **Max Count:** 5 images
- **Max Size:** 5MB per image

## 💻 Frontend Usage

### Basic Usage
```jsx
import ImageUpload from './components/shared/ImageUpload';

function MyComponent() {
  const handleUploadSuccess = (data) => {
    console.log('Image uploaded:', data);
    // data.url contains the image path
    // Save this to your database or state
  };

  return (
    <ImageUpload
      uploadType="profile"
      label="Upload Profile Picture"
      acceptedTypes="image/*"
      maxSize={5}
      onUploadSuccess={handleUploadSuccess}
    />
  );
}
```

### Component Props
- `uploadType`: `'profile'`, `'course'`, or `'document'`
- `label`: Label text for the upload field
- `acceptedTypes`: File types to accept (default: `'image/*'`)
- `maxSize`: Maximum file size in MB (default: 5)
- `currentImage`: URL of current image (for preview)
- `onUploadSuccess`: Callback function when upload succeeds

## 🔧 Testing the Upload

### Using Postman
1. Create a new POST request to: `http://localhost:5000/api/upload/profile`
2. Set Authorization: `Bearer YOUR_TOKEN`
3. In Body, select `form-data`
4. Add key `profile` (type: File) and select an image
5. Send the request

### Using Frontend
1. Navigate to the component using ImageUpload
2. Click "Select Image"
3. Choose an image file
4. The image will automatically upload
5. Preview will appear when upload is complete

## 🔐 Security Features
- ✅ Authentication required for all uploads
- ✅ File type validation
- ✅ File size limits
- ✅ Unique filenames to prevent conflicts
- ✅ Organized folder structure

## 🌐 Accessing Uploaded Files
Uploaded files are accessible at:
```
http://localhost:5000/uploads/images/profiles/filename.jpg
http://localhost:5000/uploads/images/courses/filename.png
http://localhost:5000/uploads/images/documents/filename.pdf
```

## 🔄 Integration Steps

### 1. Update User Model (if needed)
Add an image field to your User model:
```javascript
profileImage: {
  type: String,
  default: null
}
```

### 2. Update Course Model (if needed)
Add an image field to your Course model:
```javascript
courseImage: {
  type: String,
  default: null
}
```

### 3. Update Profile Component
Integrate ImageUpload into your profile page:
```jsx
import ImageUpload from './components/shared/ImageUpload';

// In your profile component
<ImageUpload
  uploadType="profile"
  label="Profile Picture"
  currentImage={user?.profileImage}
  onUploadSuccess={(data) => {
    // Update user profile
    updateProfile({ profileImage: data.url });
  }}
/>
```

### 4. Update Course Form
Integrate ImageUpload into your course form:
```jsx
<ImageUpload
  uploadType="course"
  label="Course Cover Image"
  currentImage={course?.courseImage}
  onUploadSuccess={(data) => {
    setCourseData({ ...courseData, courseImage: data.url });
  }}
/>
```

## 📦 Dependencies
All required dependencies are already installed:
- `multer`: ^1.4.5-lts.1 (for file uploads)
- `express`: ^4.18.2 (web framework)

## 🎨 Styling
The ImageUpload component uses Tailwind CSS classes. Make sure Tailwind is properly configured in your project.

## 🐛 Troubleshooting

### Issue: "Failed to upload file"
- Check if backend server is running
- Verify authentication token is valid
- Check file size and type restrictions

### Issue: "Images not displaying"
- Verify the `/uploads` route is configured in server.js
- Check if the file path is correct
- Ensure static file serving is working

### Issue: "Folder not found"
- Run the backend server at least once
- The folders should already exist in `backend/uploads/images/`

## 📚 Additional Notes
- Uploaded files are NOT tracked in git (see `.gitignore`)
- File names are automatically sanitized
- Timestamps are added to prevent filename conflicts
- Original file extensions are preserved

## 🎉 Ready to Use!
Your image upload system is now fully configured and ready to use. Start integrating it into your components!

