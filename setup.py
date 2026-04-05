#!/usr/bin/env python3
from pathlib import Path
import shutil
import sys
import re

DEFAULT_SUPABASE_URL = "https://hmzowbcufyobdfwdfcaw.supabase.co"
DEFAULT_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtem93YmN1ZnlvYmRmd2RmY2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzk1OTQsImV4cCI6MjA5MDM1NTU5NH0."
    "EXsVJ1vQjkPB8YgcHJjTpRvDWBzlKqI8tkD56I3eKlk"
)
DEFAULT_WEBSITE = "https://examalite.pages.dev"
DEFAULT_EMAIL = "nguyenhuuhoa@proton.me"

TARGET_EXTENSIONS = {".html", ".js"}


def normalize_supabase_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("https://"):
        raise ValueError("Supabase project URL phải bắt đầu bằng https://")
    return url.rstrip("/")


def normalize_website(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        raise ValueError("Website dự án phải bắt đầu bằng http")
    return url.rstrip("/")


def prompt_nonempty(prompt: str) -> str:
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("Giá trị không được để trống.")


def prompt_supabase_url() -> str:
    while True:
        try:
            return normalize_supabase_url(
                prompt_nonempty("Nhập Supabase project URL: ")
            )
        except ValueError as e:
            print(e)


def prompt_anon_key() -> str:
    return prompt_nonempty("Nhập Supabase public anon key: ")


def prompt_website() -> str:
    while True:
        try:
            return normalize_website(
                prompt_nonempty("Nhập website dự án: ")
            )
        except ValueError as e:
            print(e)


def prompt_email() -> str:
    return prompt_nonempty("Nhập email: ")


def copy_dist_to_output(script_dir: Path) -> Path:
    dist_dir = script_dir / "dist"
    output_dir = script_dir / "output"

    if not dist_dir.exists() or not dist_dir.is_dir():
        raise FileNotFoundError(
            "Không tìm thấy thư mục dist trong cùng thư mục với script."
        )

    if output_dir.exists():
        shutil.rmtree(output_dir)

    shutil.copytree(dist_dir, output_dir)
    return output_dir


def collect_target_files(root: Path):
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in TARGET_EXTENSIONS:
            yield path


def replace_in_file(path: Path, replacements: dict[str, str]) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            text = path.read_text(encoding="utf-8-sig")
        except Exception:
            print(f"Bỏ qua file không đọc được: {path}")
            return False
    except Exception as e:
        print(f"Bỏ qua {path}: {e}")
        return False

    original = text

    for old, new in replacements.items():
        escaped_old = re.escape(old)

        # match cả dạng có "/" hoặc không
        pattern = rf"{escaped_old}/?"

        text = re.sub(pattern, new, text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True

    return False


def main():
    script_dir = Path(__file__).parent.resolve()

    print("Nhập thông tin mới cho cấu hình.")
    new_supabase_url = prompt_supabase_url()
    new_anon_key = prompt_anon_key()
    new_website = prompt_website()
    new_email = prompt_email()

    print("\nXác nhận thay đổi:")
    print(f"- Supabase project URL: {DEFAULT_SUPABASE_URL} -> {new_supabase_url}")
    print(f"- Public anon key: {DEFAULT_ANON_KEY[:24]}... -> {new_anon_key[:24]}...")
    print(f"- Website dự án: {DEFAULT_WEBSITE} -> {new_website}")
    print(f"- Email: {DEFAULT_EMAIL} -> {new_email}")

    confirm = input("\nGõ yes để xác nhận thay đổi: ").strip().lower()
    if confirm != "yes":
        print("Đã hủy.")
        sys.exit(0)

    try:
        output_dir = copy_dist_to_output(script_dir)
    except Exception as e:
        print(f"Lỗi khi copy dist sang output: {e}")
        sys.exit(1)

    replacements = {
        DEFAULT_SUPABASE_URL: new_supabase_url,
        DEFAULT_ANON_KEY: new_anon_key,
        DEFAULT_WEBSITE: new_website,
        DEFAULT_EMAIL: new_email,
    }

    changed_files = 0
    scanned_files = 0

    for file_path in collect_target_files(output_dir):
        scanned_files += 1
        if replace_in_file(file_path, replacements):
            changed_files += 1
            print(f"Đã cập nhật: {file_path}")

    print("\nHoàn tất.")
    print(f"Đã copy dist -> output tại: {output_dir}")
    print(f"Đã quét {scanned_files} file, thay đổi {changed_files} file.")

    if changed_files == 0:
        print("⚠️ Không tìm thấy cấu hình mặc định để thay. Có thể đã được cấu hình trước đó.")


if __name__ == "__main__":
    main()
