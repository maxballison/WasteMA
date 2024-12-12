import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from '@mui/material/styles';

createRoot(document.getElementById('root')).render(
    <App />
)
