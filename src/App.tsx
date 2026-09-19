import { useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { useHashRoute } from './lib/dom';
import { ChordFormPage } from './pages/chordform/ChordFormPage';
import { FretboardPage } from './pages/fretboard/FretboardPage';
import { TransposerPage } from './pages/transposer/TransposerPage';

const ROUTES = ['/transpose', '/fretboard', '/forms'];

export default function App() {
  const route = useHashRoute();
  // '#/', an empty hash and unknown paths (the old home was '#/') land on the transposer
  useEffect(() => {
    if (!ROUTES.includes(route)) window.location.replace('#/transpose');
  }, [route]);
  return (
    <div className="app">
      <AppHeader route={route} />
      {route === '/fretboard' ? <FretboardPage /> : route === '/forms' ? <ChordFormPage /> : <TransposerPage />}
    </div>
  );
}
