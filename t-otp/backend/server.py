from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import qrcode
from io import BytesIO
import base64
from qrng_key import generate_secret_key
from pqcrypto.kem.mceliece6688128 import encrypt, decrypt, generate_keypair

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})


# just a test api to check if backend is working
@app.route('/api/hello', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello from Python API!"})

@app.route("/generate_qr", methods=['GET', 'POST'])
def generate_qr():
    try:
        print("Received request")  # Debug log
        # Get data from request
        if request.method == 'POST':
            data = generate_secret_key()
            print(f"Received data: {data}")  # Debug log
        else:
            data = 'Default QR Code'
            
        # Generate QR code
        qr = qrcode.make(data)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)
        
        # Convert to base64
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            "qr": f"data:image/png;base64,{img_str}"
        })
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/pqc", methods=['GET'])
def pqc():
    # Step 1: Generate keypair
    public_key, secret_key = generate_keypair()

    # Step 2: Encapsulate with public key (client side)
    ciphertext, shared_secret_client = encrypt(public_key)

    # Step 3: Decapsulate with secret key (server side)
    shared_secret_server = decrypt(ciphertext, secret_key)

    # Debug check
    assert shared_secret_client == shared_secret_server

    return jsonify({
        "public_key_len": len(public_key),
        "ciphertext_len": len(ciphertext),
        "shared_secret": shared_secret_server.hex()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)