# Site link preview

The homepage uses `public/social/dev-island-3d-v2.jpg`, a 1200 × 630 JPEG,
for Open Graph and Twitter large-image cards. This is promotional artwork,
not a screenshot of the interactive renderer. Personalized island and README
cards continue to use their dynamic images.

Created with the built-in ImageGen tool. Final prompt:

> Create a polished social link preview for Dev Island, a playful website turning GitHub repositories into explorable miniature island buildings. Wide landscape exactly 1200x630 composition (or equivalent 1.9:1). Premium stylized 3D clay diorama, orthographic three-quarter aerial camera, six tiny distinct buildings (cottage, striped awning cafe, domed observatory with telescope, workshop, library, arcade), winding sandy paths, round trees, tiny explorer, wooden dock. Turquoise lagoon with dimensional ripples, thick grassy island edge and sandy shore, warm peach sunlight, soft ambient occlusion, beautifully tactile materials. Island fills right 65 percent and lower frame; left 35 percent has calm deep teal background with large crisp ivory sans-serif text exactly "Your GitHub.\nA little world." and small brand label "dev island." above. Strong readable hierarchy even thumbnail size. Full bleed artwork, sophisticated charming composition, clear depth and shadows, no flat icon illustration, no browser UI, no extra slogans, no GitHub logo, no watermark. Promotional illustration rather than a claimed screenshot. Keep all text 70px inside edges and island fully in frame.

The original generated PNG remains in the local ImageGen output folder. The
production asset is resized and JPEG-encoded for efficient crawler downloads.

Validation: production build, TypeScript and formatting checks passed. The final
JPEG was visually inspected at its delivery size. Image filenames are versioned
so future previews can fetch new artwork independently of old image caches.
