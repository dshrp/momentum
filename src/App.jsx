import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MomentumApp from "./components/MomentumDashboard"
import MomentumOnboarding from "./components/MomentumOnboarding"
import MomentumSharePage from "./components/MomentumSharePage"
import MomentumAdmin from "./components/MomentumAdmin"
import MomentumChromeExtension from "./components/MomentumChromeExtension"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MomentumApp />} />
        <Route path="/signup" element={<MomentumOnboarding />} />
        <Route path="/share" element={<MomentumSharePage />} />
        <Route path="/admin" element={<MomentumAdmin />} />
        <Route path="/extension" element={<MomentumChromeExtension />} />
      </Routes>
    </Router>
  )
}

export default App
