#!/usr/bin/env python3
"""
生成 kinliuren 参考数据集 v2
覆盖全部 10 种课体格局，手工选取代表性案例
"""
import json
from kinliuren.kinliuren import Liuren

# 手工选取的案例，确保覆盖所有课体
CASES = [
    # === 賊尅 (贼克) — 含重审/元首/知一 子模式 ===
    # 重审（单一下贼上）
    ("驚蟄", "二", "庚申", "甲子"),
    ("立春", "正", "甲子", "丙子"),
    ("春分", "二", "乙丑", "甲子"),
    # 元首（单一上克下）— kinliuren 归类为賊尅
    ("春分", "二", "甲子", "丙子"),
    ("芒種", "五", "甲子", "丙子"),
    
    # === 比用 ===
    ("立春", "正", "甲子", "乙丑"),
    ("立春", "正", "甲子", "己巳"),
    ("立春", "正", "甲子", "辛未"),
    
    # === 涉害 ===
    ("立春", "正", "甲子", "甲戌"),
    ("立春", "正", "丙寅", "己巳"),
    ("立春", "正", "丙寅", "癸酉"),
    
    # === 遥克 ===
    ("冬至", "十一", "甲子", "戊子"),
    ("冬至", "十一", "甲子", "庚子"),
    
    # === 昴星 ===
    ("立春", "正", "己巳", "乙亥"),
    ("立春", "正", "庚午", "乙亥"),
    ("立春", "正", "戊寅", "壬申"),
    
    # === 别责 ===
    ("立春", "正", "戊辰", "乙亥"),
    ("立春", "正", "辛未", "癸酉"),
    ("立春", "正", "丁丑", "庚午"),
    
    # === 八专 ===
    ("立春", "正", "甲寅", "丁卯"),
    ("立春", "正", "甲寅", "壬申"),
    ("立春", "正", "己未", "乙丑"),
    ("立春", "正", "己未", "丙寅"),
    ("立春", "正", "己未", "丁卯"),
    ("立春", "正", "庚申", "乙丑"),
    ("春分", "二", "庚申", "己巳"),
    ("芒種", "五", "己未", "丙寅"),
    ("處暑", "七", "庚申", "丙寅"),
    
    # === 伏吟 ===
    ("冬至", "十一", "甲子", "甲子"),
    ("冬至", "十一", "乙丑", "乙丑"),
    ("冬至", "十一", "甲子", "戊子"),
    ("冬至", "十一", "甲子", "庚子"),
    ("冬至", "十一", "甲子", "壬子"),
    ("冬至", "十一", "乙丑", "甲子"),
    ("冬至", "十一", "丙寅", "甲子"),
    ("冬至", "十一", "丁卯", "甲子"),
    ("冬至", "十一", "戊辰", "甲子"),
    ("冬至", "十一", "己巳", "甲子"),
    
    # === 返吟 ===
    ("大暑", "六", "甲子", "甲子"),
    ("大暑", "六", "甲子", "丙子"),
    ("大暑", "六", "甲子", "戊子"),
    ("立春", "正", "甲戌", "甲子"),
    ("立春", "正", "甲戌", "丙子"),
    ("立春", "正", "甲戌", "戊子"),
]

def collect_reference_data():
    results_by_geju = {}
    seen = set()
    
    for jieqi, month, day_gz, hour_gz in CASES:
        key = (jieqi, month, day_gz, hour_gz)
        if key in seen:
            continue
        seen.add(key)
        
        try:
            r = Liuren(jieqi, month, day_gz, hour_gz).result(0)
            geju_primary = r['格局'][0]
            geju_sub = r['格局'][1] if len(r['格局']) > 1 else ''
            
            # kinliuren 格局名 → 我们的 GeJu 映射
            GEJU_MAP = {
                '賊尅': '贼克', '比用': '比用', '涉害': '涉害',
                '遙克': '遥克', '昴星': '昴星', '別責': '别责',
                '八專': '八专', '伏吟': '伏吟', '返吟': '返吟',
            }
            our_geju = GEJU_MAP.get(geju_primary, geju_primary)
            
            if our_geju not in results_by_geju:
                results_by_geju[our_geju] = []
            
            entry = {
                'input': {
                    'jieqi': jieqi,
                    'lunar_month': month,
                    'day_ganzhi': day_gz,
                    'hour_ganzhi': hour_gz,
                },
                'kinliuren_output': {
                    'geju_raw': r['格局'],
                    'geju_primary': geju_primary,
                    'geju_sub': geju_sub,
                    'sanchuan': {
                        'chuchuan': r['三傳']['初傳'][0],
                        'chuchuan_tianjiang': r['三傳']['初傳'][1],
                        'chuchuan_liuqin': r['三傳']['初傳'][2],
                        'chuchuan_dungan': r['三傳']['初傳'][3],
                        'zhongchuan': r['三傳']['中傳'][0],
                        'zhongchuan_tianjiang': r['三傳']['中傳'][1],
                        'zhongchuan_liuqin': r['三傳']['中傳'][2],
                        'zhongchuan_dungan': r['三傳']['中傳'][3],
                        'mochuan': r['三傳']['末傳'][0],
                        'mochuan_tianjiang': r['三傳']['末傳'][1],
                        'mochuan_liuqin': r['三傳']['末傳'][2],
                        'mochuan_dungan': r['三傳']['末傳'][3],
                    },
                    'sike': {
                        'yike': r['四課']['一課'][0],
                        'yike_tianjiang': r['四課']['一課'][1],
                        'erke': r['四課']['二課'][0],
                        'erke_tianjiang': r['四課']['二課'][1],
                        'sanke': r['四課']['三課'][0],
                        'sanke_tianjiang': r['四課']['三課'][1],
                        'sike': r['四課']['四課'][0],
                        'sike_tianjiang': r['四課']['四課'][1],
                    },
                    'tianpan': r['天地盤']['天盤'],
                    'dipan': r['天地盤']['地盤'],
                    'tianjiang': r['天地盤']['天將'],
                    'shensha': {k: v for k, v in r.get('神煞', {}).items()} if r.get('神煞') else {},
                },
            }
            results_by_geju[our_geju].append(entry)
        except Exception as e:
            print(f"Error: {jieqi} {month} {day_gz} {hour_gz} -> {e}")
    
    return results_by_geju

if __name__ == '__main__':
    data = collect_reference_data()
    
    print("=== 课体覆盖统计 ===")
    for geju, cases in sorted(data.items()):
        print(f"  {geju}: {len(cases)} 个案例")
    print(f"  总计: {sum(len(c) for c in data.values())} 个案例")
    print()
    
    output = {
        'metadata': {
            'description': 'kinliuren 参考数据集 v2 - 覆盖全部10种课体',
            'total_cases': sum(len(c) for c in data.values()),
            'geju_coverage': {k: len(v) for k, v in data.items()},
        },
        'cases': data,
    }
    
    with open('tests/engine/liuren/kinliuren-reference.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print("参考数据已写入 tests/engine/liuren/kinliuren-reference.json")
