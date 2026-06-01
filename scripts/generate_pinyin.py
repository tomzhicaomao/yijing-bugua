#!/usr/bin/env python3
"""
Phase 3: Generate pinyin for all 64 hexagram names.

Input:  hexagrams_translated.json
Output: src/data/hexagrams.json (final file)
"""

import json
import re
from pypinyin import pinyin, Style

INPUT_PATH = "hexagrams_translated.json"
OUTPUT_PATH = "../src/data/hexagrams.json"

# Characters in hexagram names that are known multi-tone in 易经 context
# format: char -> expected pinyin in context (for review output)
MULTI_TONE_EXPECTED = {
    "否": "pǐ",
    "屯": "zhūn",
    "觀": "guān",  # same as default
    "漸": "jiàn",  # same as default
    "蒙": "méng",  # same as default
    "解": "xiè",   # differs from default jie
}

# Manual overrides for incorrect pypinyin guesses (register & context-specific)
MANUAL_OVERRIDES = {
    "屯": "zhun",  # zhūn for 易经 (not tún)
    "否": "pi",    # pǐ for 易经 (not fǒu)
    "解": "xie",   # xiè for 易经 (not jiě)
}


def generate_pinyin(text: str) -> str:
    """Generate plain lowercase pinyin without tone marks."""
    # Apply manual overrides for specific names
    if text in MANUAL_OVERRIDES:
        return MANUAL_OVERRIDES[text]

    py = pinyin(text, style=Style.TONE3, neutral_tone_with_five=True)
    result = []
    for item in py:
        if item:
            s = item[0]
            s = re.sub(r'[0-9]+$', '', s)
            result.append(s)
    return ''.join(result)


def main():
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {len(data)} hexagrams from {INPUT_PATH}")

    multi_tone_found = []
    for k in sorted(data.keys(), key=int):
        h = data[k]
        name = h["name"]
        py = generate_pinyin(name)
        h["namePinyin"] = py
        for char, expected in MULTI_TONE_EXPECTED.items():
            if char in name:
                multi_tone_found.append((h["id"], name, char, py, expected))

    sorted_data = {str(k): data[k] for k in sorted(data.keys(), key=int)}
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)

    print(f"\n Final output: {OUTPUT_PATH}")
    print(f"  Hexagrams: {len(sorted_data)}")

    print(f"\n--- Pinyin sample ---")
    for seq_str in ["1", "2", "10", "25", "55", "64"]:
        h = data[seq_str]
        print(f"  #{h['id']} {h['name']}  {h['namePinyin']}")

    if multi_tone_found:
        print(f"\n MULTI-TONE CHARACTERS  PLEASE REVIEW:")
        for seq_id, name, char, generated, expected in multi_tone_found:
            print(f"  #{seq_id} {name}: auto={generated}, expected '{char}'={expected}")
    else:
        print(f"\n No multi-tone characters detected.")


if __name__ == "__main__":
    main()
