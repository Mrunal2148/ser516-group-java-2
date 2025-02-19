import os
import shutil
import subprocess
import re
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

links_file = 'links.json'

def clone_repo(repo_url: str, repo_path: str):
    """Clones a GitHub repository to a local directory."""
    if os.path.exists(repo_path):
        shutil.rmtree(repo_path)  
    subprocess.run(["git", "clone", repo_url, repo_path], check=True)

def get_code_files(repo_path: str, extensions=None):
    """Recursively gets all code files with specified extensions."""
    if extensions is None:
        extensions = [".py", ".js", ".jsx", ".ts", ".java"]

    code_files = []
    for root, _, files in os.walk(repo_path):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                code_files.append(os.path.join(root, file))
    return code_files

def calculate_comment_coverage(files):
    """Calculates the comment coverage for a list of code files."""
    total_lines = 0
    comment_lines = 0

    comment_patterns = {
        ".py": r"^\s*#",
        ".js": r"^\s*//",
        ".jsx": r"^\s*//",
        ".ts": r"^\s*//",
        ".java": r"^\s*//",
    }

    for file_path in files:
        extension = os.path.splitext(file_path)[1]
        if extension not in comment_patterns:
            continue

        pattern = comment_patterns[extension]
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            lines = file.readlines()
            total_lines += len(lines)
            comment_lines += sum(1 for line in lines if re.match(pattern, line))

    return (comment_lines / total_lines) * 100 if total_lines > 0 else 0


# Routes
@app.route("/analyze", methods=["POST"])
def analyze_repository():
    data = request.get_json()
    repo_url = data.get("repo_url")

    if not repo_url:
        return jsonify({"error": "GitHub repository URL is required"}), 400

    repo_name = repo_url.rstrip("/").split("/")[-1]
    repo_path = f"/tmp/{repo_name}"  

    try:
        clone_repo(repo_url, repo_path)
        code_files = get_code_files(repo_path)
        coverage = calculate_comment_coverage(code_files)

        shutil.rmtree(repo_path)  

        return jsonify({"coverage": coverage})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def read_links():
    if os.path.exists(links_file):
        with open(links_file, 'r') as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return [] 
    return []

def save_links(links):
    try:
        with open(links_file, 'w') as file:
            json.dump(links, file, indent=4)
        print("Links saved successfully!")
    except Exception as e:
        print("Error writing to file:", e)

@app.route('/links.json', methods=['GET'])
def get_links():
    links = read_links()
    return jsonify(links)

@app.route('/save-links', methods=['POST'])
def save_new_links():
    data = request.get_json()
    if not isinstance(data, list):  
        return jsonify({"error": "Invalid data format, expected a list"}), 400

    save_links(data)  
    return jsonify({"message": "Links saved successfully!"}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5005)
