# Permission Module

The Permission module provides a comprehensive system for managing permissions within the application. It allows for the creation, management, and assignment of permissions to roles, enabling fine-grained access control.

## Features

- CRUD operations for permissions
- Permission status management
- Role-permission assignment
- Paginated permission listing
- Unique slug-based permission identification

## API Endpoints

### List Permissions
```
GET /permissions
```
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Create Permission
```
POST /permissions
```
Request Body:
```json
{
    "name": "Permission Name",
    "description": "Permission Description"
}
```

### Get Permission
```
GET /permissions/{slug}
```

### Update Permission
```
PUT /permissions/{slug}
```
Request Body:
```json
{
    "name": "Updated Name",
    "description": "Updated Description"
}
```

### Delete Permission
```
DELETE /permissions/{slug}
```

### Toggle Permission Status
```
PATCH /permissions/{slug}/status
```

### Assign Permissions to Role
```
POST /permissions/assign
```
Request Body:
```json
{
    "role_id": 1,
    "permissions": [1, 2, 3]
}
```

## Database Schema

### Permissions Table
```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Role_Permissions Table
```sql
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);
```

## Error Handling

The module handles various error scenarios:
- 400 Bad Request: Invalid input data
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side errors

## Testing

Run the unit tests using:
```bash
npm test src/Modules/Permissions/Permission.test.js
```

## Dependencies

- Express.js
- PostgreSQL
- http-errors
- Jest (for testing)

## Usage Example

```javascript
// Create a new permission
const permission = await storeService({
    body: {
        name: "Manage Users",
        description: "Allows managing user accounts"
    }
}, res, next);

// Assign permissions to a role
await assignPermissionService({
    body: {
        role_id: 1,
        permissions: [1, 2, 3]
    }
}, res, next);
```

## Best Practices

1. Use meaningful permission names and descriptions
2. Keep permission slugs unique and URL-friendly
3. Regularly review and update permission assignments
4. Implement proper error handling in client applications
5. Use pagination for large permission lists
6. Maintain proper documentation of permission usage 