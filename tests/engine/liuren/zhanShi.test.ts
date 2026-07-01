import { describe, test, expect } from 'vitest'
import { inferZhanShi } from '../../../src/engine/liuren/zhanShi.js'

describe('inferZhanShi', () => {
  test('匹配官职关键词', () => {
    expect(inferZhanShi('面试能否成功')).toBe('官职')
    expect(inferZhanShi('升职加薪')).toBe('官职')
    expect(inferZhanShi('工作调动')).toBe('官职')
  })

  test('匹配婚姻关键词', () => {
    expect(inferZhanShi('婚姻是否幸福')).toBe('婚姻')
    expect(inferZhanShi('恋爱运势')).toBe('婚姻')
    expect(inferZhanShi('桃花运')).toBe('婚姻')
  })

  test('匹配疾病关键词', () => {
    expect(inferZhanShi('病情如何')).toBe('疾病')
    expect(inferZhanShi('健康状况')).toBe('疾病')
  })

  test('匹配求财关键词', () => {
    expect(inferZhanShi('投资理财')).toBe('求财')
    expect(inferZhanShi('生意兴隆')).toBe('求财')
  })

  test('匹配出行关键词', () => {
    expect(inferZhanShi('出差顺利吗')).toBe('出行')
    expect(inferZhanShi('旅行安全')).toBe('出行')
  })

  test('匹配诉讼关键词', () => {
    expect(inferZhanShi('诉讼是否有利')).toBe('诉讼')
    expect(inferZhanShi('法律纠纷')).toBe('诉讼')
  })

  test('匹配学业关键词', () => {
    expect(inferZhanShi('学业前途')).toBe('学业')
    expect(inferZhanShi('论文答辩')).toBe('学业')
  })

  test('匹配天时关键词', () => {
    expect(inferZhanShi('明天天气')).toBe('天时')
    expect(inferZhanShi('会下雨吗')).toBe('天时')
  })

  test('无匹配关键词返回其他', () => {
    expect(inferZhanShi('今天心情不错')).toBe('其他')
    expect(inferZhanShi('')).toBe('其他')
  })
})
