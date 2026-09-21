---
name: Streamlit artifact preview routing
description: The preview registration and proxy requirements for a Python Streamlit app hosted as a nested web artifact.
---

Register a standalone Streamlit app as a web artifact when it needs its own Open/preview destination. Point the managed service command at the Python app, pass the artifact `PORT` and `BASE_PATH`, and include the nested path plus its `_stcore` and static routes in the service paths.

**Why:** A generic workflow can run Streamlit successfully but its Open action may fall back to the root web artifact. Streamlit also renders a blank page behind a nested proxy if its live `_stcore/stream` route is not forwarded.

**How to apply:** Keep the chatbot source in its Python directory, use a separate registered web artifact as the preview owner, and verify both the routed health endpoint and a browser screenshot before delivery.