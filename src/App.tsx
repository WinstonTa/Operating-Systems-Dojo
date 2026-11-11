import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, CircleHelp, Code2, Cpu, ExternalLink, GraduationCap, Layers3, Lightbulb, ListChecks, Menu, Play, RotateCcw, Terminal, Trophy, X, XCircle } from 'lucide-react'
import lessons from './data/lessons.json'
import challenges from './data/challenges.json'
import { createScenario, transition, availableActions, type Scenario } from './lib/simulator.mjs'

type Section = 'learn' | 'lab' | 'practice' | 'reference'
type Feedback = { id: string; correct: boolean }
const STORAGE = 'operating-systems-dojo-progress-v1'
const sourceUrl = (name:string) => 'https://github.com/WinstonTa/TaskBoard/blob/main/tasks_OperatingSystemsDojo/' + encodeURIComponent(name)
function initialProgress():string[] {
  try { const raw = window.localStorage.getItem(STORAGE); const value:unknown = raw ? JSON.parse(raw) : []; return Array.isArray(value) ? value.filter((x):x is string => typeof x === 'string') : [] } catch { return [] }
}
function App() {
  const [lessonId,setLessonId]=useState(lessons[0].id)
  const [section,setSection]=useState<Section>('learn')
  const [scenario,setScenario]=useState<Scenario>(()=>createScenario(lessons[0].id))
  const [completed,setCompleted]=useState<string[]>(initialProgress)
  const [choices,setChoices]=useState<Record<string,number>>({})
  const [feedback,setFeedback]=useState<Feedback|null>(null)
  const [hint,setHint]=useState<string|null>(null)
  const [reveal,setReveal]=useState<string|null>(null)
  const [prediction,setPrediction]=useState(false)
  const [mobile,setMobile]=useState(false)
  const [query,setQuery]=useState('')
  const selected=lessons.find(x=>x.id===lessonId)??lessons[0]
  const lessonIndex=lessons.findIndex(x=>x.id===selected.id)
  const currentChallenges=useMemo(()=>challenges.filter(x=>x.lessonId===selected.id),[selected.id])
  const done=completed.length
  const progress=Math.round(done/challenges.length*100)
  useEffect(()=>{try{window.localStorage.setItem(STORAGE,JSON.stringify(completed))}catch{/* blocked browser storage */}},[completed])
  function switchLesson(id:string) {
    setLessonId(id);setScenario(createScenario(id));setSection('learn');setFeedback(null);setHint(null);setReveal(null);setPrediction(false);setMobile(false)
  }
  function switchSection(next:Section){setSection(next);setMobile(false);setFeedback(null);setHint(null)}
  function check(id:string,correctAnswer:number) {
    const actual=choices[id]
    if(actual===undefined) return
    const correct=actual===correctAnswer
    setFeedback({id,correct})
    if(correct) setCompleted(old=>old.includes(id)?old:[...old,id])
  }
  const filtered=lessons.filter(x=>(x.title+' '+x.eyebrow+' '+x.unit).toLowerCase().includes(query.toLowerCase()))
  return <div className="app-shell">
    <aside className={mobile?'sidebar open':'sidebar'} aria-label="Course navigation">
      <div className="brand"><div className="brand-mark"><Cpu size={23}/></div><div><strong>OS Dojo</strong><small>LEARNING LAB / LINUX</small></div><button className="mobile-close icon-btn" onClick={()=>setMobile(false)} aria-label="Close navigation"><X size={20}/></button></div>
      <div className="sidebar-label">YOUR PROGRESS</div>
      <div className="progress-wrap"><div className="progress-meta"><span>{done} / {challenges.length} challenges</span><strong>{progress}%</strong></div><div className="progress-track"><div style={{width:progress+'%'}}/></div></div>
      <label className="search-wrap"><span className="sr-only">Search chapters</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a chapter..."/></label>
      <div className="sidebar-label">COURSE CHAPTERS</div>
      <nav className="chapter-nav">{filtered.map(lesson=>{
        const c=challenges.filter(x=>x.lessonId===lesson.id)
        const count=c.filter(x=>completed.includes(x.id)).length
        return <button key={lesson.id} className={'chapter '+(lesson.id===selected.id?'selected':'')} onClick={()=>switchLesson(lesson.id)} aria-current={lesson.id===selected.id?'page':undefined}>
          <span className="chapter-number">{lesson.unit}</span><span className="chapter-text"><strong>{lesson.title}</strong><small>{count}/{c.length} checks completed</small></span><ChevronRight size={16}/></button>
      })}{filtered.length===0&&<p className="muted nav-empty">No matching chapters.</p>}</nav>
      <div className="sidebar-foot"><span className="status-dot"/> Local-first • No account required<br/><span className="foot-note">Visual models ≠ real kernel execution</span></div>
    </aside>
    {mobile&&<button className="scrim" onClick={()=>setMobile(false)} aria-label="Close navigation overlay"/>}
    <main className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu/></button><span className="crumb">COURSE <ChevronRight size={14}/> CHAPTER {selected.unit}</span><span className="topright"><span className="status-dot"/> Interactive systems lab</span></header>
      <div className="content">
        <div className="hero-heading"><div className="eyebrow">MODULE {String(lessonIndex+1).padStart(2,'0')} / {String(lessons.length).padStart(2,'0')} <span className="slash">/</span> LINUX SYSTEMS PROGRAMMING</div><h1>{selected.title}<span className="accent-dot">.</span></h1><p>{selected.eyebrow}</p><div className="objective"><GraduationCap size={18}/><span><b>Learning goal:</b> {selected.objective}</span></div></div>
        <div className="tabs" role="tablist" aria-label="Learning modes">{([['learn','Learn',BookOpen],['lab','Interact',Cpu],['practice','Practice',ListChecks],['reference','Code & sources',Code2]] as const).map(([id,title,Icon])=><button role="tab" aria-selected={section===id} key={id} className={section===id?'tab active':'tab'} onClick={()=>switchSection(id)}><Icon size={17}/>{title}</button>)}</div>

        {section==='learn'&&<div className="two-col">
          <div className="stack">
            <div className="panel"><div className="panel-kicker"><span className="step">01</span> UNDERSTAND</div><h2>The mental model</h2><p className="big-copy">{selected.concept}</p><div className="inset"><h3>Key invariants</h3>{selected.takeaways.map((t,i)=><div key={i} className="takeaway"><CheckCircle2 size={17}/><span>{t}</span></div>)}</div></div>
            <div className="panel"><div className="panel-kicker"><span className="step">02</span> SEE</div><h2>Worked example</h2><p>{selected.example}</p><button className="inline-link" onClick={()=>switchSection('lab')}>Explore this behavior <ArrowRight size={16}/></button></div>
          </div>
          <div className="stack">
            <div className="panel dark-panel"><div className="panel-kicker"><span className="step">03</span> PREDICT</div><h2>Commit to a prediction</h2><p>{selected.prediction}</p>{!prediction?<button className="primary" onClick={()=>setPrediction(true)}><Lightbulb size={18}/> Reveal the mechanism</button>:<div className="answer-box"><strong>Explanation</strong><p>{selected.answer}</p><button className="ghost-light" onClick={()=>setPrediction(false)}>Hide explanation</button></div>}</div>
            <div className="panel workflow"><div className="panel-kicker"><span className="step">04</span> TRY</div><h2>Observe the state</h2><p>{selected.lab}</p><button className="primary" onClick={()=>switchSection('lab')}><Play size={16}/> Open interactive lab</button></div>
          </div>
        </div>}

        {section==='lab'&&<div className="lab-layout">
          <div className="panel lab-panel"><div className="row-head"><div><div className="panel-kicker"><span className="step">LAB</span> INTERACTIVE MODEL</div><h2>{selected.title} explorer</h2></div><button className="outline small" onClick={()=>setScenario(createScenario(selected.id))}><RotateCcw size={16}/> Reset</button></div>
          <p>{selected.lab}</p><div className="sim-banner"><CircleHelp size={16}/> Deterministic educational simulation — not an actual Linux kernel or C runtime.</div>
          <div className="machine">
            <div className="machine-head"><span><span className="status-dot"/> SYSTEM STATE</span><span>STEP {String(scenario.step).padStart(2,'0')}</span></div>
            <div className="state-grid">
              {['process-creation','process-termination'].includes(selected.id)&&<><div className="state-card"><span>PARENT PID</span><strong>{scenario.pid}</strong><small>fork return: {scenario.returnParent??'—'}</small></div><div className="state-card"><span>CHILD PID</span><strong>{scenario.childPid??'—'}</strong><small>{scenario.child} · fork: {scenario.returnChild??'—'}</small></div><div className="state-card wide"><span>CHILD EXIT STATUS</span><strong>{scenario.status??'not exited'}</strong><small>Waitable child is reaped with wait()</small></div></>}
              {selected.id==='program-execution'&&<><div className="state-card"><span>PROCESS ID</span><strong>{scenario.pid}</strong><small>Stable across exec</small></div><div className="state-card"><span>CURRENT IMAGE</span><strong>{scenario.image}</strong><small>Old image replaced</small></div></>}
              {selected.id.includes('semaphores')&&<><div className="state-card"><span>SEMAPHORE COUNT</span><strong>{scenario.semaphore}</strong><small>Never becomes negative</small></div><div className="state-card"><span>CONSUMER</span><strong>{scenario.blocked?'blocked':'ready'}</strong><small>{scenario.blocked?'Waiting for token':'Can attempt wait'}</small></div></>}
              {selected.id==='sysv-shared-memory'&&<><div className="state-card"><span>ATTACHMENTS</span><strong>{scenario.shared?'2 processes':'none'}</strong><small>Same underlying storage</small></div><div className="state-card"><span>WRITER VALUE</span><strong>{scenario.sharedValue}</strong><small>Shared counter</small></div><div className="state-card wide"><span>LAST READER OBSERVATION</span><strong>{scenario.readerValue??'—'}</strong><small>Reading requires an attachment</small></div></>}
              {Object.entries(scenario.model).map(([label,value])=><div key={label} className="state-card"><span>{label.toUpperCase()}</span><strong>{String(value)}</strong></div>)}
              {selected.id==='posix-shared-memory'&&<><div className="state-card"><span>NAMED OBJECT</span><strong>{scenario.nameExists?'exists':'absent'}</strong><small>shm_open / shm_unlink</small></div><div className="state-card"><span>OBJECT SIZE</span><strong>{scenario.size} B</strong><small>ftruncate</small></div><div className="state-card"><span>MAPPING</span><strong>{scenario.mapped?'mapped':'unmapped'}</strong><small>Value: {scenario.sharedValue}</small></div></>}
            </div>
            <div className="actions">{(availableActions[selected.id]??[]).map(([action,label])=><button key={action} onClick={()=>setScenario(current=>transition(current,action))}><Play size={14}/>{label}</button>)}</div>
            <div className="event-log"><div className="log-title"><Terminal size={15}/> EVENT TRACE</div><ol aria-live="polite">{scenario.log.map((event,i)=><li key={i}><span>{String(i).padStart(2,'0')}</span>{event}</li>)}</ol></div>
          </div>
          </div>
          <aside className="stack side-notes"><div className="panel"><div className="panel-kicker">EXPLAIN</div><h3>What should you notice?</h3>{selected.takeaways.map((x,i)=><div className="point" key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></div>)}</div><div className="panel"><div className="panel-kicker">APPLY</div><p>Can you predict the next event before pressing a control?</p><button className="outline" onClick={()=>switchSection('practice')}>Test your understanding <ArrowRight size={16}/></button></div></aside>
        </div>}

        {section==='practice'&&<div className="practice-layout"><div className="panel"><div className="row-head"><div><div className="panel-kicker"><span className="step">05</span> PRACTICE</div><h2>Check your reasoning</h2></div><div className="count-chip">{currentChallenges.filter(c=>completed.includes(c.id)).length} / {currentChallenges.length} complete</div></div><p>Commit to an answer, check it, then review the mechanism. Your completed answers are saved in this browser.</p>
          {currentChallenges.map((c,i)=><div key={c.id} className="question"><div className="question-head"><span>CHECK {String(i+1).padStart(2,'0')}</span>{completed.includes(c.id)&&<span className="passed"><CheckCircle2 size={15}/> Complete</span>}</div><h3>{c.prompt}</h3><div className="choices">{c.options.map((option,j)=><label key={option} className={'choice '+(choices[c.id]===j?'chosen':'')}><input type="radio" name={c.id} checked={choices[c.id]===j} onChange={()=>{setChoices(prev=>({...prev,[c.id]:j}));setFeedback(null)}}/><span className="letter">{String.fromCharCode(65+j)}</span>{option}</label>)}</div><div className="question-controls"><button className="primary" disabled={choices[c.id]===undefined} onClick={()=>check(c.id,c.answer)}>Check answer</button><button className="outline" onClick={()=>setHint(hint===c.id?null:c.id)}><Lightbulb size={16}/> {hint===c.id?'Hide hint':'Hint'}</button></div>{hint===c.id&&<div className="hint"><Lightbulb size={16}/>{c.hint}</div>}{feedback?.id===c.id&&<div className={'feedback '+(feedback.correct?'correct':'incorrect')}>{feedback.correct?<CheckCircle2 size={18}/>:<XCircle size={18}/>}<div><strong>{feedback.correct?'Correct — well reasoned.':'Not quite — try another answer.'}</strong><p>{feedback.correct?c.explanation:'Use the hint and consider the precise system-call behavior.'}</p></div></div>}{completed.includes(c.id)&&<button className="inline-link" onClick={()=>setReveal(reveal===c.id?null:c.id)}> {reveal===c.id?'Hide':'Review'} explanation <ChevronRight size={14}/></button>}{reveal===c.id&&<p className="muted">{c.explanation}</p>}</div>)}
        </div></div>}

        {section==='reference'&&<div className="two-col">
          <div className="panel">
            <div className="panel-kicker"><span className="step">REFERENCE</span> {selected.sample?'REAL LINUX CODE':'INTERACTIVE CONCEPT MODEL'}</div>
            {selected.sample?<><h2>Run the C demonstration</h2><p>This original example compiles on Linux and runs real system calls. It does not execute inside the browser.</p><div className="code"><span>$ # from the repository root</span>{'\n'}$ cc -std=c11 -Wall -Wextra -pthread examples/{selected.sample} -o /tmp/os-dojo{'\n'}$ /tmp/os-dojo</div><p className="fineprint">Requires Linux and a C compiler. IPC demos may require cleanup if interrupted.</p><a className="inline-link" href={'https://github.com/WinstonTa/Operating-Systems-Dojo/blob/main/examples/'+selected.sample} target="_blank" rel="noreferrer">View C example <ExternalLink size={15}/></a></>
            :<><h2>Explore the algorithm</h2><p>For this virtual-memory or file-system topic, use the interactive model to trace address calculations, allocation, page faults or disk layout. These models intentionally use small values so you can verify the state by hand.</p><button className="primary" onClick={()=>switchSection('lab')}><Play size={16}/> Open model</button><p className="fineprint">No executable Linux example is currently bundled for this topic. The chapter's source sections and practice tasks are provided alongside the simulation.</p></>}
          </div>
          <div className="panel"><div className="panel-kicker">PROVENANCE</div><h2>Learning references</h2><p>This original lesson paraphrases Chapter {selected.unit}. Original source figures are not reproduced. Practice checks are author-created.</p><ul className="ref-list">{selected.refs.map(r=><li key={r}>Section {r} of Chapter {selected.unit}</li>)}</ul><a href={sourceUrl(selected.source)} target="_blank" rel="noreferrer" className="inline-link">View source chapter in TaskBoard <ExternalLink size={15}/></a><p className="fineprint">The TaskBoard repository may require permissions.</p></div>
        </div>}

        <footer className="lesson-footer"><button className="outline" disabled={lessonIndex===0} onClick={()=>switchLesson(lessons[lessonIndex-1].id)}><ArrowLeft size={16}/> Previous chapter</button><span>CHAPTER {selected.unit} / {lessons.length} MODULES</span><button className="primary" disabled={lessonIndex===lessons.length-1} onClick={()=>switchLesson(lessons[lessonIndex+1].id)}>Next chapter <ArrowRight size={16}/></button></footer>
        <div className="bottom-note"><Layers3 size={16}/> Built for learning: predictable experiments, authentic Linux references, and no backend data collection. <Trophy size={16}/></div>
      </div>
    </main>
  </div>
}
export default App
