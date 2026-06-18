# Product Requirements Document (PRD)
**Project Name:** JobTrack AI - AI-Powered Job Application Tracker & Resume Optimizer

**Version:** 1.0  
**Date:** June 2026  
**Author:** Vikas Singh

## 1. Objective
Build a modern full-stack web application that helps job seekers efficiently track their job applications while leveraging Generative AI to optimize resumes, generate tailored cover letters, and improve job matching.

## 2. Target Audience
- Job seekers (freshers & experienced professionals)
- Developers & Software Engineers
- Recruiters / Admins (demo purposes)

## 3. Key Value Proposition
"Track every application intelligently and let AI make your profile stand out."

## 4. Core Features

### Phase 1 - MVP (Minimum Viable Product)
- User Authentication (Register, Login, Logout)
- Profile Management
- Resume Upload (PDF) & Storage
- Job Application Tracker (CRUD)
  - Company, Job Title, Status, Applied Date, Notes, Linked Resume
- Dashboard with statistics (Total applications, Success rate, Status breakdown)

### Phase 2 - AI Features
- AI Resume Analysis (Strengths, Weaknesses, Improvement Suggestions)
- AI Cover Letter Generator (based on resume + job description)
- AI Job Match Score (percentage + explanation)
- AI-powered Job Description insights


## 6. Success Criteria
- At least 8-10 well-designed REST APIs
- Successful integration with Generative AI (Azure OpenAI / OpenAI)
- Live deployment with public URL
- Professional README with architecture diagram, screenshots & demo video
- Clean Git history with proper branching

## 7. Tech Stack (High-level)
- **Backend**: .NET 8 Microservices
- **Frontend**: React.js + TypeScript
- **Database**: PostgreSQL
- **AI**: Azure OpenAI
- **Deployment**: Render/Vercel