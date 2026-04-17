#!/usr/bin/env python3
from pathlib import Path
import sys
from html.parser import HTMLParser

REPO_ROOT = Path(__file__).resolve().parents[1]
IGNORE_DIRS = {".git", "node_modules", "dist"}


def iter_html_files():
    for html_file in REPO_ROOT.rglob("*.html"):
        rel_parts = set(html_file.relative_to(REPO_ROOT).parts)
        if rel_parts & IGNORE_DIRS:
            continue
        yield html_file


def parse_srcset(srcset_value: str):
    values = []
    for item in srcset_value.split(","):
        candidate = item.strip()
        if not candidate:
            continue
        values.append(candidate.split()[0])
    return values


def is_external(url: str):
    value = url.strip().lower()
    return value.startswith(
        (
            "http://",
            "https://",
            "//",
            "data:",
            "mailto:",
            "tel:",
            "javascript:",
            "#",
        )
    )


def normalize(url: str):
    return url.split("#", 1)[0].split("?", 1)[0].strip()


def resolve_local_path(raw_url: str, html_file: Path):
    cleaned = normalize(raw_url)
    if cleaned.startswith("/"):
        return REPO_ROOT / cleaned.lstrip("/")
    return (html_file.parent / cleaned).resolve()


class ImageReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attr_map = dict(attrs)

        if tag == "img":
            src = attr_map.get("src")
            if src:
                self.references.append(("img src", src))

        if tag == "source":
            src = attr_map.get("src")
            if src:
                self.references.append(("source src", src))

            srcset = attr_map.get("srcset")
            if srcset:
                for value in parse_srcset(srcset):
                    self.references.append(("source srcset", value))


def collect_image_references(html_file: Path):
    parser = ImageReferenceParser()
    parser.feed(html_file.read_text(encoding="utf-8"))
    return parser.references


def main():
    missing = []
    checked_count = 0

    for html_file in iter_html_files():
        for ref_type, raw_url in collect_image_references(html_file):
            if is_external(raw_url):
                continue

            target = resolve_local_path(raw_url, html_file)
            checked_count += 1

            try:
                target.relative_to(REPO_ROOT)
            except ValueError:
                missing.append((html_file, ref_type, raw_url, "resolves outside repository"))
                continue

            if not target.exists():
                missing.append((html_file, ref_type, raw_url, "file not found"))
            elif target.is_dir():
                missing.append((html_file, ref_type, raw_url, "expected file, found directory"))

    if missing:
        print("Image loading check failed. Broken image references found:\n")
        for html_file, ref_type, raw_url, reason in missing:
            rel_html = html_file.relative_to(REPO_ROOT)
            print(f"- {rel_html} [{ref_type}] -> {raw_url} ({reason})")
        return 1

    print(f"Image loading check passed. Verified {checked_count} local image references.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
