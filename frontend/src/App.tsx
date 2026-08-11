import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/chat/chat";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
