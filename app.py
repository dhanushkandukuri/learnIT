from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import spacy
import pdfkit
import fitz  # PyMuPDF
import urllib.parse
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

app = Flask(__name__)
CORS(app)

nlp = spacy.load('en_core_web_md')

# Configure pdfkit to use the correct wkhtmltopdf path
config = pdfkit.configuration(wkhtmltopdf=r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe')

def google_search(query):
    from googlesearch import search
    return list(search(query, num_results=5))

def scrape_and_find_relevant_content(url, query):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Try to find the main content of the page
        main_content = soup.find('main') or soup.find('article') or \
            soup.find('div', {'class': 'content'}) or \
            soup.find('div', {'class': 'entry-content'})

        if main_content:
            # If main content is found, get all text within it
            content = " ".join([para.get_text() for para in main_content.find_all(['p', 'div', 'span', 'li',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])])
        else:
            # Fall back to extracting all text if specific main content is not found
            content = " ".join([para.get_text() for para in soup.find_all(['p', 'div', 'span', 'li',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])])

        query_doc = nlp(query)
        content_doc = nlp(content)
        sentences = list(content_doc.sents)

        similarity_scores = []
        for sentence in sentences:
            if sentence.vector_norm:
                score = query_doc.similarity(sentence)
                similarity_scores.append((sentence.text, score))
        similarity_scores.sort(key=lambda x: x[1], reverse=True)

        if similarity_scores:
            top_match_text = similarity_scores[0][0]
            match_percentage = int(similarity_scores[0][1] * 100)

            # Create a shorter, clean text fragment
            highlight_snippet = top_match_text.strip()
            highlight_snippet = re.sub(r'\s+', ' ', highlight_snippet)  # Normalize whitespace
            highlight_snippet = highlight_snippet[:100]  # Limit length to 100 characters

            # Encode the snippet for use in the URL
            encoded_text = urllib.parse.quote(highlight_snippet, safe='')
            modified_url = f"{url}#:~:text={encoded_text}"

            # Convert content to PDF and highlight text
            pdf_path = convert_to_pdf(url, content, top_match_text, modified_url)

            # Generate summary
            summary = generate_summary(content)

            return {
                "url": url,
                "matchPercentage": match_percentage,
                "pdfPath": pdf_path,
                "summary": summary
            }
        else:
            return {"url": url, "matchPercentage": 0}

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {"url": url, "matchPercentage": 0}

def convert_to_pdf(url, content, highlight_text, link_url):
    pdf_path = f"{url.replace('https://', '').replace('/', '_')}.pdf"

    # Generate multi-page PDF from content
    pdfkit.from_string(content, pdf_path, configuration=config)

    # Create a new file for highlighted PDF
    highlighted_pdf_path = f"highlighted_{url.replace('https://', '').replace('/', '_')}.pdf"
    highlight_text_in_pdf(pdf_path, highlighted_pdf_path, highlight_text, link_url)
    return highlighted_pdf_path

def highlight_text_in_pdf(original_pdf_path, highlighted_pdf_path, highlight_text, link_url):
    doc = fitz.open(original_pdf_path)
    for page in doc:
        text_instances = page.search_for(highlight_text)
        for inst in text_instances:
            # Highlight the text
            highlight = page.add_highlight_annot(inst)
            highlight.update()

            # Add a link annotation to the highlighted text
            link = {
                "kind": fitz.LINK_URI,
                "from": inst,
                "uri": link_url,
            }
            page.insert_link(link)

    # Save the modified PDF to a new file
    doc.save(highlighted_pdf_path, garbage=4, deflate=True)
    doc.close()

def generate_summary(text, max_sentences=5):
    # Tokenize the text
    stopWords = set(stopwords.words("english"))
    words = word_tokenize(text)

    # Create a frequency table of words
    freqTable = dict()
    for word in words:
        word = word.lower()
        if word in stopWords:
            continue
        if word.isalnum():
            freqTable[word] = freqTable.get(word, 0) + 1

    # Tokenize sentences
    sentences = sent_tokenize(text)
    sentenceValue = dict()

    # Calculate the score of each sentence
    for sentence in sentences:
        for wordValue in freqTable:
            if wordValue in sentence.lower():
                sentenceValue[sentence] = sentenceValue.get(sentence, 0) + freqTable[wordValue]

    # Calculate the average score
    sumValues = sum(sentenceValue.values())
    average = int(sumValues / len(sentenceValue))

    # Generate the summary
    summary = ''
    sentence_count = 0
    for sentence in sentences:
        if sentence in sentenceValue and sentenceValue[sentence] > (1.2 * average):
            summary += " " + sentence
            sentence_count += 1
            if sentence_count >= max_sentences:
                break

    return summary.strip()

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query', '')
    print("Received request with data:", data)

    urls = google_search(query)
    results = []

    for url in urls:
        result = scrape_and_find_relevant_content(url, query)
        if result['matchPercentage'] > 0:
            results.append(result)

    if results:
        return jsonify({"results": results}), 200
    else:
        return jsonify({"message": "No relevant content found"}), 404

@app.route('/download-pdf/<path:pdf_name>', methods=['GET'])
def download_pdf(pdf_name):
    return send_file(pdf_name, as_attachment=False, mimetype='application/pdf')

if __name__ == "__main__":
    app.run(port=5000)
