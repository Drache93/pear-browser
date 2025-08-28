# Pear Browser

A peer-to-peer (P2P) application browser built with modern web technologies. Pear Browser allows you to discover and launch P2P applications in your network through an intuitive search interface.

<img width="1370" height="930" alt="image (11)" src="https://github.com/user-attachments/assets/337582a4-304b-460e-abd0-0e89280a8904" />
<img width="1363" height="931" alt="image (12)" src="https://github.com/user-attachments/assets/73461636-bddc-49e3-b58c-61d21df73c0e" />
<img width="1368" height="925" alt="image (13)" src="https://github.com/user-attachments/assets/cebbb313-4351-4140-aec7-c44809311bd5" />
<img width="850" height="780" alt="image (14)" src="https://github.com/user-attachments/assets/78adca20-ff66-4344-9fae-2c6af32982c7" />

## Features

- **P2P App Discovery**: Search and discover P2P applications in your network
- **Modern UI**: Clean, responsive interface built with Alpine.js and Tailwind CSS
- **Desktop App**: Runs as a native desktop application using Pear Runtime
- **Real-time Search**: Instant search results with live filtering
- **App Management**: View app details including icons, descriptions, and URLs

## Screenshots

The browser features a clean interface with:

- A prominent search bar for discovering P2P apps
- App listings with icons and descriptions
- Seamless app launching capabilities
- Modern, responsive design

## Technology Stack

- **Frontend**: HTML5, Alpine.js, Tailwind CSS
- **Backend**: Node.js with Pear Runtime
- **Data Storage**: Corestore with Schema Sheets
- **P2P Communication**: Pear Request
- **Build Tools**: Tailwind CSS CLI

## Prerequisites

- Node.js (v16 or higher)
- Pear Runtime
- Git

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pear-browser
```

2. Install dependencies:

```bash
npm install
```

3. Build the CSS:

```bash
npm run build:tailwind
```

## Usage

### Development Mode

Start the development server:

```bash
npm run dev
```

This will launch the Pear Browser in development mode with hot reloading.

### Production Build

For production deployment, build the CSS and run the application:

```bash
npm run build:tailwind
pear run .
```

## Project Structure

```
pear-browser/
├── app.js              # Main application logic
├── apps.json           # Default apps configuration
├── assets/             # Static assets (logos, icons)
├── index.html          # Main HTML file
├── input.css           # Tailwind CSS input
├── package.json        # Dependencies and scripts
├── schema.json         # Data schema definition
└── README.md           # This file
```

## Configuration

### Adding Default Apps

Edit `apps.json` to add default P2P applications:

```json
[
  {
    "name": "App Name",
    "icon": "data:image/png;base64,...",
    "description": "App description",
    "url": "app-url"
  }
]
```

### Customizing the Schema

Modify `schema.json` to change the data structure for apps:

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "icon": { "type": "string" },
    "description": { "type": "string" },
    "url": { "type": "string" }
  }
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run test` - Run tests
- `npm run build:tailwind` - Build Tailwind CSS

### Key Components

- **Search Interface**: Built with Alpine.js for reactive search functionality
- **App Container**: Uses HTMX for dynamic app loading
- **Data Management**: Corestore with Schema Sheets for P2P data storage
- **Network Communication**: Pear Request for P2P communication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## Testing

Run the test suite:

```bash
npm test
```

Tests are written using Brittle and cover core functionality.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Pear Runtime](https://github.com/pear-project/pear-runtime)
- UI components powered by [Alpine.js](https://alpinejs.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- P2P data storage with [Corestore](https://github.com/hypercore-protocol/corestore)

## Support

For support and questions:

- Open an issue on GitHub
- Check the documentation
- Join the community discussions

---

**Note**: This is a P2P application browser designed for discovering and launching distributed applications. Make sure you have the necessary P2P network setup for full functionality.

