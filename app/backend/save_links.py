from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 


# Path to the JSON file where the links will be saved
links_file = 'links.json'

# Read the existing links from the JSON file
def read_links():
    if os.path.exists(links_file):
        with open(links_file, 'r') as file:
            return json.load(file)
    return []

# Save the updated links to the JSON file
def save_links(links):
    with open(links_file, 'w') as file:
        json.dump(links, file, indent=4)

# Route to get the links
@app.route('/links.json', methods=['GET'])
def get_links():
    links = read_links()  # Ensure this function returns valid JSON
    return jsonify(links)

# Route to save new links (Make sure it's only defined once)
@app.route('/save-links', methods=['POST'])
def save_new_links():
    data = request.get_json()  # Get the list of links from the request body
    save_links(data)  # Save the updated list of links
    return jsonify({"message": "Links saved successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True)