import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const lessons=JSON.parse(readFileSync(new URL('../src/data/lessons.json',import.meta.url)))
const challenges=JSON.parse(readFileSync(new URL('../src/data/challenges.json',import.meta.url)))
test('each chapter has distinct challenges and provenance',()=>{
  assert.equal(lessons.length,19)
  assert.equal(new Set(challenges.map(x=>x.id)).size,challenges.length)
  for(const lesson of lessons){ assert.ok(lesson.refs.length); assert.ok(lesson.challengeIds.length>=2); assert.ok(lesson.challengeIds.every(id=>challenges.some(c=>c.id===id))) }
})
