#  Nexora — Real-Time AI Chat Application

Nexora is a full-stack real-time chat application built with the MERN stack and Socket.IO. It provides secure authentication, real-time messaging, online/offline presence, message status tracking, image sharing, and AI-powered Smart Reply Suggestions.

The application is designed with a scalable backend architecture and a responsive React frontend.

---

##  Live Demo

🔗 **Live Application:**  
https://chat-application-ten-orcin.vercel.app/

🔗 **GitHub Repository:**  
https://github.com/SAfroz12/Chat-application

---

##  Features

###  Authentication & Authorization

- User registration and login
- JWT-based authentication
- Access and refresh token system
- Tokens stored securely using HTTP-only cookies
- Protected API routes
- Automatic token refresh
- Secure logout
- Google OAuth 2.0 authentication
- Passport.js integration

### Real-Time Messaging

- One-to-one conversations
- Instant message delivery using Socket.IO
- Persistent message history
- Conversation-based messaging
- Sender and participant relationships
- Message timestamps

###  Online & Offline Presence

- Real-time online/offline user status
- Displays whether the other participant is currently online
- Socket-based presence tracking

###  Typing Indicators

- Real-time typing detection
- Displays when the other user is typing
- Automatically stops the typing indicator after the user stops typing

###  Message Delivery & Read Status

Messages support multiple delivery states:

- ✓ Sent
- ✓✓ Delivered
- ✓✓ Read

The status is updated in real time through Socket.IO events.

###  Message Editing & Deletion

- Users can edit their own messages
- Edited messages are marked as edited
- Users can delete their own messages
- Deleted messages are removed from the conversation in real time

### Image Sharing

- Upload images directly from the chat interface
- Images are uploaded to Cloudinary
- Cloudinary returns a hosted image URL
- Image URLs are sent through Socket.IO
- Image messages are persisted in MongoDB
- Supports image and text messages independently

###  AI Smart Reply Suggestions

Nexora includes an AI-powered Smart Reply feature.

When a user receives a message:

1. The backend processes the received message.
2. The message is sent to an LLM API.
3. AI-generated contextual reply suggestions are created.
4. Suggestions are returned to the frontend.
5. Suggestions are displayed in the chat interface.
6. The user can select a suggestion and send or edit it.

This helps users respond quickly without manually typing a complete response.

---

##  Tech Stack

### Frontend

- React.js
- Redux Toolkit
- Axios
- Tailwind CSS
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- REST APIs
- JWT Authentication
- Passport.js
- Google OAuth 2.0

### Database

- MongoDB
- Mongoose

### Cloud & AI

- Cloudinary
- Mistral API

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## Application Architecture


                    ┌─────────────────────┐
                    │       React.js      │
                    │     Frontend UI     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Redux Toolkit    │
                    │   Application State │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Axios         │
                    │     REST APIs       │
                    └──────────┬──────────┘
                               │
              ┌────────────────▼────────────────┐
              │          Express.js             │
              │          Backend API            │
              └───────────────┬───────────── ───┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
     ┌───────▼───────┐ ┌──────▼───────┐ ┌────▼────────┐
     │    MongoDB    │ │  Socket.IO   │ │    JWT      │
     │   Database    │ │ Real-Time    │ │   Auth      │
     └───────────────┘ └──────┬───────┘ └─────────────┘
                              │
                       ┌──────▼───────┐
                       │   Mistral    │
                       │   AI API     │
                       └──────────────┘

                       ┌──────────────┐
                       │  Cloudinary  │
                       │    Images    │
                       └──────────────┘




                       Project Structure
     Chat-application/
      │
      ├── client/
      │   ├── src/
      │   │   ├── components/
      │   │   ├── pages/
      │   │   ├── services/
      │   │   ├── socket/
      │   │   ├── store/
      │   │   └── App.jsx
      │   │
      │   └── package.json
      │
      ├── server/
      │   ├── controllers/
      │   ├── models/
      │   ├── routes/
      │   ├── middleware/
      │   ├── services/
      │   ├── socket/
      │   ├── utils/
      │   └── server.js
      │
      └── README.md
     Real-Time Message Flow
          User A
            │
            │ Send Message
            ▼
       React Frontend
            │
            │ Socket.IO
             ▼
      Node.js + Socket.IO Server
            │
            ├──────────────► MongoDB
            │                  │
            │                  │ Save Message
            │                  ▼
            │
            └──────────────► User B
                       │
                       ▼
                 New Message
           
             Image Upload Flow
             User selects image
                       │
                       ▼
             React Chat Interface
                       │
                       ▼
               Cloudinary Upload
                       │
                       ▼
              Cloudinary Image URL
                       │
                       ▼
               Socket.IO sendMessage
                       │
                       ▼
                 Node.js Backend
                       │
                       ▼
                    MongoDB
                       │
                       ▼
              Recipient receives image
               
                 Smart Reply Flow
                 Incoming Message
                       │
                       ▼
                   Socket.IO
                       │
                       ▼
                     Backend
                       │
                       ▼
                  Mistral API
                       │
                       ▼
             AI-generated suggestions
                       │
                       ▼
                   Socket.IO
                       │
                       ▼
                     Chat UI
                       │
                       ▼
             User selects a reply




Running the Project Locally
1. Clone the repository
git clone https://github.com/SAfroz12/Chat-application.git
2. Install frontend dependencies
cd client
npm install
3. Install backend dependencies
cd ../server
npm install
4. Configure environment variables
Create the required .env files in the frontend/backend directories.
5. Start the backend
 >npm run dev
6. Start the frontend
>npm run dev

The application will then be available locally.
## Future AI Improvements

        >The Smart Reply system can be extended in future versions with:

        1)Context-aware multi-message suggestions
        2)Personalized reply suggestions
        3)Tone selection such as professional, friendly, or casual
        4)AI message summarization
        5)Conversation summarization
        6)AI-assisted message rewriting
      




##        Author

        Afroz Shaik
        GitHub: https://github.com/SAfroz12
        LinkedIn: https://www.linkedin.com/in/afroz-sk-26429b278/
