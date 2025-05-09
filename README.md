# Firebird Map Application

A sophisticated web mapping application built with React, Leaflet, and modern web technologies for visualizing and analyzing geospatial data.

## Layer Ordering System

Leaflet maintains a strict layer ordering system using panes with predefined z-index values. This determines how different types of layers stack on top of each other:

| Pane Name     | Z-Index | Purpose                    |
|---------------|---------|----------------------------|
| Tile Pane     | 200     | Raster tiles/images       |
| Overlay Pane  | 400     | Vector/feature layers     |
| Shadow Pane   | 500     | Marker shadows            |
| Marker Pane   | 600     | Map markers               |
| Tooltip Pane  | 650     | Layer tooltips            |
| Popup Pane    | 700     | Popups                    |

## Tech Stack

- React 18
- TypeScript
- Leaflet
- Redux Toolkit
- Tailwind CSS
- Vite

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Project Structure

```
src/
├── components/     # React components
├── store/         # Redux store and slices
├── services/      # API and service integrations
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── constants/     # Application constants
```

### Key Components

- `Map.tsx` - Main map component
- `Legend.tsx` - Layer legend and controls
- `Navigation.tsx` - Navigation panel
- `LayerControls/` - Layer-specific control components

### State Management

The application uses Redux Toolkit for state management with the following main slices:

- `layers` - Layer management and ordering
- `map` - Map state (center, zoom, etc.)
- `ui` - UI state (theme, panels, etc.)
- `settings` - User preferences

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

The application supports deployment to:
- Netlify (preferred)
- Any static hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- GeoTIFF data is cached in memory
- Layer rendering is optimized for large datasets
- Automatic cleanup of unused resources
- Lazy loading of map tiles and features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License