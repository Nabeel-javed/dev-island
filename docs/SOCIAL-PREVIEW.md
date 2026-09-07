# Site link preview

The homepage uses `public/social/dev-island-3d-v3.jpg`, a 1200 × 630 JPEG
composed from the actual Three.js island canvas and typeset Space Grotesk text.
There is no generative image processing in this preview.

The source `assets/social/island-postcard.png` was exported using the live app’s
Download island postcard button with Miniature 3D, Lagoon, and Day selected.
The sample island’s buildings and geometry are preserved.

Regenerate with `pnpm exec tsx scripts/render-social-preview.ts`.
The script crops away the postcard border and adds the headline on a matching
background. Personalized island and README cards retain their dynamic images.

Versioned filenames let crawlers fetch the replacement independently of previous
image caches. Existing social posts may retain their previously fetched preview.
The earlier v2 artwork is superseded and is no longer referenced by metadata.
