
# 🚀 Md. Mamonor Rashid – Server

Welcome to the backend repository of **Md. Mamonor Rashid's Portfolio Website**.

This server handles backend operations, API requests, database management, user interactions, and other dynamic functionalities to support the portfolio website.

## ✨ Features

- 🌐 RESTful API Development
- 👤 User & Profile Management
- 📩 Contact Form Management
- 🔐 Secure Backend Operations
- 📧 Email Communication
- 🗄️ MongoDB Database Integration
- ⚡ Efficient Request Handling
- 🔒 Environment Variable Configuration
- 🚀 Deployment Ready

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript Runtime |
| Express.js | Backend Framework |
| MongoDB | Database |
| Firebase Admin SDK | Authentication & Administration |
| Nodemailer | Email Services |
| dotenv | Environment Configuration |
| CORS | Cross-Origin Resource Sharing |

## 📂 Project Structure

```text
Md-Mamonor-Rashid-Server/
│
├── index.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── node_modules/
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd Md-Mamonor-Rashid-Server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Add any additional Firebase and email credentials required by your application.

### 5. Run the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server URL:

```text
http://localhost:5000
```

## 🔗 API Documentation

The backend provides RESTful APIs for communication between the frontend and server.

Available endpoints depend on the implemented application features.

## 🌍 Deployment

The server can be deployed using:

- [Vercel](https://vercel.com/)
- [Render](https://render.com/)
- [Railway](https://railway.com/)

Configure all required environment variables in your hosting platform before deployment.

## 🔒 Security

- Keep sensitive credentials inside environment variables.
- Never commit `.env` files.
- Use proper authentication and authorization.
- Validate incoming API requests.
- Configure CORS according to your frontend domain.

## 👨‍💻 Developer

**Estiak Ahamed Tasin**

Backend powered by Node.js, Express.js, and MongoDB.

---

<p align="center">
  Developed with ❤️
</p>
