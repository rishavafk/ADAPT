# ADAPT - Advanced Digital Assistive Parkinson's Tracker 🧠✨

**ADAPT** (formerly Neuro-Aid) is a cutting-edge web application designed to empower individuals managing Parkinson's Disease. It leverages modern web technologies and AI to provide real-time symptom analysis, medication tracking, and assistive communication tools.

![ADAPT Hero](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2670)
*(Replace with actual screenshot)*

## 🚀 Key Features

### 🎙️ Voice Clarity (Speech Stabilization)
- **Real-time Transcription**: Instantly converts speech to text using the browser's native Web Speech API.
- **Live Visualizer**: Interactive, neon-glowing microphone interface that reacts to your voice.
- **Playback**: Text-to-speech functionality to read stabilized transcripts aloud.
- **Accessibility**: High-contrast, large-button design for ease of use.

### ✍️ Tremor Analysis
- **Handwriting Assessment**: Digital canvas for drawing spirals and lines.
- **AI Metrics**: Calculates tremor amplitude, jitter, and severity in real-time.
- **Visual Feedback**: Dynamic "heatmap" styling based on tremor severity (Green/Amber/Red).

### 👆 Fine Motor Testing
- **Finger Tapping Task**: Interactive tap test to measure bradykinesia (slowness of movement).
- **Rhythm Analysis**: Tracks tap consistency and speed over time.

### 💊 Medication Management
- **Smart Logging**: Easy-to-use interface for recording medication doses.
- **History & Deletion**: View daily logs and delete entries with a single click.
- **Correlation**: Analytics that map medication timing to symptom severity (On/Off states).

### 📊 AI Analytics Dashboard
- **Health Score**: Unified "Neuro Health Score" dial.
- **Generative Insights**: Uses Google Gemini / OpenAI to summarize weekly trends and provide actionable advice.
- **Timeline**: Visual history of your tremor scores and medication adherence.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion (Complex physics-based interactions, scroll animations)
- **Backend**: Node.js, Express
- **AI Integration**: Google Gemini 1.5 Flash (Speech/Insight generation)
- **Database**: PostgreSQL (via Drizzle ORM) / Supabase Auth

## 📦 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rishavafk/ADAPT.git
    cd ADAPT
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=postgresql://...
    GOOGLE_AI_API_KEY=your_key_here
    OPENAI_API_KEY=your_key_here (optional)
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:5000`.

## 🎨 Design Philosophy
ADAPT features a **"Dark Neon"** aesthetic designed for high contrast and visual engagement, crucial for users with visual impairments often associated with PD.
- **Colors**: Slate 900 backgrounds with Cyan-500, Rose-500, and Violet-500 accents.
- **Typography**: Large, readable fonts (Outfit, Plus Jakarta Sans).
- **Glassmorphism**: Modern, layered UI elements.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

---
*Built with ❤️ for the Parkinson's community.*
