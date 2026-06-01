#!/usr/bin/env python3
"""
Phase 2: Translate classical hexagram text to modern Chinese via DeepSeek API.

Input:  hexagrams_raw.json
Output: hexagrams_translated.json (same structure with all Modern fields filled)

Usage:
    python3 translate_hexagrams.py                    # Full translation
    python3 translate_hexagrams.py --hexagram 1        # Translate only 乾卦
    python3 translate_hexagrams.py --resume            # Skip already translated

Environment:
    DEEPSEEK_API_KEY      Required. DeepSeek API key.
    DEEPSEEK_MODEL        Model name (default: deepseek-chat)
"""

import json
import os
import sys
import time
import argparse
from openai import OpenAI

INPUT_PATH = "hexagrams_raw.json"
OUTPUT_PATH = "hexagrams_translated.json"
DEFAULT_MODEL = "deepseek-chat"

SYSTEM_PROMPT = """你是一位严谨的周易经学翻译专家。你的任务是将先秦经典《周易》的经文逐条翻译成现代汉语白话文。

规则：
1. 只输出译文本身，禁止附加任何标注、解释、卦象分析或序号
2. 逐字对应原文，不得增减或改动原意
3. 保留关键哲学术语原貌：元亨利贞、吉凶悔吝、无咎、贞、亨、利、吝、厉
4. 翻译风格参照黄寿祺《周易译注》，准确第一、流畅第二
5. 译文须为完整的现代汉语句子，以句号结尾
6. 每条译文简短精炼（不超过30字），保留原文的凝练感

示例：
原文：潜龙勿用。
译文：龙潜伏在水中，暂不宜施展才能。

原文：天行健，君子以自强不息。
译文：天道运行刚健有力，君子应效法天道自强不息。"""


def get_deepseek_client():
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        print("ERROR: DEEPSEEK_API_KEY environment variable is not set.")
        sys.exit(1)
    return OpenAI(
        api_key=api_key,
        base_url="https://api.deepseek.com",
    )


def translate_single(client, user_prompt, model, retries=3):
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=300,
            )
            result = response.choices[0].message.content.strip()
            result = result.replace("【译文】", "").replace("译文：", "").replace("译文:", "").strip()
            return result
        except Exception as e:
            wait = 2 ** attempt
            print(f"    API error (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                print(f"    Retrying in {wait}s...")
                time.sleep(wait)
    return None


def translate_hexagram(client, data, h_key, model):
    h = data[h_key]
    seq = h["id"]
    name = h["name"]
    print(f"  [{seq}] {name}...")

    context = {
        "hexagram_name": name,
        "hexagram_seq": seq,
        "tuan": h.get("tuan", ""),
        "image": h.get("image", ""),
    }

    # 1. Judgment
    if h["judgmentModern"] is None and h["judgment"]:
        prompt = (f"以下是需要翻译的{name}（第{seq}卦）内容。\n\n"
                  f"【背景参考 - 彖辞】\n{context['tuan']}\n\n"
                  f"【背景参考 - 大象辞】\n{context['image']}\n\n"
                  f"【待翻译 - 卦辞】\n{h['judgment']}\n\n"
                  f"请将此{name}的卦辞翻译为学术严谨的现代汉语白话文。")
        result = translate_single(client, prompt, model)
        if result:
            h["judgmentModern"] = result
            print(f"    judgment ✓")
        else:
            print(f"    judgment ✗")
        time.sleep(0.5)

    # 2. Image
    if h["imageModern"] is None and h["image"]:
        prompt = (f"以下是需要翻译的{name}（第{seq}卦）内容。\n\n"
                  f"【背景参考 - 彖辞】\n{context['tuan']}\n\n"
                  f"【待翻译 - 象辞】\n{h['image']}\n\n"
                  f"请将此{name}的象辞翻译为学术严谨的现代汉语白话文，阐释卦象与人事的对应关系。")
        result = translate_single(client, prompt, model)
        if result:
            h["imageModern"] = result
            print(f"    image ✓")
        else:
            print(f"    image ✗")
        time.sleep(0.5)

    # 3. Lines
    for line in h["lines"]:
        line_name = line["name"]

        if line["modern"] is None and line["text"]:
            small_img_context = ""
            if line.get("smallImage"):
                small_img_context = f"\n【背景参考 - 小象辞】\n{line['smallImage']}"
            prompt = (f"以下是需要翻译的{name}（第{seq}卦）内容。\n\n"
                      f"【背景参考 - 彖辞】\n{context['tuan']}\n\n"
                      f"【背景参考 - 大象辞】\n{context['image']}{small_img_context}\n\n"
                      f"【待翻译 - {line_name}爻辞】\n{line['text']}\n\n"
                      f"请将此{name}的{line_name}爻辞翻译为学术严谨的现代汉语白话文。")
            result = translate_single(client, prompt, model)
            if result:
                line["modern"] = result
            time.sleep(0.5)

        if line["smallImageModern"] is None and line.get("smallImage"):
            prompt = (f"以下是需要翻译的{name}（第{seq}卦）内容。\n\n"
                      f"【背景参考 - 彖辞】\n{context['tuan']}\n\n"
                      f"【待翻译 - {line_name}小象辞】\n{line['smallImage']}\n\n"
                      f"请将此{name}的{line_name}小象辞翻译为学术严谨的现代汉语白话文。")
            result = translate_single(client, prompt, model)
            if result:
                line["smallImageModern"] = result
            time.sleep(0.3)

    print(f"  Progress complete for [{seq}] {name}")


def main():
    parser = argparse.ArgumentParser(description="Translate hexagram text via DeepSeek API")
    parser.add_argument("--hexagram", type=int, help="Translate only this hexagram number (1-64)")
    parser.add_argument("--resume", action="store_true", help="Skip already-translated fields (resume mode)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be translated without calling API")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model (default: {DEFAULT_MODEL})")
    args = parser.parse_args()

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {len(data)} hexagrams from {INPUT_PATH}")

    # Load existing output for resume
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            output_data = json.load(f)
        print(f"Found existing {OUTPUT_PATH} ({len(output_data)} hexagrams)")
    else:
        output_data = None

    working_data = output_data if (args.resume and output_data) else data
    hexagrams_to_process = [str(args.hexagram)] if args.hexagram else sorted(working_data.keys())

    # Dry run
    if args.dry_run:
        print("\n=== DRY RUN ===")
        total_items = 0
        for h_key in hexagrams_to_process:
            h = working_data[h_key]
            count = 0
            if h.get("judgmentModern") is None and h.get("judgment"): count += 1
            if h.get("imageModern") is None and h.get("image"): count += 1
            for line in h.get("lines", []):
                if line.get("modern") is None and line.get("text"): count += 1
                if line.get("smallImageModern") is None and line.get("smallImage"): count += 1
            total_items += count
            status = f"{count} items to translate" if count else "COMPLETE"
            print(f"  [{h['id']}] {h['name']}: {status}")
        print(f"\nTotal items to translate: {total_items}")
        return

    client = get_deepseek_client()
    model = args.model
    print(f"Using model: {model}")

    print(f"\nProcessing {len(hexagrams_to_process)} hexagrams...")
    for i, h_key in enumerate(hexagrams_to_process, 1):
        translate_hexagram(client, working_data, h_key, model)
        print(f"  Overall: {i}/{len(hexagrams_to_process)}")
        # Save after each hexagram
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(working_data, f, ensure_ascii=False, indent=2)

    # Summary
    translated_judgment = sum(1 for h in working_data.values() if h.get("judgmentModern"))
    translated_lines = sum(1 for h in working_data.values() for l in h.get("lines", []) if l.get("modern"))
    print(f"\n✓ Output: {OUTPUT_PATH}")
    print(f"  Judgments translated: {translated_judgment}/{len(working_data)}")
    print(f"  Lines translated:     {translated_lines}")


if __name__ == "__main__":
    main()
