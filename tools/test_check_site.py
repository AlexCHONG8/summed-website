#!/usr/bin/env python3
"""Tests for tools/check_site.py — run from repo root: python3 tools/test_check_site.py"""
import subprocess
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


class TestChecker(unittest.TestCase):
    def run_checker(self, page):
        r = subprocess.run(
            [sys.executable, 'tools/check_site.py', page],
            capture_output=True, text=True, timeout=180, cwd=REPO,
        )
        return r.returncode, r.stdout

    def test_good_page_passes(self):
        code, out = self.run_checker('tools/fixtures/good.html')
        self.assertEqual(code, 0, f"exit {code}\n{out}")
        self.assertIn('ALL PASS', out)

    def test_horizontal_overflow_fails(self):
        code, out = self.run_checker('tools/fixtures/bad_overflow.html')
        self.assertEqual(code, 1, f"exit {code}\n{out}")
        self.assertIn('H-OVERFLOW', out)

    def test_forbidden_content_fails(self):
        code, out = self.run_checker('tools/fixtures/bad_content.html')
        self.assertEqual(code, 1, f"exit {code}\n{out}")
        self.assertIn('CONTENT-POLICY', out)
        self.assertIn('multtiject', out.lower())
        self.assertIn('已上市', out)

    def test_broken_image_fails(self):
        code, out = self.run_checker('tools/fixtures/bad_img.html')
        self.assertEqual(code, 1, f"exit {code}\n{out}")
        self.assertIn('IMG', out)


if __name__ == '__main__':
    unittest.main()
