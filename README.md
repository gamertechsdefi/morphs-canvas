### Morph Canvas

Turn any profile picture into stunning visuals. Morph Canvas removes the background from your photo and composites it onto curated Morph-themed backdrops, ready to download and share.

- **What it does**: Background removal, instant previews on multiple backgrounds, one-click downloads
- **Who it’s for**: Creators, NFT holders, and anyone who wants great-looking avatars/pfps
- **Runs on**: Web (no app install)

### Try it

- Open the app: [Morph Canvas (Live)](your-deployed-url)
- Recommended page: `/bg-fill` → upload once → preview all generated images

### How it works

1. **Upload a photo** (JPG/PNG). Faces or single-subject images work best.
2. The app **removes the background** automatically.
3. Your subject is **composited onto multiple Morph backgrounds**.
4. **Download** any version you like.

### Key features

- **Automatic background removal**: No manual masking
- **Multiple results at once**: See your image across all available backgrounds
- **High-quality PNG output**: Great for avatars and social profiles
- **Progress indicators**: Know when your images are ready

### Tips for best results

- **Use clear subjects**: One person/object centered in the frame
- **Good contrast**: Subject clearly separated from background
- **Higher resolution**: Sharper edges and better cutouts
- Avoid busy backgrounds or motion blur when possible

### Data handling and privacy

- Your image is processed for background removal and compositing.
- Images are processed to generate the preview and final PNG.
- We don’t store your images after processing; they’re discarded after your session.

### FAQ

- **Is it free?** Yes.
- **Watermarks?** None.
- **What file types are supported?** JPG and PNG work best.
- **Can I process multiple photos at once?** Upload one image at a time; you’ll get multiple background variations automatically.
- **Why does it still look like the original?** Some images (e.g., very similar foreground/background colors, fine hair, motion blur) are harder. Try a different photo or better lighting.
- **Where are the backgrounds from?** Curated Morph-themed assets included in the app.

### Accessibility and browser support

- Works on modern browsers (Chrome, Edge, Firefox, Safari).
- Keyboard and screen-reader friendly UI (ongoing improvements).

### Attributions

- Background removal powered by `rembg` (U²-Net).
- Built with Next.js (frontend) and FastAPI (backend).

### Feedback and support

- Issues or suggestions? Open an issue on GitHub or contact the maintainers.
- Community: Built for the Morph L2 community—contributions welcome.

- Added a concise, user-facing README covering what the app does, how to use it, tips, privacy, FAQ, and credits. You can paste this into `README.md` on GitHub and replace the “Live” link with your deployed URL.
