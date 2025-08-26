from flask import Flask, jsonify, request,send_file
from flask_cors import CORS
import qrcode
import io

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

@app.route('/generate_qr')
def generate_qr_code():
    data = "This is a sample qr"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    return send_file(img_byte_arr, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Run on port 5000