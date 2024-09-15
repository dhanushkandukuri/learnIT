import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

# Ensure required data is downloaded
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('punkt_tab')

text = "This is a test. NLTK should be able to tokenize this text."

# Tokenize sentences
sentences = sent_tokenize(text)
print("Sentences:", sentences)

# Tokenize words
words = word_tokenize(text)
print("Words:", words)

# Load stopwords
stop_words = set(stopwords.words('english'))
print("Stopwords sample:", list(stop_words)[:10])
