import { InitializePage, LoginPage, TestPage } from '@/pages'
import { Navigate, Route, Routes } from 'react-router'
import { CommonLayout } from '@/layout'

const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* With Navbar and Footer */}
            <Route element={<CommonLayout />}>
            </Route>

            <Route index path='/initialize' element={<InitializePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* No Navbar or Footer */}
            <Route path="/test" element={<TestPage />} />

            {/* Redirect root to initialize */}
            <Route path="/" element={<Navigate to="/initialize" replace />} />
        </Routes>
    )
}

export default AppRouter;