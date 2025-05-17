import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './components/app/App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { registerAllCRSDefs } from './utils/crs';
import './index.css';

// hello git
const useStrict = false;
if (useStrict) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <App />
        </Provider>
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  createRoot(document.getElementById('root')!).render(
      <ErrorBoundary>
        <Provider store={store}>
          <App />
        </Provider>
      </ErrorBoundary>
  );
}

registerAllCRSDefs();

//console.log('main complete')