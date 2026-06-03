import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css"
import "widgets/style.css"

/* window.addEventListener("error", (e) => {
    alert(e.message)
})

window.addEventListener("unhandledrejection", (e) => {
    alert(e.message)
})
 */
createRoot(document.getElementById('root')!).render(
    <App />
)
