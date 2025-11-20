# core/utils.py
from Crypto.Cipher import AES
import base64
from django.conf import settings

def _get_secret():
    secret = getattr(settings, 'AES_SECRET', None)
    if not secret:
        raise RuntimeError("AES_SECRET not set in settings")
    b = secret.encode() if isinstance(secret, str) else secret
    # pad/truncate to 32 bytes for AES-256
    if len(b) < 32:
        b = b.ljust(32, b'\0')
    return b[:32]

def encrypt_data(raw: str) -> str:
    secret = _get_secret()
    cipher = AES.new(secret, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(raw.encode('utf-8'))
    payload = cipher.nonce + tag + ciphertext
    return base64.b64encode(payload).decode('utf-8')

def decrypt_data(enc: str) -> str:
    secret = _get_secret()
    data = base64.b64decode(enc.encode('utf-8'))
    nonce, tag, ciphertext = data[:16], data[16:32], data[32:]
    cipher = AES.new(secret, AES.MODE_EAX, nonce)
    return cipher.decrypt_and_verify(ciphertext, tag).decode('utf-8')
