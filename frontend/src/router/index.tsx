import { Route, Routes } from 'react-router';
import { CommonLayout } from '@/layout/common';
import { InitializePage } from '@/pages';
import { HomePage } from '@/pages/home';
import ProtectedRoute from './protected';
import OffProtectedRoute from './off-protected';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* With Navbar and Footer */}
      <Route element={<CommonLayout />}></Route>

      <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
        {/* add routes which can only be accessed by superadmin */}
        <Route path='/example'></Route>
      </Route>

      <Route path="/auth" element={<OffProtectedRoute />}>
        <Route path="initialize" element={<InitializePage />} />
      </Route>

      <Route path='/' element={<HomePage />}></Route>
    </Routes>
  );
}

export default AppRouter;