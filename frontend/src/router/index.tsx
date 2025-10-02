import { InitializePage, LoginPage, TestPage } from '@/pages'
import { Navigate, Route, Routes } from 'react-router'
import { CommonLayout } from '@/layout'

const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* With Navbar and Footer */}
            <Route element={<CommonLayout />}>
                <Route index element={<InitializePage isLoading={true} />} />
            </Route>

            {/* No Navbar or Footer */}
            <Route index path="/login" element={<LoginPage />} />
            <Route index path="/test" element={<TestPage />} />

            {/* Redirect all unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default AppRouter;