# Attendance Tracking Application

This web-based application is designed for teachers to manage and track student attendance. It includes features for managing students, subjects, lecture sessions, and attendance records. The application also supports Progressive Web App (PWA) functionality, allowing it to work offline and be installed on various devices.

## Features

### Admin Authentication

- Login form for teachers (administrators) using a username and password.
- Access is restricted to authenticated users only.

### Student Management

- View a list of current students.
- Add new students.
- Update existing student contact information (e.g., phone number).
- Delete students; all associated data is automatically removed from the database (`ON DELETE CASCADE`).

### Course Management

- Add new subjects.
- Edit subject titles.
- Delete subjects when no longer needed.

### Session Management

- View all scheduled and past lessons.
- Create new lessons.
- Update session information.
- Delete sessions if required.

### Attendance Tracking

- View attendance records filtered by date.
- Mark attendance status for each student in a session.
- Save changes explicitly using a dedicated save button.

### Offline Functionality (PWA)

- Fully functional Progressive Web App.
- Can be installed on supported devices.
- Operates offline with locally cached data.
- Offline version behaves identically to the web version.

### Security

- Logout functionality included to ensure account security.
