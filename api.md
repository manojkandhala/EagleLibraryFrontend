# Eagle Library API Documentation

## Base Configuration
```
Base URL: http://localhost:8000
Authentication: Bearer token
Date Format: ISO 8601 UTC
Rate Limits: 
- General: 100 requests/minute
- Admin: 300 requests/minute
```

## Public Endpoints

### Authentication

1. Login
```http
POST /token
Content-Type: application/x-www-form-urlencoded

Purpose: Authenticate user and get access tokens
Usage: Initial login to system

Request:
- username: string (email or username)
- password: string

Response:
{
  "access_token": string,    // 30 minute lifetime
  "refresh_token": string,   // 7 day lifetime
  "token_type": "bearer",
  "user_id": integer,
  "username": string,
  "email": string,
  "role": "admin" | "user"
}

Errors:
- 401: Invalid credentials
- 422: Invalid input format
```

2. Refresh Token
```http
POST /token/refresh
Content-Type: application/json

Purpose: Get new access token using refresh token
Usage: Maintain session without re-login

Request:
{
  "refresh_token": string
}

Response: Same as login endpoint
```

3. Logout
```http
POST /logout
Authorization: Bearer <token>

Purpose: End user session
Usage: User logout, cleanup

Response:
{
  "message": "Successfully logged out"
}
```

## Regular User Endpoints

### Profile Management

1. Get Own Profile
```http
GET /users/me
Authorization: Bearer <token>

Purpose: Retrieve current user's profile information
Usage: Display user details, verify permissions

Response:
{
  "id": integer,
  "email": string,
  "username": string,
  "role": string,
  "is_active": boolean,
  "created_at": string
}
```

2. Change Password
```http
POST /users/change-password
Authorization: Bearer <token>

Purpose: Update user's password
Usage: Security maintenance

Request:
{
  "current_password": string,
  "new_password": string
}

Response:
{
  "message": "Password changed successfully"
}

Errors:
- 400: Invalid current password
- 422: Password requirements not met
```

3. Get Personal Statistics
```http
GET /users/my-stats
Authorization: Bearer <token>

Purpose: Get user's processing statistics
Usage: Track personal performance

Response:
{
  "total_processed": integer,
  "in_progress": integer,
  "completed": integer,
  "user": UserObject
}
```

### Image Processing

1. List Available Images
```http
GET /users/available-images
Authorization: Bearer <token>

Purpose: View images available for processing
Usage: Select images to process
Note: Shows only unprocessed and unassigned images

Query Parameters:
- page: integer (≥1)           // Page number
- page_size: integer (1-100)   // Items per page
- search_term: string          // Search title/artist/tags
- museum: string              // Filter by museum
- orientation: string         // horizontal/vertical/other
- sort_by: string            // created_at/title/artist
- sort_order: string         // asc/desc

Response:
{
  "total_images": integer,
  "current_page": integer,
  "total_pages": integer,
  "page_size": integer,
  "has_next": boolean,
  "has_previous": boolean,
  "items": Array<ImageObject>
}

Errors:
- 400: Invalid parameters
- 401: Unauthorized
```

2. View Processing Queue
```http
GET /images/my-processing
Authorization: Bearer <token>

Purpose: View currently assigned images
Usage: Monitor active processing tasks
Note: Limited to 5 concurrent images

Query Parameters:
- page: integer (≥1)
- page_size: integer (1-100)

Response:
{
  "total": integer,           // Total assigned images
  "items": Array<ImageObject> // Currently processing images
}
```

3. Start Processing Image
```http
POST /images/{image_id}/process-request
Authorization: Bearer <token>

Purpose: Claim an image for processing
Usage: Begin processing workflow
Note: Fails if user has 5 active images

URL Parameters:
- image_id: integer (Image to process)

Response: 
{
  "message": string,
  "image": ImageObject
}

Errors:
- 400: Processing limit reached
- 404: Image not found
- 409: Image already being processed
```

4. Upload Processed Image
```http
POST /images/{image_id}/upload-processed
Authorization: Bearer <token>
Content-Type: multipart/form-data

Purpose: Submit processed image
Usage: Complete processing workflow
Note: Automatically generates thumbnails

URL Parameters:
- image_id: integer

Form Data:
- file: File (JPEG/PNG/WebP, max 10MB)

Response: ImageObject with new URLs

Errors:
- 400: Invalid file format/size
- 404: Image not found
- 409: Image not in processing state
```

## Admin Endpoints

### User Management

1. List Users
```http
GET /admin/users
Authorization: Bearer <token>

Purpose: View all system users
Usage: User management dashboard

Query Parameters:
- skip: integer     // Pagination offset
- limit: integer    // Items per page (1-100)
- active: boolean   // Filter by status

Response:
{
  "items": Array<UserObject>,
  "total": integer
}
```

2. Create User
```http
POST /admin/users
Authorization: Bearer <token>

Body:
{
  "email": string (valid email),
  "username": string,
  "temp_password": string,
  "role": "user" | "admin"
}

Response: UserObject
```

3. User Status Management
```http
PUT /admin/users/{user_id}/activate
PUT /admin/users/{user_id}/deactivate
DELETE /admin/users/{user_id}
GET /admin/users/{user_id}/stats

URL Parameters:
- user_id: integer

Response:
- Activate/Deactivate: UserObject
- Delete: {"message": "User deleted"}
- Stats: UserStatsObject
```

### Image Management

1. List All Images
```http
GET /images
Authorization: Bearer <token>

Query Parameters: Same as /users/available-images
Response: Same as /users/available-images
```

2. Update Image
```http
PUT /images/{image_id}
Authorization: Bearer <token>
Content-Type: application/json

Purpose: Modify image metadata and status
Usage: Image management, assignment control
Note: Can reassign processors and update status

URL Parameters:
- image_id: integer (required)

Request Body Schema:
{
  "title": string (optional),
  "artist": string (optional),
  "museum": string (optional),
  "tags": array[string] (optional),     // Array of string tags
  "orientation": string (optional),      // Must be "horizontal", "vertical", or "other"
  "is_processing": boolean (optional),
  "processor_id": integer (optional)     // ID of user to assign processing
}

Example Request:
{
  "artist": "Vincent van Gogh",
  "title": "The Starry Night",
  "tags": ["post-impressionism", "night", "stars"],
  "museum": "MoMA"
}

Response: 200 OK
{
  "id": integer,
  "title": string,
  "artist": string,
  "museum": string,
  "tags": array[string],
  "orientation": string,
  "created_at": string (ISO 8601),
  "updated_at": string (ISO 8601),
  "is_processing": boolean,
  "processor_id": integer | null,
  "urls": {
    "original": string,
    "processed": string | null,
    "thumbnails": {
      "small": string,
      "medium": string,
      "large": string,
      "xlarge": string
    }
  }
}

Errors:
- 401: {"detail": "Could not validate credentials"}
- 403: {"detail": "User does not have admin privileges"}
- 404: {"detail": "Image not found"}
- 422: {
    "detail": [{
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "validation_error"
    }]
  }
```

Important Notes for AI Agents:
1. All request body fields are optional - only include fields you want to update
2. Tags must be provided as an array of strings, not comma-separated string
3. Orientation must be one of: "horizontal", "vertical", "other"
4. The response includes the complete updated image object with all fields
5. URLs in the response are pre-signed S3 URLs valid for 1 hour
6. Request must include valid admin Bearer token in Authorization header
7. Content-Type must be application/json

## Admin-Only Image Endpoints

### Global Image Management

1. List All Images (Admin Only)
```http
GET /images
Authorization: Bearer <token>

Purpose: View complete image catalog
Usage: Admin dashboard, system monitoring
Note: Shows all images regardless of status

Query Parameters:
- page: integer (≥1)
- page_size: integer (1-100)
- search_term: string (optional, search in title/artist/tags)
- museum: string (optional)
- orientation: "horizontal" | "vertical" | "other"
- sort_by: "created_at" | "title" | "artist"
- sort_order: "asc" | "desc"

Response:
{
  "total_images": integer,
  "current_page": integer,
  "total_pages": integer,
  "page_size": integer,
  "has_next": boolean,
  "has_previous": boolean,
  "items": Array<ImageObject>
}

Errors:
- 401: Unauthorized
- 403: Not admin user
```

2. Get Single Image Details (Admin Only)
```http
GET /images/{image_id}
Authorization: Bearer <token>

Purpose: View complete image metadata
Usage: Admin image inspection
Note: Includes all image details and processing history

URL Parameters:
- image_id: integer

Response: SingleImageResponse
{
  ...ImageObject,
  processing_history: Array<{
    user_id: integer,
    status: string,
    started_at: string,
    completed_at: string
  }>
}

Errors:
- 404: Image not found
- 403: Not admin user
```

3. Delete Image (Admin Only)
```http
DELETE /images/{image_id}
Authorization: Bearer <token>

Purpose: Remove image and associated files
Usage: Content management, cleanup
Note: Deletes original, processed, and all thumbnails

URL Parameters:
- image_id: integer

Response:
{
  "message": "Image successfully deleted"
}

Errors:
- 404: Image not found
- 403: Not admin user
- 500: S3 deletion error
```

5. System Overview (Admin Only)
```http
GET /admin/processing-overview
Authorization: Bearer <token>

Purpose: Get system-wide processing statistics
Usage: Monitor system performance and user activity

Response:
{
  "total_images": integer,
  "total_processing": integer,
  "total_completed": integer,
  "user_stats": [{
    "user_id": integer,
    "username": string,
    "total_processed": integer,
    "in_progress": integer
  }],
  "recent_activities": [{
    "image_id": integer,
    "user_id": integer,
    "action": string,
    "timestamp": string
  }]
}

Errors:
- 403: Not admin user
```

## Response Objects

### ImageObject
```typescript
{
  id: integer
  title: string
  artist: string
  museum?: string
  tags: string[]
  orientation: "horizontal" | "vertical" | "other"
  created_at: string  // ISO 8601
  updated_at: string  // ISO 8601
  is_processing: boolean
  processor_id?: integer
  urls: {
    original: string
    processed?: string
    thumbnails: {
      small: string   // 300px
      medium: string  // 500px
      large: string   // 800px
      xlarge: string  // 1280px
    }
  }
}
```

### UserObject
```typescript
{
  id: integer
  email: string
  username: string
  role: "admin" | "user"
  is_active: boolean
  created_at: string  // ISO 8601
}
```

### UserStatsObject
```typescript
{
  total_processed: integer
  in_progress: integer
  completed: integer
  user: UserObject
}
```

## Error Responses

1. Authentication Error (401)
```json
{
  "detail": "Could not validate credentials"
}
```

2. Permission Error (403)
```json
{
  "detail": "Only admin users can perform this action"
}
```

3. Not Found Error (404)
```json
{
  "detail": "Resource not found"
}
```

4. Validation Error (422)
```json
{
  "detail": [{
    "loc": ["body", "field_name"],
    "msg": "Error message",
    "type": "error_type"
  }]
}
```

## Limitations

1. Rate Limits:
   - Login: 5 attempts/minute
   - API calls: 100 requests/minute
   - Admin endpoints: 300 requests/minute

2. File Upload:
   - Maximum size: 10MB
   - Formats: JPEG, PNG, WebP
   - Auto-conversion to WebP for processed images

3. Processing:
   - Maximum 5 concurrent images per user
   - Thumbnails generated automatically
   - URLs expire after 1 hour
