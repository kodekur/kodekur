#!/usr/bin/env python3
import email
import os
import re
import sys
from email import policy
from html.parser import HTMLParser
from urllib.parse import urlparse


class ImageKodParser(HTMLParser):
    """Extract mapping between googleusercontent image src and kod from HTML tables."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_tr = False
        self.in_td = False
        self.current_cells = []
        self.current_cell = None
        self.mapping = {}

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.in_tr = True
            self.current_cells = []
        elif tag == "td" and self.in_tr:
            self.in_td = True
            self.current_cell = {"text_parts": [], "images": []}
        elif self.in_td and tag == "img":
            attrs_dict = dict(attrs)
            src = attrs_dict.get("src") or attrs_dict.get("data-src")
            if src:
                self.current_cell["images"].append(src.strip())
        elif self.in_td and tag == "br" and self.current_cell is not None:
            self.current_cell["text_parts"].append("\n")

    def handle_startendtag(self, tag, attrs):
        # handle <img ... /> style tags
        self.handle_starttag(tag, attrs)

    def handle_data(self, data):
        if self.in_td and self.current_cell is not None:
            self.current_cell["text_parts"].append(data)

    def handle_endtag(self, tag):
        if tag == "td" and self.in_td:
            text = "".join(self.current_cell["text_parts"]).strip()
            self.current_cell["text"] = text
            self.current_cells.append(self.current_cell)
            self.current_cell = None
            self.in_td = False
        elif tag == "tr" and self.in_tr:
            for idx, cell in enumerate(self.current_cells):
                imgs = cell.get("images") or []
                for src in imgs:
                    if "googleusercontent" in src:
                        if idx + 1 < len(self.current_cells):
                            kod_text = self.current_cells[idx + 1].get("text", "").strip()
                            if kod_text:
                                self.mapping[src] = kod_text
            self.current_cells = []
            self.in_tr = False


def sanitize_code(code):
    if not code:
        return ""
    cleaned = code.strip().replace("\\", "_").replace("/", "_")
    cleaned = re.sub(r"\s+", "_", cleaned)
    cleaned = re.sub(r"[^\w.\-]+", "_", cleaned, flags=re.UNICODE)
    return cleaned.strip("._")


def build_variants(url):
    if not url:
        return set()
    variants = set()
    candidate = url.strip()
    if not candidate:
        return set()
    variants.add(candidate)
    no_fragment = candidate.split("#", 1)[0]
    variants.add(no_fragment)
    no_query = no_fragment.split("?", 1)[0]
    variants.add(no_query)
    simplified = re.sub(r"=w\d+-h\d+(-[a-z]+)?", "", no_query)
    variants.add(simplified)

    parsed = urlparse(candidate)
    netloc_path = ""
    if parsed.netloc:
        netloc_path = parsed.netloc + parsed.path
        variants.add(netloc_path)
        simplified_path = re.sub(r"=w\d+-h\d+(-[a-z]+)?", "", parsed.path or "")
        if simplified_path:
            variants.add(parsed.netloc + simplified_path)
    elif parsed.path:
        variants.add(parsed.path)
        variants.add(re.sub(r"=w\d+-h\d+(-[a-z]+)?", "", parsed.path))

    lowered = {v.lower() for v in variants if v}
    variants |= lowered
    return {v for v in variants if v}


def collect_kod_lookup(msg):
    html_parts = []
    for part in msg.walk():
        if part.get_content_type() == "text/html":
            try:
                html_parts.append(part.get_content())
            except LookupError:
                payload = part.get_payload(decode=True)
                if payload is not None:
                    try:
                        html_parts.append(payload.decode(part.get_content_charset() or "utf-8", errors="ignore"))
                    except (LookupError, UnicodeDecodeError):
                        html_parts.append(payload.decode("utf-8", errors="ignore"))

    parser = ImageKodParser()
    for html in html_parts:
        parser.feed(html)

    kod_lookup = {}
    for src, kod in parser.mapping.items():
        sanitized = sanitize_code(kod)
        if not sanitized:
            continue
        for variant in build_variants(src):
            kod_lookup.setdefault(variant, sanitized)
    return kod_lookup


def guess_extension(part):
    subtype = part.get_content_subtype()
    return {
        "jpeg": ".jpg",
        "jpg": ".jpg",
        "png": ".png",
        "gif": ".gif",
        "svg+xml": ".svg",
        "webp": ".webp",
    }.get(subtype, ".bin")


def main():
    if len(sys.argv) < 2:
        print("Usage: python unpack_mhtml.py file.mhtml [output_dir]")
        return 1

    mhtml_path = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "images"
    os.makedirs(out_dir, exist_ok=True)

    with open(mhtml_path, "rb") as fh:
        msg = email.message_from_binary_file(fh, policy=policy.default)

    kod_lookup = collect_kod_lookup(msg)

    taken = set()
    for part in msg.walk():
        if part.get_content_maintype() != "image":
            continue

        location = part.get("Content-Location") or ""
        original_name = (
            location
            or part.get_filename()
            or part.get("Content-ID", "").strip("<>")
            or "image"
        )

        kod_name = None
        if "googleusercontent" in location.lower():
            for variant in build_variants(location):
                kod_name = kod_lookup.get(variant)
                if kod_name:
                    break

        if kod_name:
            base = kod_name
            ext = ".jpg"
        else:
            cleaned = re.sub(r"^[a-z]+://", "", original_name, flags=re.I)
            path = urlparse(cleaned).path or cleaned
            path = path.strip("/\\")
            path = path.replace("/", "_").replace("\\", "_")
            base, ext = os.path.splitext(path)
            if not ext:
                ext = guess_extension(part)
            if not base:
                base = "image"

        candidate = f"{base}{ext}"
        idx = 1
        while candidate in taken:
            candidate = f"{base}_{idx}{ext}"
            idx += 1
        taken.add(candidate)

        payload = part.get_payload(decode=True)
        if payload:
            with open(os.path.join(out_dir, candidate), "wb") as img_file:
                img_file.write(payload)
            print(f"Saved {candidate}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
