import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App'
import { ChatProvider } from './context/ChatProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
