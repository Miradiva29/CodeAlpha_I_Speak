"""Task 2: Online Store FAQ Chatbot.

Run locally with:
    streamlit run app.py --server.port 8008
"""

from __future__ import annotations

import html
import os
from typing import TypedDict

import streamlit as st

from faq_data import FAQS
from matcher import FAQMatch, FAQMatcher


class ChatMessage(TypedDict):
    role: str
    content: str
    matched_question: str | None
    score: float | None


st.set_page_config(
    page_title="RedCart Support",
    page_icon="🛍️",
    layout="centered",
    initial_sidebar_state="collapsed",
)


def inject_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        :root {
          --red: #ef4444;
          --red-bright: #ff5a5f;
          --ink: #f7f7f7;
          --muted: #a5a5ad;
          --panel: #151518;
          --panel-light: #1e1e23;
          --line: rgba(255,255,255,.10);
        }

        .stApp {
          background:
            radial-gradient(circle at 12% 0%, rgba(239,68,68,.16), transparent 30rem),
            radial-gradient(circle at 100% 18%, rgba(255,255,255,.06), transparent 26rem),
            #09090b;
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
        }

        [data-testid="stHeader"] { background: transparent; }
        [data-testid="stToolbar"] { visibility: hidden; }
        .block-container { max-width: 820px; padding: 2.4rem 1.15rem 4.5rem; }

        h1, h2, h3, .brand-name { font-family: 'Space Grotesk', sans-serif; }
        h1 { letter-spacing: -.045em; line-height: 1.02; }
        h2, h3 { letter-spacing: -.025em; }

        .brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3.2rem;
        }
        .brand-lockup { display: flex; align-items: center; gap: .7rem; }
        .brand-mark {
          display: grid;
          place-items: center;
          width: 2.65rem;
          height: 2.65rem;
          border-radius: .85rem;
          background: var(--red);
          color: white;
          font-size: 1.25rem;
          box-shadow: 0 10px 28px rgba(239,68,68,.25);
        }
        .brand-name { font-size: 1.2rem; font-weight: 700; color: var(--ink); }
        .brand-subtitle {
          display: block;
          color: var(--muted);
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .status-pill {
          border: 1px solid var(--line);
          border-radius: 999px;
          color: var(--muted);
          font-size: .72rem;
          padding: .42rem .72rem;
        }
        .status-dot {
          display: inline-block;
          width: .42rem;
          height: .42rem;
          margin-right: .35rem;
          border-radius: 999px;
          background: #5ee28a;
        }
        .eyebrow {
          color: var(--red-bright);
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .hero-copy { color: var(--muted); font-size: 1.02rem; line-height: 1.7; max-width: 38rem; }
        .chat-card {
          border: 1px solid var(--line);
          border-radius: 1.25rem;
          background: rgba(21,21,24,.83);
          box-shadow: 0 22px 60px rgba(0,0,0,.30);
          padding: 1rem;
        }
        .welcome-card {
          border: 1px solid rgba(239,68,68,.19);
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(239,68,68,.10), rgba(255,255,255,.025));
          padding: 1.25rem;
          margin-bottom: .9rem;
        }
        .welcome-title { color: var(--ink); font-weight: 700; font-size: 1rem; }
        .welcome-copy { color: var(--muted); font-size: .88rem; line-height: 1.6; margin: .35rem 0 0; }
        .faq-label {
          color: var(--muted);
          font-size: .69rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          margin: 1.6rem 0 .65rem;
        }
        .confidence-note { color: var(--muted); font-size: .7rem; margin: .4rem 0 0 .25rem; }
        .support-note {
          border-left: 2px solid var(--red);
          color: var(--muted);
          font-size: .82rem;
          line-height: 1.55;
          margin-top: .7rem;
          padding-left: .75rem;
        }
        div[data-testid="stChatMessage"] {
          border: 1px solid var(--line);
          border-radius: 1rem;
          margin: .7rem 0;
          padding: .85rem 1rem;
          background: rgba(255,255,255,.025);
        }
        div[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
          background: rgba(239,68,68,.08);
          border-color: rgba(239,68,68,.18);
        }
        div[data-testid="stChatMessageContent"] p { line-height: 1.65; }
        .stTextInput input {
          background: var(--panel-light) !important;
          border: 1px solid var(--line) !important;
          border-radius: .8rem !important;
          color: var(--ink) !important;
        }
        .stTextInput input:focus { border-color: var(--red) !important; box-shadow: 0 0 0 1px var(--red) !important; }
        .stButton button {
          border: 1px solid var(--line);
          border-radius: .7rem;
          background: rgba(255,255,255,.04);
          color: var(--ink);
          font-weight: 600;
        }
        .stButton button:hover { border-color: var(--red); color: white; }
        section[data-testid="stSidebar"] { background: var(--panel); }
        .metric-card {
          border: 1px solid var(--line);
          border-radius: .9rem;
          background: rgba(255,255,255,.025);
          padding: .8rem;
          text-align: center;
        }
        .metric-number { color: var(--red-bright); font-family: 'Space Grotesk'; font-size: 1.35rem; font-weight: 700; }
        .metric-label { color: var(--muted); font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_brand() -> None:
    st.markdown(
        """
        <div class="brand-row">
          <div class="brand-lockup">
            <div class="brand-mark">✦</div>
            <div>
              <span class="brand-name">RedCart</span>
              <span class="brand-subtitle">store support</span>
            </div>
          </div>
          <div class="status-pill"><span class="status-dot"></span>Support online</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def initialize_state() -> None:
    if "messages" not in st.session_state:
        st.session_state.messages = [
            ChatMessage(
                role="assistant",
                content=(
                    "Hi! I’m the RedCart support assistant. Ask me about orders, "
                    "shipping, payments, returns, or anything else in our store FAQ."
                ),
                matched_question=None,
                score=None,
            )
        ]


def render_message(message: ChatMessage) -> None:
    role = "user" if message["role"] == "user" else "assistant"
    with st.chat_message(role):
        st.markdown(message["content"])
        if role == "assistant" and message["score"] is not None:
            st.markdown(
                f'<p class="confidence-note">Matched FAQ · {message["score"]:.0%} similarity</p>',
                unsafe_allow_html=True,
            )


def answer_question(question: str, matcher: FAQMatcher) -> ChatMessage:
    match: FAQMatch | None = matcher.find_best_match(question)
    if match is None:
        return ChatMessage(
            role="assistant",
            content=(
                "I’m sorry, I don’t have a reliable answer for that in this FAQ yet. "
                "Please contact our customer support team and they’ll be happy to help."
                '<div class="support-note">Support hours: Monday–Friday, 9:00–17:00. '
                "Please include your order number if your question is about an order.</div>"
            ),
            matched_question=None,
            score=None,
        )

    return ChatMessage(
        role="assistant",
        content=match.answer,
        matched_question=match.question,
        score=match.score,
    )


def render_sidebar(matcher: FAQMatcher) -> None:
    with st.sidebar:
        st.markdown("### FAQ controls")
        st.caption("This demo uses editable sample store information.")
        st.markdown(
            f'<div class="metric-card"><div class="metric-number">{len(FAQS)}</div>'
            '<div class="metric-label">Sample FAQs</div></div>',
            unsafe_allow_html=True,
        )
        st.divider()
        st.markdown("**How matching works**")
        st.caption(
            "Questions are normalized with NLTK tokenization and stemming, then compared "
            "with TF-IDF vectors using cosine similarity. No generative AI is used."
        )
        if st.button("Clear conversation", use_container_width=True):
            st.session_state.messages = []
            st.rerun()
        st.divider()
        st.markdown("**Edit store content**")
        st.caption("Update the questions and answers in `faq_data.py` when you are ready to add real business information.")


def main() -> None:
    inject_styles()
    initialize_state()
    matcher = FAQMatcher(FAQS)
    render_sidebar(matcher)
    render_brand()

    st.markdown('<p class="eyebrow">Task 02 · AI internship project</p>', unsafe_allow_html=True)
    st.title("Your store questions, answered.")
    st.markdown(
        '<p class="hero-copy">A simple support desk for the questions customers ask most. '
        "Type naturally and I’ll look for the closest answer in the store FAQ.</p>",
        unsafe_allow_html=True,
    )

    st.markdown('<div class="chat-card">', unsafe_allow_html=True)
    st.markdown(
        '<div class="welcome-card"><div class="welcome-title">Welcome to RedCart support</div>'
        '<p class="welcome-copy">Try asking “How long does delivery take?” or “Can I exchange an item?”</p></div>',
        unsafe_allow_html=True,
    )
    for message in st.session_state.messages:
        render_message(message)
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="faq-label">Suggested questions</div>', unsafe_allow_html=True)
    suggested = [
        "How can I track my order?",
        "What payment methods do you accept?",
        "How do I return an item?",
    ]
    suggestion_columns = st.columns(3)
    for column, suggestion in zip(suggestion_columns, suggested):
        if column.button(suggestion, key=f"suggestion-{suggestion}", use_container_width=True):
            st.session_state.pending_question = suggestion

    question = st.chat_input("Ask about orders, delivery, returns, or payments…")
    pending_question = st.session_state.pop("pending_question", None)
    question = question or pending_question
    if question:
        clean_question = html.escape(question.strip())
        if not clean_question:
            st.warning("Please enter a question first.")
        else:
            st.session_state.messages.append(
                ChatMessage(
                    role="user",
                    content=clean_question,
                    matched_question=None,
                    score=None,
                )
            )
            st.session_state.messages.append(answer_question(question, matcher))
            st.rerun()

    st.markdown(
        '<p class="support-note">Can’t find what you need? Contact customer support with your order number '
        "and we’ll take a closer look.</p>",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    os.environ.setdefault("STREAMLIT_BROWSER_GATHER_USAGE_STATS", "false")
    main()