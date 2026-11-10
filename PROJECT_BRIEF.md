# Operating Systems Dojo — Project Brief

## Goal
Help learners understand and experiment with Linux process lifecycle and interprocess communication through accurate deterministic visual models, worked explanations, predictions, practice, and original C examples.

## Approved scope
All seven chapter exports in [TaskBoard/tasks_OperatingSystemsDojo](https://github.com/WinstonTa/TaskBoard/tree/main/tasks_OperatingSystemsDojo): Chapters 24, 25, 27, 47, 48, 53, 54. The scope includes fork/wait, termination, exec, System V semaphores/shared memory, POSIX semaphores/shared memory. Explicitly excluded: unprovided course chapters, live arbitrary native execution, account storage, instructor source reproduction.

## User decisions
- Repository: WinstonTa/Operating-Systems-Dojo.
- All seven chapter exports are in scope.
- Hybrid client-only execution: deterministic browser simulations plus original C programs and Linux build/run instructions.
- Public Vercel static site; paraphrase instructor/textbook material, don't redistribute the original exports or their diagrams.
- Preserve main; develop on feat/operating-systems-learning-lab and request review via PR.
- Keep TaskBoard as coordination source; no Supabase, Master-Memory or live agent bus without authorization.

## Product contract
React 19, TypeScript, Vite. Versioned data under src/data, pure state-machine logic in src/lib, browser localStorage for progress, no API keys, safe deterministic exercise evaluation. Follow Understand → See → Predict → Try → Explain → Practice → Revisit. All simulations explicitly labeled and state-machine unit tested. C code never executes in the browser.

## Acceptance
Seven navigable chapters; sourced explanations, runnable predictive state changes, graded exercises with hint and explanation, seven mapped C examples, local progress, source map, responsive UI, validation and build CI, Vercel configuration. Clearly distinguish passing tests, actual browser QA and actual deployment.
