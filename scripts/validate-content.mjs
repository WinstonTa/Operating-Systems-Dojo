import { readFileSync } from 'node:fs'
const lessons = JSON.parse(readFileSync(new URL('../src/data/lessons.json', import.meta.url)))
const challenges = JSON.parse(readFileSync(new URL('../src/data/challenges.json', import.meta.url)))
const unique = (items, label) => { const ids = items.map(x => x.id); if(new Set(ids).size !== ids.length) throw Error('Duplicate '+label+' ID') }
unique(lessons, 'lesson'); unique(challenges, 'challenge')
if(lessons.length !== 19) throw Error('Expected 19 chapters')
const units = ['13','15','16','17','18','19','20','21','22','24','25','27','39','40','41','47','48','53','54']
if(lessons.map(x=>x.unit).join(',')!==units.join(',')) throw Error('Chapter ordering changed')
for(const l of lessons) {
  for(const k of ['id','title','objective','concept','prediction','answer','example','lab','source']) if(!l[k]) throw Error(l.id+': missing '+k)
  if(!l.takeaways?.length||!l.refs?.length||l.challengeIds.length < 2) throw Error(l.id+': incomplete lesson')
  for(const id of l.challengeIds) if(!challenges.some(c=>c.id===id&&c.lessonId===l.id)) throw Error(l.id+': invalid challenge '+id)
}
for(const c of challenges) {
  if(!lessons.some(l=>l.id===c.lessonId)) throw Error('Missing lesson '+c.lessonId)
  if(!Number.isInteger(c.answer)||c.answer<0||c.answer>=c.options.length) throw Error('Invalid answer '+c.id)
  if(new Set(c.options).size!==c.options.length || !c.hint || !c.explanation) throw Error('Invalid challenge '+c.id)
}
console.log('Validated '+lessons.length+' lessons and '+challenges.length+' challenges')
