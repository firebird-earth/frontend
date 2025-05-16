import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './components/app/App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { registerAllCRSDefs } from './utils/crs';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

registerAllCRSDefs();

//console.log('main complete')