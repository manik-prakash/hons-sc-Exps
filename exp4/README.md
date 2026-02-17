# Secure Web Application Demo

This project demonstrates three key security principles in a simple Node.js/Express web application:

1.  **Least Privilege**
2.  **Fail-Safe Defaults**
3.  **Defense-in-Depth**

## Features & Observations

### 1. Least Privilege (RBAC)
-   **Role-Based Access Control**: Users have assigned roles (`guest`, `customer`, `editor`, `admin`).
-   **Granular Permissions**:
    -   **Guest**: Can only access Public areas.
    -   **Customer**: Can access Dashboard.
    -   **Editor**: Can access Editor Workspace.
    -   **Admin**: Can access Admin Console.
-   **Implementation**: `middleware/auth.js` enforces role checks.

### 2. Fail-Safe Defaults
-   **Secure Defaults**: The application denies access by default unless explicitly allowed.
-   **Input Validation**: All user inputs (login, register) are validated using `Joi` (`middleware/validation.js`). Invalid input is rejected with a 400 error.
-   **Error Handling**: Centralized error handling prohibits leaking stack traces to the user (Fail-Safe), showing generic error messages instead.
-   **Secure Headers**: `Helmet` is used to set secure HTTP headers by default.

### 3. Defense-in-Depth
-   **Layered Security**:
    -   **Rate Limiting**: `express-rate-limit` prevents brute-force attacks.
    -   **Logging**: `morgan` logs all requests for audit trails.
    -   **Session Security**: `httpOnly` cookies prevent XSS attacks from stealing sessions.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Application**:
    ```bash
    node server.js
    ```

3.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Principles

1.  **Least Privilege**:
    -   Register unauthorized user and try to access `/admin`. You will be denied.
    -   Register as `admin` (select in registration form) and access `/admin`. Success.

2.  **Fail-Safe Defaults**:
    -   Try to register with a 2-character password. validation will fail.
    -   Try to access a non-existent route. You get a clean error page.

3.  **Defense-in-Depth**:
    -   Refresh the page > 100 times quickly. Rate limiter will block you.
    -   Check console logs to see request logging.
