import React, { useState } from "react";
import Login from "./Login";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./Dashboard";
import PeriodManagement from "./admin/PeriodManagement";
import ThemeManagement from "./admin/ThemeManagement";
import MasterDosen from "./admin/master/MasterDosen";
import MasterMahasiswa from "./admin/master/MasterMahasiswa";
import MasterMitra from "./admin/master/MasterMitra";
import RegistrationValidation from "./admin/RegistrationValidation";
import Registration from "./student/Registration";
import Logbook from "./student/Logbook";
import LogbookValidation from "./dosen/LogbookValidation";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState("dashboard");

    // Check for saved session on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
    }, []);

    // Login function
    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentView("dashboard");
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView("dashboard");
        localStorage.removeItem("user");
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case "dashboard":
                return <Dashboard />;
            case "period-management":
                return <PeriodManagement />;
            case "theme-management":
                return <ThemeManagement />;
            case "master-data": // Fallback or redirect if needed
            case "master-dosen":
                return <MasterDosen />;
            case "master-mahasiswa":
                return <MasterMahasiswa />;
            case "master-mitra":
                return <MasterMitra />;
            case "registration-validation":
                return <RegistrationValidation />;
            case "student-registration":
                return <Registration />;
            case "student-logbook":
                return <Logbook />;
            case "logbook-validation":
                return <LogbookValidation />;
            default:
                return <Dashboard />;
        }
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <MainLayout
            title={
                currentView === "dashboard"
                    ? "Dashboard"
                    : currentView
                          .split("-")
                          .map(
                              (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")
            }
            user={user}
            currentView={currentView}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
        >
            {renderCurrentView()}
        </MainLayout>
    );
};

export default App;
