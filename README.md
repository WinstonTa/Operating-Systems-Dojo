# Operating Systems Dojo

**Interactive Linux process and IPC learning lab.** Covers all seven approved chapters from the TaskBoard OperatingSystemsDojo references, with a pedagogical flow of **Understand → See → Predict → Try → Explain → Practice → Revisit**.

## Features
- Seven chapter-aligned courses: process creation (24), termination (25), execution (27), System V semaphores (47), System V shared memory (48), POSIX semaphores (53), POSIX shared memory (54).
- Browser-only deterministic teaching simulations with event traces and state inspectors. **These are not actual kernel system calls.**
- Fourteen authored multiple-choice knowledge checks with hints and explanatory feedback; progress saved to browser `localStorage`.
- Seven original Linux C examples, plus compilation and execution instructions in [examples/README.md](examples/README.md).
- Responsive navigation, chapter search, source attribution, no login or telemetry backend.

## Run locally

Node.js 22+ recommended.

```sh
npm install
npm run dev
# open the local URL displayed by Vite
```

```sh
npm run validate
npm test
npm run typecheck
npm run build
npm run preview
```

## Architecture
- `src/data/lessons.json` — course-derived paraphrased chapter lessons and source references
- `src/data/challenges.json` — original practice prompts, answer indices, hints and explanations
- `src/lib/simulator.mjs` — pure deterministic illustrative process/IPC state transitions
- `src/App.tsx` — lesson deck, simulation lab, graded practice and source reference
- `src/styles.css` — responsive interface
- `tests/` and `scripts/validate-content.mjs` — curriculum integrity and model behavior checks
- `examples/` — real C programs to compile and execute on Linux

## Scope and provenance
See [PROJECT_BRIEF.md](PROJECT_BRIEF.md) and [CONTENT_MAP.md](CONTENT_MAP.md). Source material lives at TaskBoard `tasks_OperatingSystemsDojo`. We paraphrase and build new visual representations; textbook figure text was available as OCR-like content in some chapters but original image assets were not. No copyrighted source chapters are copied into this app. This app is for learning, not an exhaustive Linux/POSIX specification.

## Deploy
Import `WinstonTa/Operating-Systems-Dojo` into Vercel using the Vite framework, build `npm run build`, output `dist`. `vercel.json` provides a SPA rewrite. No API keys or backend are needed. Deploy from reviewed `main` after merging the PR. Browser localStorage progress is per-origin, per-browser.

## Verification status
GitHub Actions has separate web validation/typecheck/build and strict Linux C compilation jobs. Their actual run statuses should be checked before merging. CLI checks cannot substitute for a browser accessibility or Vercel preview smoke test.
