import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import { Viewer } from './Viewer';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: '/viewer/:id', element: <Viewer /> }])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
