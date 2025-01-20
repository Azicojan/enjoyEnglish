import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import ModulesPage from "../pages/ModulesPage";
import Module1 from "../features/Modules/Module1";
import Lesson1 from "../features/Modules/Lessons/Lesson1";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/modules" element={<ModulesPage />} />
    <Route path="/modules/1" element={<Module1 />} />
    <Route path="/modules/1/lessons/1" element={<Lesson1 />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
