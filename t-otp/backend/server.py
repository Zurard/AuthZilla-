from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/hello', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello from Python API!"})

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json
    if data:
        print(f"Received data: {data}")
        return jsonify({"status": "success", "received_data": data}), 200
    else:
        return jsonify({"status": "error", "message": "No data received"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Run on port 5000