# Rankings Factor Chrome Extension

A modern Chrome extension for analyzing SEO rankings factors with a beautiful Tailwind CSS interface.

## Features

- 🔍 **SEO Analysis**: Analyze page titles, meta descriptions, headings, and content
- 📊 **Score System**: Get a comprehensive SEO score out of 100
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS
- 🔧 **Settings**: Toggle extension on/off and configure auto-analysis
- ⌨️ **Keyboard Shortcut**: Use Ctrl+Shift+R to toggle the UI panel
- 📱 **Responsive**: Works in both popup and injected panel modes

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Mode

```bash
npm run dev
```

This will start the development server for testing the React app.

### Building the Extension

```bash
npm run build:extension
```

This will:
1. Build the React app with Vite
2. Copy all necessary files to the `dist` folder
3. Create a Chrome extension-ready package

## Installation in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension should now appear in your extensions list

## Usage

### Popup Mode
- Click the extension icon in the toolbar
- Use the interface to analyze the current page

### Panel Mode
- Press `Ctrl+Shift+R` on any webpage
- A floating panel will appear with the analysis interface
- Click the "Toggle UI Panel" button to show/hide the panel

### Analysis Features

The extension analyzes:
- **Page Title**: Length and optimization
- **Meta Description**: Presence and length
- **Headings**: H1, H2, H3 structure
- **Content**: Word count, images, and links
- **SEO Score**: Overall score out of 100

## Project Structure

```
├── public/
│   ├── manifest.json      # Chrome extension manifest
│   ├── background.js      # Background service worker
│   ├── content-script.js  # Content script for page injection
│   └── popup.html        # Popup HTML template
├── src/
│   ├── App.jsx           # Main React component
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind CSS styles
├── scripts/
│   └── build-extension.js # Build script for extension
└── dist/                 # Built extension (generated)
```

## Customization

### Adding New Analysis Metrics

1. Update the analysis function in `public/content-script.js`
2. Add new UI components in `src/App.jsx`
3. Update the scoring algorithm in the `getScore` function

### Styling

The extension uses Tailwind CSS. Custom styles can be added in `src/index.css` using the `@layer` directive.

### Icons

Replace the placeholder icons in the `dist` folder with your own:
- `icon16.png` (16x16)
- `icon32.png` (32x32)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## Troubleshooting

### Extension Not Loading
- Check the browser console for errors
- Ensure all files are properly copied to the `dist` folder
- Verify the manifest.json is valid

### Analysis Not Working
- Check that the content script is properly injected
- Verify the background script is running
- Check for permission issues in the manifest

### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Clear the `dist` folder and rebuild
- Check that Vite is building to `dist_assets`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension
5. Submit a pull request

## License

MIT License - see LICENSE file for details
