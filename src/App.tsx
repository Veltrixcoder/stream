import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import HomePage from '@/pages/HomePage';
import MoviesPage from '@/pages/MoviesPage';
import LiveTvPage from '@/pages/LiveTvPage';
import ConfigPage from '@/pages/ConfigPage';
import DetailsPage from '@/pages/DetailsPage';

function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/live-tv" element={<LiveTvPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/details/:type/:id" element={<DetailsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
