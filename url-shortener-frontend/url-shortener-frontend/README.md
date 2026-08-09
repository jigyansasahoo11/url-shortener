# URL Shortener Frontend

This is the frontend application for the URL Shortener project. It allows users to shorten URLs and manage their links easily. The application is built using React and Vite.

## Project Structure

```
url-shortener-frontend
├── src
│   ├── App.jsx                # Main application component that sets up routing
│   ├── main.jsx               # Entry point of the application
│   ├── pages
│   │   └── ForgotPasswordPage.jsx  # Page for the "Forgot Password" feature
│   ├── components
│   │   └── PasswordResetForm.jsx   # Component for handling password reset form
│   └── styles
│       └── forgot-password.css      # CSS styles for the "Forgot Password" page
├── package.json               # Configuration file for npm
├── vite.config.js             # Configuration for Vite
└── README.md                  # Documentation for the project
```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/jigyansasahoo11/url-shortener.git
   cd url-shortener-frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Features

- User authentication with signup and login functionality.
- Password reset feature for users who forget their passwords.
- URL shortening and management capabilities.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.