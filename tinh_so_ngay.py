from datetime import datetime


def so_ngay_giua_hai_moc(ngay_bat_dau: str, ngay_ket_thuc: str) -> int:
    dinh_dang = "%d/%m/%Y"
    moc_bat_dau = datetime.strptime(ngay_bat_dau, dinh_dang)
    moc_ket_thuc = datetime.strptime(ngay_ket_thuc, dinh_dang)

    return abs((moc_ket_thuc - moc_bat_dau).days) + 1


ngay_bat_dau = input("Nhap ngay bat dau (dd/mm/yyyy): ")
ngay_ket_thuc = input("Nhap ngay ket thuc (dd/mm/yyyy): ")

try:
    ket_qua = so_ngay_giua_hai_moc(ngay_bat_dau, ngay_ket_thuc)
    print(f"So ngay la: {ket_qua} ngay")
except ValueError:
    print("Ngay khong hop le. Vui long nhap theo dang dd/mm/yyyy.")