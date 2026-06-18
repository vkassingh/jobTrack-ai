# Technical Requirements Document (TRD)
**Project Name:** JobTrack AI - AI-Powered Job Application Tracker & Resume Optimizer

**Version:** 1.0  
**Date:** June 2026  
**Author:** Vikas Singh

## 1. Architecture Overview
- **Style**: Start with **Modular Monolith**, then evolve into **Microservices**
- **Communication**: REST APIs (primary), Async Events via MediatR (future RabbitMQ/MassTransit)
- **API Gateway**: YARP (Yet Another Reverse Proxy) — lightweight and .NET native
- **Design Principles**: Clean Architecture, CQRS (with MediatR), SOLID, Vertical Slice Architecture

## 2. Tech Stack

### Backend
- **Framework**: .NET 8 (ASP.NET Core Web API)
- **ORM**: Entity Framework Core 8
- **Validation**: FluentValidation
- **Logging**: Serilog + Seq (optional)
- **Mapping**: AutoMapper or Mapster
- **Authentication**: ASP.NET Core Identity + JWT Bearer
- **API Documentation**: Swagger / Scalar
- **Testing**: xUnit + Moq + Testcontainers

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 
- **State Management**: Zustand
- **Routing**: React Router v6


### Databases & Storage
- **Primary Database**: PostgreSQL (via Supabase free tier or local Docker)
- **File Storage**: Supabase Storage (free) or local filesystem (development)


### AI / External Services (All Free)
- **Generative AI**: 
  - **Primary**: Google Gemini 1.5 Flash (free tier via Google AI Studio)
- **PDF Parsing**: PdfPig (pure .NET library)
- **Mock Job Data**: RemoteOK API + FakeJobs API (free)
- **Email Testing**: Mailtrap (free tier) or console logging

### DevOps & Tools
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git (GitHub)
- **Code Quality**: ESLint + Prettier (frontend), .NET analyzers (backend)

## 3. Microservices Structure

1. **Auth Service** – User registration, login, profile, JWT issuance
2. **Resume Service** – Resume upload, PDF parsing, metadata storage
3. **Application Service** – Job application CRUD, status tracking, dashboard data
4. **AI Service** – Resume analysis, cover letter generation, job matching
5. **API Gateway** – Request routing, authentication, rate limiting

## 4. Folder Structure (Root)

```bash
/jobtrack-ai
├── frontend/                          # React + TypeScript App
├── services/
│   ├── AuthService/
│   ├── ResumeService/
│   ├── ApplicationService/
│   ├── AIService/
│   └── ApiGateway/
├── shared/                            # Shared Kernel (DTOs, Contracts, Exceptions)
├── docker-compose.yml
├── README.md
├── PRD.md
├── TRD.md
└── .gitignore

ApplicationService/
├── ApplicationService.csproj
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── Controllers/              # API Controllers
├── DTOs/                     # Data Transfer Objects (Request/Response)
├── Models/                   # Domain Entities
├── Data/                     # DbContext + Migrations
├── Services/                 # Business Logic & Helpers
├── Properties/
│   └── launchSettings.json
├── Dockerfile
└── README.md                

# JobTrackAI Development Plan

## 5. Development Phases

- **Phase 0:** Project Setup + Docker Compose (PostgreSQL, Redis, Ollama)  
- **Phase 1:** Auth Service + API Gateway + Basic Frontend Auth  
- **Phase 2:** Resume Service (Upload + PdfPig parsing)  
- **Phase 3:** Application Service + Dashboard  
- **Phase 4:** AI Service Integration (Gemini / Ollama)  
- **Phase 5:** Advanced Features (SignalR, Analytics, Export)  
- **Phase 6:** Testing, Dockerization, CI/CD & Deployment  
 

---

## 6. Deployment Strategy (Free Tier)

- **Frontend:** Vercel / Netlify (free)  
- **Backend Services:** Render.com or Railway (free tier)  
- **Database:** Supabase PostgreSQL + Storage (free)  
- **AI:** Google Gemini (free tier) or local Ollama  
- **Domain:**