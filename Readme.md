# Project Metrics Calculator

The **Project Metrics Calculator** is a web-based application designed to help developers analyze and improve their code quality by providing essential software quality metrics. It features a **React frontend** with **Java** and **Python backends**, containerized using **Docker** and orchestrated through **Docker Compose**.

## Features
- **Fog Index Metric:** Measures the readability of code comments.
- **Defects Removed Metric:** Evaluates how many defects have been fixed in the codebase.
- **Code Comment Coverage:** Calculates the percentage of commented code to ensure maintainability.

## Tech Stack
- **Frontend:** React.js
- **Backends:**  
  - Java (for core metric computations)  
  - Python (for repository analysis and comment coverage metrics)  
- **Containerization:** Docker & Docker Compose
- **Version Control:** GitHub

---

## Getting Started
### Prerequisites
- Docker & Docker Compose installed.
- A valid GitHub token for repository analysis.

### Environment Variables
Create a `.env` file in the root directory with:
```env
GITHUB_TOKEN=your_github_token_here
```

### Installation & Running
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mrunal2148/ser516-group-java-2.git
   cd app
   ```
2. **Start the application:**
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```
3. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)  
   - Java Backend: [http://localhost:8080](http://localhost:8080)  
   - Python Backend: [http://localhost:5005](http://localhost:5005)  

---

## Project Structure
```
project-metrics-calculator/
├── frontend/           # React application
├── backend/
│   ├── Dockerfile      # Java backend Docker setup
│   └── python-backend/
│       ├── Dockerfile  # Python backend Docker setup
│       └── ...         # Python code for metrics
├── docker-compose.yml  # Docker orchestration file
└── .env                # Environment variables
```

## Team
- **Kaumudi Gulbarga** - Developer  
- **Mrunal Kapure** - Developer  
- **Parth Patel** - Developer  
- **Shreya Prakash** - Developer  


