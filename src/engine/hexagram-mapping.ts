/**
 * 64 hexagram mapping: 6-line binary → King Wen number 1-64.
 *
 * Each line: yang (阳) = 1 for values 7 or 9, yin (阴) = 0 for values 6 or 8.
 * Binary index = (line[5] << 5) | (line[4] << 4) | (line[3] << 3) | (line[2] << 2) | (line[1] << 1) | line[0]
 * where line[0] = 初爻 (LSB), line[5] = 上爻 (MSB).
 */

// binary pattern → King Wen number
const BINARY_TO_KING_WEN: Record<number, number> = {
  0b000000: 2,   // 坤为地
  0b000001: 24,  // 地雷复
  0b000010: 7,   // 地水师
  0b000011: 19,  // 地泽临
  0b000100: 15,  // 地山谦
  0b000101: 36,  // 地火明夷
  0b000110: 46,  // 地风升
  0b000111: 11,  // 地天泰
  0b001000: 16,  // 雷地豫
  0b001001: 51,  // 震为雷
  0b001010: 40,  // 雷水解
  0b001011: 54,  // 雷泽归妹
  0b001100: 62,  // 雷山小过
  0b001101: 55,  // 雷火丰
  0b001110: 32,  // 雷风恒
  0b001111: 34,  // 雷天大壮
  0b010000: 8,   // 水地比
  0b010001: 3,   // 水雷屯
  0b010010: 29,  // 坎为水
  0b010011: 60,  // 水泽节
  0b010100: 39,  // 水山蹇
  0b010101: 63,  // 水火既济
  0b010110: 48,  // 水风井
  0b010111: 5,   // 水天需
  0b011000: 45,  // 泽地萃
  0b011001: 17,  // 泽雷随
  0b011010: 47,  // 泽水困
  0b011011: 58,  // 兑为泽
  0b011100: 31,  // 泽山咸
  0b011101: 49,  // 泽火革
  0b011110: 28,  // 泽风大过
  0b011111: 43,  // 泽天夬
  0b100000: 23,  // 山地剥
  0b100001: 27,  // 山雷颐
  0b100010: 4,   // 山水蒙
  0b100011: 41,  // 山泽损
  0b100100: 52,  // 艮为山
  0b100101: 22,  // 山火贲
  0b100110: 18,  // 山风蛊
  0b100111: 26,  // 山天大畜
  0b101000: 35,  // 火地晋
  0b101001: 21,  // 火雷噬嗑
  0b101010: 64,  // 火水未济
  0b101011: 38,  // 火泽睽
  0b101100: 56,  // 火山旅
  0b101101: 30,  // 离为火
  0b101110: 50,  // 火风鼎
  0b101111: 14,  // 火天大有
  0b110000: 20,  // 风地观
  0b110001: 42,  // 风雷益
  0b110010: 59,  // 风水涣
  0b110011: 61,  // 风泽中孚
  0b110100: 53,  // 风山渐
  0b110101: 37,  // 风火家人
  0b110110: 57,  // 巽为风
  0b110111: 9,   // 风天小畜
  0b111000: 12,  // 天地否
  0b111001: 25,  // 天雷无妄
  0b111010: 6,   // 天水讼
  0b111011: 10,  // 天泽履
  0b111100: 33,  // 天山遁
  0b111101: 13,  // 天火同人
  0b111110: 44,  // 天风姤
  0b111111: 1,   // 乾为天
}

/** Convert 6 lines (values 6-9) to binary index 0-63 */
export function linesToBinary(lines: [number, number, number, number, number, number]): number {
  let index = 0
  for (let i = 0; i < 6; i++) {
    const bit = (lines[i] === 7 || lines[i] === 9) ? 1 : 0
    index |= (bit << i)
  }
  return index
}

/** Look up King Wen hexagram number from a binary pattern */
export function binaryToKingWen(binary: number): number {
  const kw = BINARY_TO_KING_WEN[binary]
  if (!kw) throw new Error(`No hexagram for binary pattern ${binary}`)
  return kw
}

/** Look up King Wen number from 6 line values */
export function linesToKingWen(lines: [number, number, number, number, number, number]): number {
  return binaryToKingWen(linesToBinary(lines))
}

/** Verify all 64 entries exist */
export const MAPPING_SIZE = Object.keys(BINARY_TO_KING_WEN).length
