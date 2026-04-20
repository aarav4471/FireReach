# 🔥 FireReach: Autonomous Outreach Intelligence

**FireReach** is an ultra-premium, AI-driven outreach engine designed to automate the modern sales development (SDR) workflow. It leverages an advanced **Agentic AI architecture** to identify high-intent signals, analyze account fit, and deploy hyper-personalized outreach—all within a modern, "Soft Premium" SaaS interface.

---

## 🖼️ The Experience

Built with a "Soft SaaS" aesthetic inspired by world-class platforms like Linear and Stripe, FireReach combines powerful intelligence with a tactile, elegant UI.

![FireReach Dashboard](file:///Users/aaravchugh8607/.gemini/antigravity/brain/b2c9f6f0-8bc6-4ce6-b44b-4a979d9c47e0/initial_load_soft_ui_1776678990799.png)

---

## 🧠 Technical Architecture

FireReach uses a sophisticated multi-stage pipeline powered by **LangChain** and **Meta Llama 3** models to ensure outreach is grounded in real-world data and context.

### 1. Agentic AI Layer
The backend utilizes a **create_tool_calling_agent** pattern with state management:
- **LLM**: `Llama-3.3-70B-Versatile` (for complex workflow logic) and `Llama-3.1-8B-Instant` (for fast metadata extraction).
- **Tooling**:
  - `Signal Harvester`: Real-time news/funding/hiring search via **Serper API**.
  - `Lead Finder`: Individual decision-maker discovery via **Hunter.io**.
  - `Outreach Studio`: Hyper-personalization engine that strictly prohibits templates.
  - `Email Gateway`: Secure delivery via **Resend API**.

### 2. Design System: "Soft Premium"
The frontend is a Decoupled React application featuring:
- **Motion Orchestration**: Staggered animations and tactile feedback powered by `Framer Motion`.
- **Aesthetic Core**: A custom design system in `Tailwind CSS` using semi-transparent glassmorphism, backdrop blurs, and decorative background blobs.

---

## ⚡ Core Features

### 🔍 Signal-Based Intelligence
Instead of generic sequences, FireReach crafts outreach based on **Live Events**:
- Recent funding rounds & growth milestones.
- Leadership changes and hiring trends.
- Technology stack deployments and product launches.

### 🤝 Human-In-The-Loop (HITL) Workflow
Gain full visibility into the agent's research process across four distinct stages:
1. **Discovery**: Define your ICP and watch the agent identify high-fit target accounts.
2. **Analysis**: Deep-dive into specific company structures and decision-maker roles.
3. **Generation**: Review real-time signals harvested for that specific lead.
4. **Studio**: Edit and refine the AI draft in a professional, realistic email client UI.

### ⌨️ Direct Terminal (Manual mode)
For immediate outreach tasks, the **Direct Terminal** bypasses the discovery phase, allowing users to generate and deploy intent-driven emails to specific addresses in seconds.

![Direct Terminal Result](file:///Users/aaravchugh8607/.gemini/antigravity/brain/b2c9f6f0-8bc6-4ce6-b44b-4a979d9c47e0/manual_mode_result_soft_ui_1776679210944.png)

---

## 🚀 Getting Started

### Backend Setup
1. **Navigate**: `cd backend`
2. **Environment**: Create a `.env` file with the following:
   ```env
   GROQ_API_KEY=your_key_here
   SERPER_API_KEY=your_key_here
   RESEND_API_KEY=your_key_here
   HUNTER_API_KEY=optional_key_here
   ```
3. **Run**: 
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

### Frontend Setup
1. **Navigate**: `cd frontend`
2. **Run**:
   ```bash
   npm install
   npm run dev
   ```
   *Dashboard available at http://localhost:5173*

---

## 🌐 Roadmap
- [ ] **CRM Integration**: Native sync with Salesforce and HubSpot.
- [ ] **Multi-Channel**: LinkedIn scraping and automated DM deployment.
- [ ] **Advanced Analytics**: Attribution tracking for response rates vs. specific signals.

---

## 🛡️ License
MIT License - Developed with focus on AI Safety & High-Intent Outreach.
