# CliniTune Setup Guide

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Update `.env.local` with your MongoDB URI and Gemini API key:
   ```env
   MONGODB_URI=mongodb://localhost:27017/clinitune
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Database Setup**:
   ```bash
   # Make sure MongoDB is running, then:
   npm run seed
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

5. **Access Application**:
   - Open http://localhost:3000
   - Use demo accounts:
     - Clinician: `clinician@demo.com` / `password`
     - Patient: `patient@demo.com` / `password`

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env.local` file

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/clinitune`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `.env.local`

## Troubleshooting

- **MongoDB Connection Issues**: Ensure MongoDB is running and URI is correct
- **Gemini API Errors**: Verify API key is valid and has proper permissions
- **Build Errors**: Run `npm install` to ensure all dependencies are installed
- **Port Conflicts**: Change port in `package.json` if 3000 is in use

## Features to Test

### Clinician Dashboard
- View patient list and summaries
- Check AI alerts and insights
- Navigate patient profiles

### Patient Portal
- Chat with AI wellness companion
- Complete assigned tasks
- View upcoming appointments

### AI Chat Features
- Natural conversation flow
- Emotional support responses
- Automatic summary generation