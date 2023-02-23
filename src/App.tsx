import React from 'react';
import logo from './logo.svg';
import './App.css';
import PeraWalletConnection from './Component/Perawallet';
// routes
import Router from './routes';
// theme
import ThemeConfig from './theme';
// components
import RtlLayout from './components/RtlLayout';
import ScrollToTop from './components/ScrollToTop';
import ThemePrimaryColor from './components/ThemePrimaryColor';
import NotistackProvider from './components/NotistackProvider';

function App() {
  return (
    <div className="App">
      {/* <PeraWalletConnection />
       */}
       <ThemeConfig>
        <ThemePrimaryColor>
          <RtlLayout>
            <NotistackProvider>
              <ScrollToTop />
              <Router />
            </NotistackProvider>
          </RtlLayout>
        </ThemePrimaryColor>
      </ThemeConfig>
    </div>
  );
}

export default App;
