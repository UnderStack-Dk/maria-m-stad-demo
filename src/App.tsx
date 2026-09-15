import { Routes, Route } from 'react-router-dom'
import { Header, Footer, FloatingCta, ScrollToHash } from './Layout'
import Home from './Home'
import ServicesPage from './ServicesPage'
import AboutPage from './AboutPage'
import './App.css'

function App() {
  return <>
    <ScrollToHash />
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tjanster" element={<ServicesPage />} />
      <Route path="/om" element={<AboutPage />} />
    </Routes>
    <Footer />
    <FloatingCta />
  </>
}
export default App
