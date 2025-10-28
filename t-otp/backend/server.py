from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import qrcode
from io import BytesIO
import base64
import time
import pyotp
from qrng_key import generate_secret_key
from pqcrypto.kem.mceliece6688128 import encrypt, decrypt, generate_keypair
from hashlib import sha256

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

def simple_xor(data: bytes, key: bytes) -> bytes:
    return bytes([d ^ key[i % len(key)] for i, d in enumerate(data)])

# just a test api to check if backend is working
@app.route('/api/hello', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello from Python API!"})

# QR Code generation endpoint
@app.route("/generate_qr", methods=["POST"])
def generate_qr():
    try:
        otp_seed = generate_secret_key().encode()  # Generate OTP seed using QRNG
        public_key, secret_key = generate_keypair()
        ciphertext, shared_secret_client = encrypt(public_key)
        shared_secret_server = decrypt(secret_key, ciphertext)
        assert shared_secret_client == shared_secret_server, "Shared secret mismatch!"
        print(f"Shared Secret: {shared_secret_client.hex()}")
        ciphertext_b64 = base64.b64encode(ciphertext).decode()

        otp_seed_b32 = base64.b32encode(otp_seed).decode()
        qr = qrcode.make(f"otpauth://totp/AuthZilla?secret={otp_seed_b32}&issuer=AuthZilla&ciphertext={ciphertext_b64}")

        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)  
        img_str = base64.b64encode(buffer.getvalue()).decode()

        return jsonify({
            "qr": f"data:image/png;base64,{img_str}",
            "shared_secret": base64.b64encode(otp_seed).decode()
        })
    except Exception as e:
        print(f"Error in PQC: {e}")
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

@app.route("/server-time", methods=["GET"])
def server_time():
    return jsonify({
        "timestamp": int(time.time())
    })

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.get_json()
        otp_code = data.get("otp")
        secret_b64 = data.get("secret")
        
        if not otp_code or not secret_b64:
            return jsonify({"valid": False, "error": "Missing OTP code or secret"}), 400
        
        # Decode the secret from base64
        secret_bytes = base64.b64decode(secret_b64)
        
        # Convert to base32 for TOTP
        secret_b32 = base64.b32encode(secret_bytes).decode()
        
        # Create TOTP verifier
        totp = pyotp.TOTP(secret_b32)
        
        # for debuggig
        print(f"DEBUG: Server expects the code: {totp.now()}")

        # Verify with a 1-step tolerance (30 seconds before/after)
        is_valid = totp.verify(otp_code)
        
        return jsonify({"valid": is_valid})
    except Exception as e:
        print(f"OTP verification error: {e}")
        return jsonify({"valid": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)