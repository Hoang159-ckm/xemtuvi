import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("PAYMENT_DATABASE", BASE_DIR / "payments.db"))
EXPECTED_AMOUNT = 50_000
BANK_CODE = "VCB"
BANK_ACCOUNT = os.getenv("VCB_ACCOUNT_NUMBER", "").strip()
WEBHOOK_SECRET = os.getenv("PAYMENT_WEBHOOK_SECRET", "").strip()
MOMO_CODE = "MOMO"
MOMO_ACCESS_KEY = os.getenv("MOMO_ACCESS_KEY", "").strip()
MOMO_SECRET_KEY = os.getenv("MOMO_SECRET_KEY", "").strip()
MOMO_PARTNER_CODE = os.getenv("MOMO_PARTNER_CODE", "").strip()

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": os.getenv("ALLOWED_ORIGIN", "*")}})


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_code TEXT NOT NULL UNIQUE,
                amount INTEGER NOT NULL,
                bank_code TEXT NOT NULL,
                account_number TEXT NOT NULL,
                content TEXT,
                verified_at TEXT NOT NULL
            )
            """
        )


def verify_webhook_signature(raw_body):
    if not WEBHOOK_SECRET:
        return False
    received = request.headers.get("X-Webhook-Signature", "")
    expected = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(received, expected)


def normalize_payment(payload):
    transaction_code = str(
        payload.get("transactionCode")
        or payload.get("referenceCode")
        or payload.get("id")
        or ""
    ).strip()
    bank_code = str(payload.get("bankCode") or payload.get("gateway") or BANK_CODE).upper().strip()
    account_number = str(
        payload.get("accountNumber") or payload.get("account") or ""
    ).strip()
    amount = payload.get("amount")
    try:
        amount = int(float(amount))
    except (TypeError, ValueError):
        amount = 0
    content = str(payload.get("content") or payload.get("description") or "").strip()
    return transaction_code, bank_code, account_number, amount, content


def momo_signature_string(payload):
    fields = (
        "accessKey", "amount", "extraData", "message", "orderId", "orderInfo",
        "orderType", "partnerCode", "payType", "requestId", "responseTime",
        "resultCode", "transId",
    )
    return "&".join(f"{field}={payload.get(field, '')}" for field in fields)


def verify_momo_signature(payload):
    received = str(payload.get("signature") or "").strip()
    if not received or not MOMO_ACCESS_KEY or not MOMO_SECRET_KEY:
        return False
    if payload.get("accessKey") != MOMO_ACCESS_KEY:
        return False
    expected = hmac.new(
        MOMO_SECRET_KEY.encode("utf-8"),
        momo_signature_string(payload).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(received, expected)


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/wedthoi/")
def weather_app():
    return send_from_directory(BASE_DIR / "wedthoi", "index.html")


@app.post("/api/payments/webhook")
def payment_webhook():
    raw_body = request.get_data()
    if not verify_webhook_signature(raw_body):
        return jsonify({"verified": False, "message": "Webhook signature không hợp lệ."}), 401

    payload = request.get_json(silent=True) or {}
    transaction_code, bank_code, account_number, amount, content = normalize_payment(payload)
    if not transaction_code or amount != EXPECTED_AMOUNT:
        return jsonify({"verified": False, "message": "Giao dịch không đúng mã hoặc số tiền."}), 400
    if bank_code != BANK_CODE:
        return jsonify({"verified": False, "message": "Sai ngân hàng nhận tiền."}), 400
    if BANK_ACCOUNT and account_number and account_number != BANK_ACCOUNT:
        return jsonify({"verified": False, "message": "Sai tài khoản nhận tiền."}), 400

    verified_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO payments
                (transaction_code, amount, bank_code, account_number, content, verified_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (transaction_code, amount, bank_code, account_number, content, verified_at),
        )
    return jsonify({"verified": True, "transactionCode": transaction_code})


@app.post("/api/payments/momo/webhook")
def momo_webhook():
    payload = request.get_json(silent=True) or {}
    if not verify_momo_signature(payload):
        return jsonify({"resultCode": 97, "message": "MoMo signature không hợp lệ."}), 401
    if MOMO_PARTNER_CODE and payload.get("partnerCode") != MOMO_PARTNER_CODE:
        return jsonify({"resultCode": 1, "message": "Sai MoMo partnerCode."}), 400
    if str(payload.get("resultCode")) != "0":
        return jsonify({"resultCode": 0, "message": "Đã nhận trạng thái giao dịch thất bại."})

    transaction_code = str(payload.get("transId") or payload.get("orderId") or "").strip()
    amount = payload.get("amount")
    try:
        amount = int(float(amount))
    except (TypeError, ValueError):
        amount = 0
    if not transaction_code or amount != EXPECTED_AMOUNT:
        return jsonify({"resultCode": 2, "message": "Giao dịch MoMo không đúng mã hoặc số tiền."}), 400

    order_id = str(payload.get("orderId") or "").strip()
    content = str(payload.get("orderInfo") or payload.get("message") or "").strip()
    verified_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR IGNORE INTO payments
                (transaction_code, amount, bank_code, account_number, content, verified_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (transaction_code, amount, MOMO_CODE, MOMO_PARTNER_CODE or order_id, content, verified_at),
        )
    return jsonify({"resultCode": 0, "message": "success", "verified": True, "transId": transaction_code})


@app.post("/api/payments/verify")
def verify_payment():
    payload = request.get_json(silent=True) or {}
    transaction_code = str(payload.get("transactionCode") or "").strip()
    amount = payload.get("amount")
    try:
        amount = int(float(amount))
    except (TypeError, ValueError):
        amount = 0

    if not transaction_code or amount != EXPECTED_AMOUNT:
        return jsonify({"verified": False, "message": "Mã giao dịch hoặc số tiền không hợp lệ."}), 400

    with get_connection() as connection:
        payment = connection.execute(
            """
            SELECT transaction_code, amount, bank_code, verified_at
            FROM payments
            WHERE transaction_code = ? AND amount = ? AND bank_code IN (?, ?)
            """,
            (transaction_code, EXPECTED_AMOUNT, BANK_CODE, MOMO_CODE),
        ).fetchone()

    if payment is None:
        return jsonify({"verified": False, "message": "Chưa tìm thấy giao dịch VCB hoặc MoMo hợp lệ."}), 404
    return jsonify({"verified": True, "transactionCode": payment["transaction_code"], "verifiedAt": payment["verified_at"]})


@app.get("/api/health")
def health():
    return jsonify({
        "ok": True,
        "bank": BANK_CODE,
        "accountConfigured": bool(BANK_ACCOUNT),
        "momoConfigured": bool(MOMO_ACCESS_KEY and MOMO_SECRET_KEY and MOMO_PARTNER_CODE),
    })


initialize_database()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=False)
