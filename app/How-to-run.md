## Frontend: ..\backend>
npm i
npm run
npm start

## Backend: ..\frontend>
# Set-up python venev, flask
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
pip install flask flask-cors
python save_links.py
