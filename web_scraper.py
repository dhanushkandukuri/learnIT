from googlesearch import search
import requests
from bs4 import BeautifulSoup
import spacy


nlp = spacy.load('en_core_web_md')

def find_relevant_content(query, content):
    """Find the most relevant sentences in the content based on the user's query."""
    # Process the query and content with spaCy
    query_doc = nlp(query)
    content_doc = nlp(content)

    # Split content into sentences
    sentences = list(content_doc.sents)

    # Calculate similarity between the query and each sentence
    similarity_scores = []
    for sentence in sentences:
        similarity = query_doc.similarity(sentence)
        similarity_scores.append((sentence.text, similarity))

    # Sort sentences by similarity score in descending order
    similarity_scores.sort(key=lambda x: x[1], reverse=True)

    # Return the top N relevant sentences (e.g., top 3)
    top_sentences = [sentence for sentence, score in similarity_scores[:3]]
    return top_sentences


def get_search_results(query, num_results=5):
    """Perform a Google search and return a list of URLs."""
    urls = []
    try:
        # Perform Google search
        for url in search(query, num_results=num_results):
            urls.append(url)
    except Exception as e:
        print(f"An error occurred during the search: {e}")
    return urls

def scrape_article_content(url):
    """Scrape the main content of an article from a given URL."""
    try:
        # Send an HTTP request to the URL
        response = requests.get(url)
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try to find the main content using specific tags
        main_content = soup.find('main')  # Look for <main> tag first
        if main_content is None:
            main_content = soup.find('article')  # If <main> not found, look for <article> tag
        if main_content is None:
            main_content = soup.find('div', {'class': 'content'})  # Fallback to a common class name

        # If main content is found, extract text from it
        if main_content:
            paragraphs = main_content.find_all('p')  # Extract all paragraphs from the main content
        else:
            # If no main content found, fallback to extracting all <p> tags
            paragraphs = soup.find_all('p')

        # Combine the text of all paragraphs
        article_content = " ".join([para.text for para in paragraphs])
        return article_content
    except Exception as e:
        print(f"An error occurred while scraping {url}: {e}")
        return ""


def main():
    # Step 1: Get the user's search query
    query = input("Enter your search query: ")
    
    # Step 2: Get search results for the query
    urls = get_search_results(query)
    
    # Step 3: Scrape the content of each URL
    for url in urls:
        print(f"Scraping content from: {url}")
        content = scrape_article_content(url)

        if content:
            print(f"Finding relevant content for query: '{query}'")
            relevant_content = find_relevant_content(query, content)
            print(f"Top relevant content from {url}:\n")
            for i, sentence in enumerate(relevant_content, start=1):
                print(f"{i}. {sentence}\n")
        else:
            print("No content found.")


        
        print(f"Content from {url}:\n{content[:500]}...")  # Print the first 500 characters for brevity

if __name__ == "__main__":
    main()
