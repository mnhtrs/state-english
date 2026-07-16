import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './ui/pages/Home';
import { AddWord } from './ui/pages/AddWord';
import { WordPage } from './ui/pages/WordPage';
import { ServiceProvider } from './ui/ServiceProvider';

function App() {
  return (
    <ServiceProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddWord />} />
          <Route path="/word/:id" element={<WordPage />} />
        </Routes>
      </Router>
    </ServiceProvider>
  );
}

export default App;
