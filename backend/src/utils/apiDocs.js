export const apiDocumentation = {
  openapi: "3.0.0",
  info: {
    title: "Spotify Clone API",
    version: "1.0.0",
    description:
      "Full-featured music streaming API with authentication, playlists, and analytics",
    contact: {
      name: "API Support",
      email: "support@spotify-clone.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Songs", description: "Song management" },
    { name: "Albums", description: "Album management" },
    { name: "Playlists", description: "Playlist operations" },
    { name: "History", description: "Listening history tracking" },
    { name: "Recommendations", description: "Personalized recommendations" },
    { name: "Social", description: "Following and social features" },
    { name: "Artist", description: "Artist dashboard" },
    { name: "Admin", description: "Admin operations" },
    { name: "Export", description: "Data export" },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "username"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  username: { type: "string", minLength: 3 },
                  role: {
                    type: "string",
                    enum: ["user", "artist"],
                    default: "user",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User created successfully" },
          400: { description: "Validation error" },
          409: { description: "User already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful, returns JWT token" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/songs": {
      get: {
        tags: ["Songs"],
        summary: "Get all songs with pagination",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 50 },
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["created_at", "title", "plays"],
              default: "created_at",
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["ASC", "DESC"], default: "DESC" },
          },
          { name: "genre", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of songs with pagination info" },
        },
      },
      post: {
        tags: ["Songs"],
        summary: "Upload new song (Artist/Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "duration", "file_url"],
                properties: {
                  title: { type: "string" },
                  duration: { type: "integer", minimum: 1 },
                  file_url: { type: "string", format: "uri" },
                  cover_url: { type: "string", format: "uri" },
                  genre: { type: "string" },
                  album_id: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Song created" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Not an artist" },
        },
      },
    },
    "/recommendations": {
      get: {
        tags: ["Recommendations"],
        summary: "Get personalized recommendations",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "List of recommended songs" },
        },
      },
    },
    "/recommendations/trending": {
      get: {
        tags: ["Recommendations"],
        summary: "Get trending songs (last 7 days)",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
        ],
        responses: {
          200: { description: "List of trending songs" },
        },
      },
    },
    "/history/stats": {
      get: {
        tags: ["History"],
        summary: "Get listening statistics",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "period",
            in: "query",
            schema: { type: "integer", default: 30 },
            description: "Period in days",
          },
        ],
        responses: {
          200: {
            description: "Listening statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total_plays: { type: "integer" },
                    total_minutes: { type: "integer" },
                    unique_songs: { type: "integer" },
                    unique_artists: { type: "integer" },
                    top_genre: { type: "string" },
                    period_days: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/export/user-data": {
      get: {
        tags: ["Export"],
        summary: "Export all user data (GDPR)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Complete user data export" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Song: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          artist_name: { type: "string" },
          duration: { type: "integer" },
          plays: { type: "integer" },
          genre: { type: "string" },
          cover_url: { type: "string" },
          file_url: { type: "string" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
};

// Generate HTML documentation
export const generateDocsHTML = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spotify Clone API Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .endpoint {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .method {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      margin-right: 10px;
    }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    .put { background: #fca130; color: white; }
    .delete { background: #f93e3e; color: white; }
    .path { font-family: monospace; font-size: 16px; }
    .section { margin-top: 40px; }
    .tag { 
      background: #e0e0e0; 
      padding: 2px 8px; 
      border-radius: 3px; 
      font-size: 12px;
      margin-right: 5px;
    }
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎵 Spotify Clone API</h1>
    <p>Version 1.0.0 | Full-featured music streaming API</p>
  </div>

  <div class="section">
    <h2>🚀 Quick Start</h2>
    <p><strong>Base URL:</strong> <code>http://localhost:5000/api</code></p>
    <p><strong>Authentication:</strong> Bearer Token (JWT)</p>
    <p><strong>Content-Type:</strong> application/json</p>
  </div>

  <div class="section">
    <h2>📚 Endpoint Categories</h2>
    ${Object.values(apiDocumentation.tags)
      .map((tag) => `<span class="tag">${tag.name}</span>`)
      .join("")}
  </div>

  <div class="section">
    <h2>🔑 Key Features</h2>
    <ul>
      <li>✅ JWT Authentication with role-based access</li>
      <li>✅ Pagination & Filtering on all list endpoints</li>
      <li>✅ Rate Limiting (Auth: 5/15min, Upload: 10/hour)</li>
      <li>✅ GDPR-compliant data export</li>
      <li>✅ Real-time analytics tracking</li>
      <li>✅ Personalized recommendations</li>
    </ul>
  </div>

  <div class="section">
    <h2>📖 Example Endpoints</h2>
    
    <div class="endpoint">
      <span class="method post">POST</span>
      <span class="path">/auth/register</span>
      <p>Register a new user account</p>
      <pre><code>{
  "email": "user@example.com",
  "password": "securepass123",
  "username": "musiclover",
  "role": "user"
}</code></pre>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span>
      <span class="path">/songs?page=1&limit=20&genre=Pop&sort=plays</span>
      <p>Get paginated songs with filters</p>
    </div>

    <div class="endpoint">
      <span class="method post">POST</span>
      <span class="path">/history/:songId</span>
      <span class="tag">Auth Required</span>
      <p>Track a song play</p>
      <pre><code>{
  "duration_played": 180,
  "completed": true
}</code></pre>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span>
      <span class="path">/history/stats?period=30</span>
      <span class="tag">Auth Required</span>
      <p>Get listening statistics for last 30 days</p>
    </div>
  </div>

  <div class="section">
    <h2>⚡ Rate Limits</h2>
    <ul>
      <li><strong>Auth endpoints:</strong> 5 requests per 15 minutes</li>
      <li><strong>Upload endpoints:</strong> 10 requests per hour</li>
      <li><strong>General API:</strong> 100 requests per 15 minutes</li>
    </ul>
  </div>

  <div class="section">
    <h2>📊 Response Codes</h2>
    <ul>
      <li><code>200</code> - Success</li>
      <li><code>201</code> - Created</li>
      <li><code>400</code> - Bad Request (validation error)</li>
      <li><code>401</code> - Unauthorized (invalid/missing token)</li>
      <li><code>403</code> - Forbidden (insufficient permissions)</li>
      <li><code>404</code> - Not Found</li>
      <li><code>409</code> - Conflict (duplicate resource)</li>
      <li><code>429</code> - Too Many Requests (rate limit)</li>
      <li><code>500</code> - Internal Server Error</li>
    </ul>
  </div>
</body>
</html>
  `;
};
