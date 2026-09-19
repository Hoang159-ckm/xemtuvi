# Backend thanh toán VCB

Backend nằm trong `server.py`, chạy cùng frontend để endpoint `/api/payments/verify` không còn báo mất kết nối.

## Chạy local

```powershell
python -m pip install -r requirements.txt
$env:VCB_ACCOUNT_NUMBER="SO_TAI_KHOAN_VCB"
$env:PAYMENT_WEBHOOK_SECRET="mot-bi-mat-dai-va-ngau-nhien"
python .\server.py
```

Mở `http://127.0.0.1:5000` thay vì mở file HTML bằng `file:///`.

## Luồng xác nhận

1. Ngân hàng hoặc nhà cung cấp webhook được ủy quyền gửi `POST /api/payments/webhook`.
2. Backend kiểm tra chữ ký HMAC, ngân hàng `VCB`, tài khoản nhận và số tiền đúng `50000`.
3. Giao dịch hợp lệ được lưu vào SQLite `payments.db`.
4. Frontend gửi mã giao dịch tới `POST /api/payments/verify`; chỉ giao dịch đã lưu mới mở khóa nội dung.

## MoMo IPN webhook

Đặt URL IPN trong cấu hình MoMo là:$env:MOMO_ACCESS_KEY="your-access-key"
$env:MOMO_SECRET_KEY="your-secret-key"
$env:MOMO_PARTNER_CODE="your-partner-code"

```text
https://your-domain.com/api/payments/momo/webhook
```

Thêm `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY` và `MOMO_PARTNER_CODE` vào biến môi trường. Backend dùng chuỗi ký IPN chuẩn của MoMo và HMAC-SHA256 để xác minh `signature`, chỉ lưu giao dịch có `resultCode = 0` và số tiền đúng `50000`.

MoMo thường gửi `transId` và `orderId`; backend ưu tiên `transId` làm mã giao dịch để người dùng nhập khi mở khóa.

Payload webhook tối thiểu:

```json
{
  "transactionCode": "FT123456789",
  "amount": 50000,
  "bankCode": "VCB",
  "accountNumber": "1345838627",
  "content": "LASO FT123456789"
}
```

Header chữ ký:

```text
X-Webhook-Signature: HMAC_SHA256(PAYMENT_WEBHOOK_SECRET, raw_request_body)
```

Vietcombank không có API công khai để website tự đăng nhập và đọc số dư. Khi triển khai thật, cần đăng ký dịch vụ API/webhook trực tiếp với ngân hàng hoặc dùng một nhà cung cấp trung gian được cấp quyền, sau đó cấu hình họ gọi endpoint webhook này. Không đưa mật khẩu Internet Banking vào mã nguồn.

```json
{
  "resultCode": 0,
  "verified": true
}
```
