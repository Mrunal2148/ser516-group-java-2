from flask import Flask, request, jsonify
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 



links_file = 'links.json'


def read_links():
    if os.path.exists(links_file):
        with open(links_file, 'r') as file:
            return json.load(file)
    return []


def save_links(links):
    with open(links_file, 'w') as file:
        json.dump(links, file, indent=4)


@app.route('/links.json', methods=['GET'])
def get_links():
    links = read_links()  
    return jsonify(links)


@app.route('/save-links', methods=['POST'])
def save_new_links():
    data = request.get_json()  
    save_links(data)  
    return jsonify({"message": "Links saved successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True)