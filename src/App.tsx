import "./assets/styles/main.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./pages/home";
import { FilePage } from "./pages/file";
import { ToasterLayout } from "./layouts/toaster";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ToasterLayout />}>
          <Route path="/" index element={<Home />} />
          <Route path="/file" element={<FilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
