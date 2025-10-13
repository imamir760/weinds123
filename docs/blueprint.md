# **App Name**: Weinds

## Core Features:

- Role-Based Authentication: Firebase Authentication with role-based access control (candidate, employer, TPO) via custom claims stored in Firestore.
- AI Career OS: AI-driven career mentor using the Gemini model to generate specializations, learning roadmaps, and resources based on user career goals; saves data in Firestore.
- AI Resume Builder: Parses raw text to reformat resumes, uses template engine to render multiple designs, and saves files in Firebase Storage.
- Job Finder: Displays jobs with filtering and job recommendation scores based on cosine similarity between job vector & candidate skill vector. This tool computes the compatibility score of each job in the database to display relevant opportunities.
- AI Job Description Generator: Generates job descriptions from unstructured text, extracting key details (title, responsibilities, skills) and creating metadata for filtering.
- AI-Powered Screening: AI skill tests and conversational AI (Gemini) interviews with semantic scoring, aggregated into a 'Hire Recommendation'. This tool generates and assesses the candidate.
- Campus & Fresher Pool: Enables employers to browse talent pools, filter by college/skills, and invite candidates or institutions for hiring drives.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2), reflecting trust and innovation in recruitment.
- Background color: Light blue (#E5F5FF), a desaturated variant of the primary color, creating a calm, professional backdrop.
- Accent color: A contrasting orange (#FF8C00) to highlight key actions and important information.
- Body and headline font: 'Inter', a sans-serif font for clear and modern readability.
- Code font: 'Source Code Pro' for code snippets, ensuring legibility.
- Use modern and clear icons to represent job categories, skills, and application statuses.
- Maintain a clean and structured layout, focusing on intuitive navigation and easy access to information.