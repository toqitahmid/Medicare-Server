# Medicare - Backend Architecture & Documentation

## 🏗 Overview
The Medicare Backend is a robust RESTful API built with Node.js and Express.js, serving as the core engine for the Medicare healthcare platform[cite: 2]. It is designed with a clear separation of concerns, utilizing modular routing, controllers, and middleware to handle business logic securely and efficiently[cite: 2]. 

## 🌟 Key Features
*   **Role-Based Access Control (RBAC):** Dedicated authorization middleware (`auth.middleware.js`, `role.middleware.js`) to secure endpoints for Admins, Doctors, and Patients[cite: 2].
*   **Centralized Error Handling:** Standardized API responses and error management using `apiError.js`, `apiResponse.js`, and `asyncHandler.js` utilities[cite: 2].
*   **Comprehensive Appointment Flow:** Endpoints managing the complete lifecycle of appointments from booking to prescription issuance and final review[cite: 2].
*   **Payment Processing:** Dedicated payment controllers and routes to handle transaction statuses and checkout validation[cite: 2].
*   **Role-Specific Dashboards:** Distinct overview controllers (`adminOverview.controller.js`, `doctorOverview.controller.js`) to aggregate statistical data tailored for the frontend dashboards[cite: 2].

## 🗄 Database Architecture (MongoDB)
The backend uses MongoDB (configured for a database named `medicare`[cite: 2]) to persist data. The conceptual schemas driving the controllers are structured as follows:

### 1. User Schema
*   **Fields:** `name`, `email`, `password` (hashed), `role` (ADMIN, DOCTOR, PATIENT), `profileImage`, `isVerified`.
*   **Purpose:** Handles authentication and core identity.

### 2. Doctor Schema
*   **Fields:** `userId` (Ref: User), `specialization`, `experienceYears`, `consultationFee`, `availability`, `averageRating`.
*   **Purpose:** Stores professional credentials and schedule configurations[cite: 2].

### 3. Patient Schema
*   **Fields:** `userId` (Ref: User), `age`, `gender`, `bloodGroup`, `medicalHistory`.
*   **Purpose:** Manages patient demographics and health records[cite: 2].

### 4. Appointment Schema
*   **Fields:** `patientId` (Ref: Patient), `doctorId` (Ref: Doctor), `appointmentDate`, `timeSlot`, `status`, `paymentStatus`, `fee`.
*   **Purpose:** The central transactional record linking users[cite: 2].

### 5. Prescription Schema
*   **Fields:** `appointmentId` (Ref: Appointment), `doctorId`, `patientId`, `diagnosis`, `medicines` (Array), `advice`.
*   **Purpose:** Digitized medical prescriptions and treatment notes[cite: 2].

### 6. Review Schema
*   **Fields:** `doctorId`, `patientId`, `rating`, `comment`.
*   **Purpose:** Captures patient feedback and ratings[cite: 2].

### 7. Payment Schema
*   **Fields:** `appointmentId`, `transactionId`, `amount`, `status`.
*   **Purpose:** Logs payment attempts and successful transactions[cite: 2].

## 📂 Project Structure
The repository strictly adheres to scalable MERN stack directory conventions, separating configuration, routing, and business logic[cite: 2].

*   **`src/app.js` & `src/index.js`**: Application bootstrap, middleware configuration, and server initialization[cite: 2].
*   **`src/constants.js`**: Global configurations, including the export of `DB_NAME = "medicare"`[cite: 2].
*   **`src/db/`**: Database connection logic isolated in `indexDB.js`[cite: 2].
*   **`src/middlewares/`**:
    *   `auth.middleware.js`: Verifies JWT tokens and attaches the user payload to the request[cite: 2].
    *   `role.middleware.js`: Restricts endpoint access based on assigned user roles[cite: 2].
*   **`src/routes/`**: API endpoint definitions routing to their respective controllers[cite: 2].
    *   Entity Routes: `user.route.js`, `doctor.route.js`, `patient.route.js`[cite: 2].
    *   Action Routes: `appointment.route.js`, `prescription.route.js`, `payment.route.js`, `review.route.js`[cite: 2].
    *   Dashboard Routes: `adminOverview.route.js`, `doctorOverview.route.js`[cite: 2].
*   **`src/controllers/`**: Contains the core business logic and database interactions corresponding to each route (e.g., `appointment.controller.js`, `user.controller.js`)[cite: 2].
*   **`src/utils/`**: Standardized helper classes and wrappers (`apiError.js`, `apiResponse.js`, `asyncHandler.js`) to keep controllers thin and HTTP responses predictable[cite: 2].

## 🚀 How to Run Locally

1.  **Clone the Repository:**
    ```bash
    git clone <your-backend-repo-url>
    cd medicare-server
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Create a `.env` file in the root directory (alongside `package.json`[cite: 2]) and configure your environment variables:
    ```env
    PORT=8000
    MONGODB_URI=mongodb://localhost:27017
    JWT_SECRET=your_jwt_secret_here
    STRIPE_SECRET_KEY=sk_test_your_key_here
    ```
4.  **Run the Server:**
    ```bash
    npm run dev
    ```
5.  **Verify:**
    The server should now be running locally, typically accessible at `http://localhost:5000`.
