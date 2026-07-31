# Private media review

The original files under `public/palak/` are preserved locally but excluded from
Git and Vercel deployment. The website uses only silent, metadata-stripped,
neutral-named copies under `public/memories/`.

Before sharing the page, watch every enabled clip from beginning to end and
confirm that it is appropriate for this private gesture.

| Deployed asset | Source asset | Enabled | `safeToUse` | Review |
| --- | --- | ---: | ---: | --- |
| `expression-01.mp4` | `blankexpressions.mp4` | true | true | Rewatch full clip |
| `expression-02.mp4` | `dramaticpalak.mp4` | true | true | Rewatch full clip |
| `expression-03.mp4` | `happyhappy.mp4` | true | true | Rewatch full clip |
| `expression-04.mp4` | `Mature.mp4` | true | true | Rewatch full clip |
| `expression-05.mp4` | `sweet expression excited.mp4` | true | true | Rewatch full clip |
| `memory-01.jpeg` | `palak 1.jpeg` | true | true | Confirm portrait choice |

Change `enabled`, `safeToUse`, captions, order, and paths in
`src/content/personal-page.ts`. A media item renders only when `enabled` and
`safeToUse` are both true and `privacy` is not `private-do-not-use`.

Do not copy unused source files into `public/memories/`.
