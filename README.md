# CliniTune 🧠

**AI-Powered Mental Health Practice Management Platform**

CliniTune is a comprehensive digital platform designed to revolutionize mental health care delivery through intelligent automation, real-time patient monitoring, and seamless practice management tools.

![CliniTune Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=CliniTune+Dashboard)

## 🌟 Key Features

### 🤖 AI-Powered Patient Engagement
- **Intelligent Wellness Chat**: 24/7 AI companion for patients between therapy sessions
- **Real-time Sentiment Analysis**: Automatic detection of concerning language and emotional states
- **Crisis Detection**: Immediate alerts for suicidal ideation, self-harm, or crisis situations
- **Therapeutic Insights**: AI-generated summaries for clinicians with actionable recommendations

### 👨‍⚕️ Clinician Dashboard
- **Patient Management**: Comprehensive patient profiles with progress tracking
- **AI Alert System**: Real-time notifications for patients requiring immediate attention
- **Practice Analytics**: Detailed insights into patient outcomes and practice performance
- **Appointment Management**: Streamlined scheduling with automated reminders

### 👤 Patient Portal
- **Personal Dashboard**: Progress tracking and upcoming activities overview
- **Task Management**: Therapeutic assignments with completion tracking
- **Secure Messaging**: Direct communication with assigned clinicians
- **Appointment Booking**: Easy scheduling and rescheduling of therapy sessions

### 🔒 Security & Compliance
- **HIPAA Compliant**: Full compliance with healthcare privacy regulations
- **End-to-End Encryption**: Secure data transmission and storage
- **Role-Based Access**: Granular permissions for different user types
- **Audit Trails**: Comprehensive logging for compliance and security

## 🚀 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Shadcn/ui**: Reusable component library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication and session management
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling

### AI Integration
- **Google Gemini AI**: Advanced language model for patient interactions
- **Real-time Analysis**: Immediate sentiment and risk assessment
- **Natural Language Processing**: Understanding patient emotional states

### Infrastructure
- **Vercel**: Deployment and hosting platform
- **MongoDB Atlas**: Cloud database service
- **Environment Variables**: Secure configuration management

## 📋 Prerequisites

Before running CliniTune, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or Atlas)
- **Google Gemini API** key
- **NextAuth** secret key

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/clinitune.git
cd clinitune
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/clinitune
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinitune

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# AI Integration
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@clinitune.com
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Run database migrations (if any)
npm run db:migrate
```

### 5. Seed Demo Data (Optional)
```bash
npm run seed
```

### 6. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see CliniTune in action!

## 🏗️ Project Structure

```
clinitune/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── ai/           # AI-related endpoints
│   │   │   ├── auth/         # Authentication
│   │   │   ├── dashboard/    # Dashboard data
│   │   │   ├── notifications/# Notification system
│   │   │   └── patients/     # Patient management
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── clinician/   # Clinician interface
│   │   │   └── patient/     # Patient interface
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── ui/              # UI components
│   ├── lib/                 # Utility libraries
│   ├── models/              # Database models
│   └── scripts/             # Utility scripts
├── public/                  # Static assets
├── .env.local              # Environment variables
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind configuration
└── README.md              # This file
```

## 🔧 Configuration

### AI Configuration
CliniTune uses Google Gemini AI for patient interactions. Configure your API key:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. Adjust AI parameters in `/src/app/api/ai/chat/route.ts`

### Database Models
- **User**: Clinicians and patients with role-based access
- **AIChat**: Conversation history and analysis
- **Appointment**: Scheduling and session management
- **Task**: Therapeutic assignments
- **Notification**: Alert system for clinicians

### Authentication
NextAuth.js handles authentication with support for:
- Email/password login
- Session management
- Role-based access control
- Secure password hashing

## 🎯 Usage Guide

### For Clinicians

1. **Sign Up**: Create a clinician account at `/auth/signup`
2. **Assign Patients**: Add patients by email address in Patient Management
3. **Monitor Dashboard**: View AI alerts and patient progress
4. **Review AI Summaries**: Check patient conversation insights
5. **Manage Appointments**: Schedule and track therapy sessions

### For Patients

1. **Sign Up**: Create a patient account at `/auth/signup`
2. **Chat with AI**: Use the wellness companion between sessions
3. **Complete Tasks**: Finish therapeutic assignments
4. **Track Progress**: Monitor your mental health journey
5. **Book Appointments**: Schedule sessions with your clinician

## 🚨 AI Alert System

CliniTune's AI continuously monitors patient communications for:

### High-Risk Indicators
- Suicidal ideation ("dying", "kill myself", "end it all")
- Self-harm mentions ("hurt myself", "harm myself")
- Hopelessness expressions ("no point", "give up")
- Crisis language ("can't go on", "better off dead")

### Medium-Risk Indicators
- Depression symptoms ("depressed", "empty", "numb")
- Anxiety markers ("panic", "scared", "worried")
- Emotional distress ("breaking down", "falling apart")

### Alert Actions
- **Immediate Notifications**: Clinicians receive real-time alerts
- **Dashboard Updates**: Alert counts and summaries refresh automatically
- **Crisis Resources**: Patients receive immediate support information
- **Escalation Protocols**: Automatic flagging for urgent intervention

## 🔐 Security Features

### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Access Controls**: Role-based permissions and authentication
- **Session Security**: Secure session management with NextAuth.js
- **Input Validation**: Comprehensive input sanitization

### HIPAA Compliance
- **Audit Logging**: Complete activity tracking
- **Data Minimization**: Only necessary data collection
- **User Consent**: Clear privacy policies and consent flows
- **Secure Communication**: Encrypted patient-clinician messaging

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test AI Functionality
Use the built-in testing endpoints:
- `/api/ai/test-sentiment` - Test sentiment analysis
- `/api/notifications/test` - Create test notifications
- `/api/debug/seed` - Generate demo data

## 📊 Monitoring & Analytics

### Dashboard Metrics
- **Patient Engagement**: Chat activity and response rates
- **Alert Frequency**: Crisis detection and intervention rates
- **Task Completion**: Therapeutic assignment progress
- **Appointment Adherence**: Session attendance tracking

### AI Performance
- **Sentiment Accuracy**: Validation of emotional state detection
- **Alert Precision**: False positive/negative rates
- **Response Quality**: Patient satisfaction with AI interactions

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### AI Integration
- `POST /api/ai/chat` - Patient AI chat interactions
- `POST /api/ai/test-sentiment` - Test sentiment analysis
- `POST /api/ai/fix-classifications` - Fix AI classifications

### Patient Management
- `GET /api/patients` - Get assigned patients
- `GET /api/patients/[id]` - Get individual patient
- `POST /api/patients/assign` - Assign patient to clinician

### Dashboard Data
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent-activity` - Recent AI summaries
- `POST /api/dashboard/refresh-stats` - Refresh AI alerts

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]` - Mark notification as read
- `DELETE /api/notifications/clear` - Clear all notifications

### Tasks & Appointments
- `GET /api/tasks` - Get user tasks
- `GET /api/appointments` - Get user appointments

## 🎨 UI Components

Built with Shadcn/ui and styled with Tailwind CSS:

### Core Components
- **Button**: Various styles and sizes
- **Card**: Content containers with headers
- **Input**: Form inputs with validation
- **Dialog**: Modal dialogs and overlays

### Dashboard Components
- **Sidebar**: Role-based navigation
- **Layout**: Responsive dashboard wrapper
- **Stats Cards**: Metric displays with icons
- **Patient Lists**: Comprehensive patient tables

## 🤝 Contributing

We welcome contributions to CliniTune! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Ensure HIPAA compliance for health-related features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Setup Guide](setup.md) - Detailed setup instructions
- [API Documentation](docs/api.md) - Complete API reference
- [User Guide](docs/user-guide.md) - End-user documentation

### Getting Help
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions
- **Email**: Contact support@clinitune.com

### Crisis Resources
If you or someone you know is in crisis:
- **Emergency Services**: 911
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced language processing
- **Next.js Team** for the excellent React framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for flexible data storage
- **Mental Health Community** for guidance and feedback

---

**CliniTune** - Transforming Mental Health Care with AI-Driven Solutions

Made with ❤️ for mental health professionals and their patients.