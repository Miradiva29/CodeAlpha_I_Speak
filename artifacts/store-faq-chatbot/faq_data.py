"""Editable sample FAQ content for the RedCart store.

Replace the questions and answers in this file with your real store information.
Keep each item as a dictionary with a ``question`` and ``answer`` key.
You can add alternate phrasings to ``examples`` to improve matching.
"""

FAQS = [
    {
        "question": "How do I place an order?",
        "answer": (
            "To place an order, add the items you want to your cart, select Checkout, "
            "enter your delivery details, choose a payment method, and review your order "
            "before selecting Place order. You’ll receive a confirmation email once it is submitted."
        ),
        "examples": ["How can I buy something?", "What are the steps to order?"],
    },
    {
        "question": "What payment methods do you accept?",
        "answer": (
            "We accept Visa, Mastercard, Verve, bank transfer, and supported digital wallets. "
            "Available options are shown at checkout and may vary by delivery location."
        ),
        "examples": ["Can I pay by card?", "Do you accept bank transfer?"],
    },
    {
        "question": "How much does delivery cost?",
        "answer": (
            "Delivery fees are calculated at checkout based on your delivery location, order size, "
            "and the delivery option you select. The full fee is shown before you pay."
        ),
        "examples": ["What is the shipping fee?", "Do you charge for delivery?"],
    },
    {
        "question": "How long does delivery take?",
        "answer": (
            "Standard delivery usually takes 2–5 business days after your order is confirmed. "
            "Remote locations may take a little longer. Your checkout page will show the latest estimate."
        ),
        "examples": ["When will my order arrive?", "What is the shipping time?"],
    },
    {
        "question": "How do I track my order?",
        "answer": (
            "When your order ships, we’ll send a tracking link by email or SMS. You can also sign in, "
            "open My orders, and select the order to see its latest delivery status."
        ),
        "examples": ["Where is my package?", "Can I see my delivery status?"],
    },
    {
        "question": "How do I return an item?",
        "answer": (
            "Start a return within 14 days of delivery from your order page, or contact support with "
            "your order number. Items should be unused, in their original packaging, and accompanied "
            "by proof of purchase."
        ),
        "examples": ["I want to send something back.", "What is your return process?"],
    },
    {
        "question": "Can I exchange an item?",
        "answer": (
            "Yes. Exchange requests can be made within 14 days of delivery for eligible unused items. "
            "Contact support with your order number and tell us the item and replacement option you need."
        ),
        "examples": ["Can I swap my purchase?", "I need a different size."],
    },
    {
        "question": "When will I receive my refund?",
        "answer": (
            "After an approved return reaches us, refunds are normally processed within 3–5 business days. "
            "Your bank or payment provider may need additional time to show the funds in your account."
        ),
        "examples": ["How long do refunds take?", "Where is my money back?"],
    },
    {
        "question": "How can I check if a product is available?",
        "answer": (
            "The product page shows the current stock status. If an item is out of stock, select Notify me "
            "when available when that option is shown, and we’ll email you when stock returns."
        ),
        "examples": ["Is this item in stock?", "Do you have this product?"],
    },
    {
        "question": "How can I contact customer support?",
        "answer": (
            "You can reach customer support through the Help page or by emailing support@redcart.example. "
            "Our sample support hours are Monday–Friday, 9:00–17:00. Include your order number for faster help."
        ),
        "examples": ["I need to speak to someone.", "What is your support email?"],
    },
]