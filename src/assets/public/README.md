# Public-page artwork

All bitmap assets in `vista-web/src/assets` and `src/modules/assets` are WebP. SVG icons remain scalable vectors.

| Asset | Dimensions | Source |
| --- | --- | --- |
| vista-campus.webp | 1672 × 941 | Built-in imagegen; recreated from the supplied campus contact sheet's upper-left panel |
| campus-students.webp | 1254 × 1254, transparent | Built-in imagegen; separate foreground for the responsive campus banner |
| vista-hand-phone.webp | 1024 × 1536, transparent | Built-in imagegen; HTML supplies the phone's actual app preview |
| ../legal/waving-students.webp | 1536 × 1024, transparent | Built-in imagegen; identity reference was privacy-students.webp |
| android-download-qr.webp | 360 × 360, lossless | Generated locally with ReportLab's QR encoder from ANDROID_APK_URL |
| ../shared/vista_logo.webp | 163 × 163, lossless | Existing higher-resolution VISTA-MOBILE/src/assets/logo.png |

The image generator returned the campus asset below native 4K despite a 3840 × 2160 request and one resolution-enhancement attempt. The stored image is not advertised as native 4K or artificially enlarged. A native high-resolution source can replace it later.

The QR image encodes the constant in `src/config/appDownload.js`. Regenerate it if that release URL changes. No third-party QR image service is used.

## Generation prompts

### Campus illustration

Use case: identity-preserve illustration enhancement. Create one finished wide landscape illustration for the VISTA campus document website from ONLY THE TOP LEFT PANEL of the reference contact sheet. Recreate that same pastoral futuristic campus/data visualization scene with meticulous crisp high resolution detail, desired output 3840 by 2160 pixels (4K), 16:9, full bleed, no collage or border. Preserve its composition and art style: blue glass city in the center, soft cream sky with golden sun, blue birds, green landscaped hills with trees, small pond at right, pie chart data sculptures and translucent bar charts, two young adult students at bottom right (male with short navy hair, round glasses, gold overshirt and open book; female with long navy hair, cyan jacket and blue trousers). Faithful clean illustrated dimensional shading, delicate linework, bright blue/gold/green VISTA brand colors. Expand detail and definition rather than merely blur or upscale. No words, no UI, no logo, no watermark. Ignore both bottom panels and all blank margins. Keep left third quiet enough for dark blue text overlay but retain scenery. Professional editorial illustration, not photorealism.

### Phone in hand

Use case: product-mockup. Asset: premium website product hero cutout, transparent background, portrait 1024x1536. A realistic natural warm medium-tan human right hand and forearm, emerging diagonally from bottom right, delicately holding a slim upright modern smartphone facing directly toward the viewer. The entire handset fully visible above the fingers, perfectly vertical and front-on, centered horizontally. Black/navy narrow rounded bezel, entire screen clean solid pale blue (#edf4fc) with no icons, no text, no logo, no reflections, no notch. Hand holds the phone low along its lower right edge; thumb outside the main display. Phone spans approximately x=250 to 775 and y=100 to 1160 in the 1024x1536 canvas. Fingers anatomically natural and accurate. A cobalt-blue cotton sleeve with a narrow warm-gold cuff at the wrist. Soft professional studio light, subtle tactile skin, elegant editorial product photography. Actual transparent alpha around the hand and phone; no backdrop, no checkerboard, no extra objects, no graphic swirls. We will place the real VISTA app screen over the blank display in HTML and animate the composition.

### Waving students

Use case: identity-preserve character pose edit. Asset: transparent website legal-page mascots, a wide 1536x1024 illustration. Keep the SAME two cheerful college-age cartoon characters and exact clean flat anime editorial style from the reference: male on left, navy short hair, round navy glasses, gold yellow open short-sleeve overshirt over white tee, holding a blue folder with tiny gold lock against his chest with his INNER arm. Female on right, long flowing navy hair, bright cyan jacket over lavender tee, navy pants. Change their pose so they are BOTH WAVING HELLO toward the viewer: each character raises their OUTER hand (man toward the far left, woman toward far right). Open palms with five well-drawn fingers, hands raised to head height. Keep faces, hairstyles, clothes and identity the same. Frame both figures waist up with full waving hands, no cropping of hands or hair. IMPORTANT FOR ANIMATION: waving outer forearms and palms must be visibly separated from the heads and bodies by ample TRANSPARENT negative space; the male waving forearm is in far left third, female waving forearm in far right third. Elbows bent outward, only upper arms connect to bodies at shoulders. Faces stay in center third/two quarters. Simple graceful anatomy, clean precise edges, minimal shading like original. Genuine transparent background throughout all empty spaces, no halo, no scenery, no UI, no extra text, no logos, no shadow behind figures. This will be layered in SVG so the forearms can rotate independently to wave.


## Layered workspace banners

`src/components/banners/CampusScene.jsx` composes sky, clouds, glass towers, distant buildings, rooftop planting, landscape, and a separate student cutout. The scenery is native SVG/CSS and stays resolution-independent on 4K displays. The character cutout is stored at its native 1254 × 1254 resolution, rendered within a maximum 200px-wide side panel; it is not described as a 4K bitmap. The side panel is capped at 500px tall and does not stretch to match long forms. Profile loading and loaded states share the same width and artwork.

### Campus student cutout — built-in imagegen

Use case: identity-preserve illustration asset. Create ONLY a clean transparent cutout of the two cheerful college-age students in the reference, restoring sharp detailed linework. Intended asset: foreground character layer of a narrow responsive VISTA campus website banner. Preserve their navy hair, warm expressive faces, male round glasses and gold open short sleeve shirt with white tee and navy trousers, female cyan jacket and navy trousers. Show BOTH FULL BODIES with all hands, shoes, hair and limbs safely inside frame. They are happily jumping, man on left holding a small pink notebook raised in outer hand, girl on right extending one hand toward him, dynamic but graceful natural poses. Keep them close together in a compact balanced composition, not widely spaced. Maintain the reference's polished bright anime editorial illustration, fine clean outlines, subtle dimensional cel shading, blue/gold/cyan brand palette. Desired high-resolution asset 2048 by 2048 pixels or higher, crisp detail suited for retina and 4K monitor layouts. Genuine transparent background; no buildings, ground, scenery, cast background shadow, typography, watermark, border, logo, collage or UI. Do not recreate the full rectangular banner. This is a separate foreground layer to combine with vector scenery in code.
