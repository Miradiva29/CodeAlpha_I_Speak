# RedCart Online Store FAQ Chatbot

Task 2 for the CodeAlpha AI internship project.

This is a beginner-friendly Streamlit chatbot that uses real NLP preprocessing and
TF-IDF cosine similarity to match a customer's question to the closest editable FAQ.
It does not use generative AI or pretend to understand questions outside the stored FAQ.

## Run

From this directory:

```bash
streamlit run app.py --server.port 8008
```

## Customize the store

Edit `faq_data.py`:

- Change the sample questions and answers to your own store information.
- Add alternate phrasings in each FAQ's `examples` list to improve matching.
- Add more FAQ dictionaries with the same `question`, `answer`, and optional `examples` keys.

The matcher is in `matcher.py`. It uses NLTK tokenization and stemming, removes a
small built-in stop-word list, creates TF-IDF vectors, and compares them with cosine
similarity. Questions below the confidence threshold receive the support fallback.