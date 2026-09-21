---
name: Translation tool runtime
description: Why the translation project uses the supported web artifact runtime instead of Streamlit.
---

The workspace's supported runnable app template for this project is React/Vite; Streamlit is not available as an artifact template here. When a request says “if possible” for Streamlit, keep the live preview in the supported web runtime unless a Python service is explicitly required.

**Why:** The project was bootstrapped from the available artifact templates, and the user’s core requirement is a beginner-friendly working translation demo rather than a specific runtime.

**How to apply:** Prefer the existing web artifact for small UI-first demos; only add a Python/Streamlit service when the user explicitly needs Python-specific behavior or deployment.