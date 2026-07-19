import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { HomePage } from "./pages/HomePage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { SubjectDetailPage } from "./pages/SubjectDetailPage";
import { QuizSetupPage } from "./pages/QuizSetupPage";
import { QuizSessionPage } from "./pages/QuizSessionPage";
import { SearchPage } from "./pages/SearchPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="subjects/:id" element={<SubjectDetailPage />} />
          <Route path="quiz" element={<QuizSetupPage />} />
          <Route path="quiz/session" element={<QuizSessionPage />} />
          <Route path="search" element={<SearchPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
