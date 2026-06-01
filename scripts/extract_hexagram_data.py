#!/usr/bin/env python3
"""
Phase 1: Extract classical hexagram text from Excel → structured intermediate JSON.

Input:  周易卦辞卦序.xls
Output: hexagrams_raw.json (64 entries, classical text only, modern fields = null)
"""

import json
import re
import unicodedata
import xlrd

EXCEL_PATH = "/Users/thomas/Library/Mobile Documents/com~apple~CloudDocs/Documents/周易卦辞卦序.xls"
OUTPUT_PATH = "hexagrams_raw.json"

TRIGRAM_MAP = {
    1: {"symbol": "☰", "name": "乾", "element": "天"},
    2: {"symbol": "☱", "name": "兌", "element": "澤"},
    3: {"symbol": "☲", "name": "離", "element": "火"},
    4: {"symbol": "☳", "name": "震", "element": "雷"},
    5: {"symbol": "☴", "name": "巽", "element": "風"},
    6: {"symbol": "☵", "name": "坎", "element": "水"},
    7: {"symbol": "☶", "name": "艮", "element": "山"},
    8: {"symbol": "☷", "name": "坤", "element": "地"},
}

LINE_NAME_RE = re.compile(r"^(初[六九]|[六九][二三四五]|上[六九]|用[六九])")


def nfkc(text: str) -> str:
    return unicodedata.normalize("NFKC", text)


def parse_judgment_and_image(raw_text: str) -> dict:
    """
    Parse 卦辭 text block → judgment, tuan (彖辞), image (大象).

    Format: judgment + 彖曰 + tuan + 象曰 + image [+ 文言曰 + wenyan]
    """
    text = nfkc(raw_text)
    text = re.sub(r"\n+", "\n", text).strip()

    # Split off 文言曰 if present (乾/坤 only)
    parts = text.split("文言曰", 1)
    core = parts[0]

    # judgment | 彖曰 tuan | 象曰 image
    if "彖曰" in core:
        judgment_part, rest = core.split("彖曰", 1)
        judgment = re.sub(r"\s+", "", judgment_part).strip()
        if "象曰" in rest:
            tuan_part, image_part = rest.split("象曰", 1)
            tuan = re.sub(r"\s+", " ", tuan_part).strip()
            image = re.sub(r"\s+", " ", image_part).strip()
        else:
            tuan = re.sub(r"\s+", " ", rest).strip()
            image = ""
    elif "象曰" in core:
        judgment_part, image_part = core.split("象曰", 1)
        judgment = re.sub(r"\s+", "", judgment_part).strip()
        tuan = ""
        image = re.sub(r"\s+", " ", image_part).strip()
    else:
        judgment = re.sub(r"\s+", "", core).strip()
        tuan = ""
        image = ""

    # Strip leading colon from image
    image = re.sub(r"^[：:]", "", image).strip()

    # 乾卦 special case: 象曰 section includes all 小象 after the 大象
    # Only keep the 大象: "天行健，君子以自强不息"
    if judgment.startswith("乾"):
        # Match the 大象 pattern: the first sentence before 小象 start
        dasheng_match = re.match(r"^(天行健[，,]\s*君子以自[彊强][不不]息[。！]?)", image)
        if dasheng_match:
            image = dasheng_match.group(1)

    return {"judgment": judgment, "tuan": tuan, "image": image}


def parse_line_text(raw_text: str) -> dict:
    """
    Parse a single line from 周易大象.

    Normal: 初六：履霜，坚冰至。\n象曰：履霜坚冰，阴始凝也。
    文言:   初九曰：「潜龙勿用。」 何谓也？\n子曰：...
    """
    text = nfkc(raw_text)
    name_match = LINE_NAME_RE.match(text)
    if not name_match:
        raise ValueError(f"Cannot parse line name from: {text[:80]}")
    name = name_match.group(1)
    rest = text[name_match.end() :].strip()

    if "象曰" in rest:
        parts = rest.split("象曰", 1)
        line_text = parts[0].strip()
        line_text = re.sub(r"^[：:]", "", line_text).strip()
        # Remove 何謂也 if present
        line_text = re.sub(r"何謂也.*$", "", line_text).strip()
        small_image = re.sub(r"^[：:]", "", parts[1].strip()).strip()
        return {"name": name, "text": line_text, "smallImage": small_image}
    else:
        # 文言 format (乾/坤 in 周易大象)
        line_text = rest
        guillemet_match = re.search(r"「([^」]+)」", line_text)
        if guillemet_match:
            line_text = guillemet_match.group(1)
        else:
            line_text = re.sub(r"何謂也.*$", "", line_text).strip()
            line_text = re.sub(r"^[：:]", "", line_text).strip()
        return {"name": name, "text": line_text, "smallImage": ""}


def run():
    print("Opening Excel...")
    wb = xlrd.open_workbook(EXCEL_PATH)

    # Step 1: Trigram mapping
    print("Loading trigrams...")

    # Step 2: Build base data from 64卦 sheet
    sheet_64gua = wb.sheet_by_name("64卦")
    hexagrams = {}
    for r in range(1, sheet_64gua.nrows):
        seq_val = sheet_64gua.cell_value(r, 5)
        name_val = sheet_64gua.cell_value(r, 6)
        if not seq_val or not name_val:
            continue
        seq = int(seq_val)
        upper_num = int(sheet_64gua.cell_value(r, 2))
        lower_num = int(sheet_64gua.cell_value(r, 4))
        name = nfkc(str(name_val).strip())
        upper_t = TRIGRAM_MAP.get(upper_num, {})
        lower_t = TRIGRAM_MAP.get(lower_num, {})
        hexagrams[seq] = {
            "id": seq,
            "name": name,
            "namePinyin": None,
            "trigramUpper": upper_t.get("symbol", "?"),
            "trigramLower": lower_t.get("symbol", "?"),
            "judgment": None,
            "judgmentModern": None,
            "tuan": None,
            "image": None,
            "imageModern": None,
            "lines": [],
        }
    print(f"  Base data: {len(hexagrams)} hexagrams")

    # Step 3: Parse judgment + image from 卦辭
    sheet_guaci = wb.sheet_by_name("卦辭")
    for r in range(1, sheet_guaci.nrows):
        seq_val = sheet_guaci.cell_value(r, 0)
        if not seq_val:
            continue
        seq = int(seq_val)
        raw_text = str(sheet_guaci.cell_value(r, 2))
        parsed = parse_judgment_and_image(raw_text)
        if seq in hexagrams:
            hexagrams[seq]["judgment"] = parsed["judgment"]
            hexagrams[seq]["tuan"] = parsed["tuan"]
            hexagrams[seq]["image"] = parsed["image"]
    print("  Parsed judgment & image")

    # Step 4: Parse lines from 周易大象
    sheet_daxiang = wb.sheet_by_name("周易大象")
    line_count = 0
    for r in range(1, sheet_daxiang.nrows):
        seq_val = sheet_daxiang.cell_value(r, 0)
        if not seq_val:
            continue
        seq = int(seq_val)
        raw_text = str(sheet_daxiang.cell_value(r, 4))
        if not raw_text.strip() or seq not in hexagrams:
            continue
        try:
            parsed_line = parse_line_text(raw_text)
            name = parsed_line["name"]
            pos_map = {
                "初六": 1, "初九": 1, "六二": 2, "九二": 2,
                "六三": 3, "九三": 3, "六四": 4, "九四": 4,
                "六五": 5, "九五": 5, "上六": 6, "上九": 6,
            }
            pos = pos_map.get(name, 0)
            hexagrams[seq]["lines"].append({
                "position": pos,
                "name": name,
                "text": parsed_line["text"],
                "modern": None,
                "smallImage": parsed_line["smallImage"],
                "smallImageModern": None,
            })
            line_count += 1
        except (ValueError, IndexError) as e:
            print(f"  WARNING row {r} seq={seq}: {e}")

    # Sort lines by position
    for h in hexagrams.values():
        h["lines"].sort(key=lambda x: x["position"])
    print(f"  Parsed {line_count} lines")

    # Step 5: Add 用九/用六
    if 1 in hexagrams:
        hexagrams[1]["lines"].append({
            "position": 0, "name": "用九",
            "text": "见群龙无首，吉。",
            "modern": None, "smallImage": None, "smallImageModern": None,
        })
    if 2 in hexagrams:
        hexagrams[2]["lines"].append({
            "position": 0, "name": "用六",
            "text": "利永贞。",
            "modern": None, "smallImage": None, "smallImageModern": None,
        })
    print("  Added 用九/用六 for 乾/坤")

    # Step 6: Verify
    missing = [i for i in range(1, 65) if i not in hexagrams]
    if missing:
        print(f"  WARNING: Missing hexagrams: {missing}")
    for seq, h in hexagrams.items():
        if not h["judgment"]:
            print(f"  WARNING: #{seq} {h['name']} missing judgment")
        if not h["image"]:
            print(f"  WARNING: #{seq} {h['name']} missing image")
        if not h["lines"]:
            print(f"  WARNING: #{seq} {h['name']} has 0 lines")
        elif any(l["smallImage"] == "" and l["name"] not in ("用九", "用六")
                 for l in h["lines"]):
            print(f"  WARNING: #{seq} {h['name']} has lines with empty smallImage")

    # Step 7: Output sorted
    sorted_hexagrams = {str(k): hexagrams[k] for k in sorted(hexagrams.keys())}
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted_hexagrams, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Output: {OUTPUT_PATH}")
    print(f"  Hexagrams: {len(sorted_hexagrams)}")
    print(f"  Total lines: {sum(len(h['lines']) for h in hexagrams.values())}")


if __name__ == "__main__":
    run()
