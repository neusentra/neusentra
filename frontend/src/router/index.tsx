import { Route, Routes } from 'react-router';
import { CommonLayout } from '@/layout/common';
import { InitializePage } from '@/pages';

const AppRouter: React.FC = () => {
    return (
      <Routes>
        {/* With Navbar and Footer */}
        <Route element={<CommonLayout />}></Route>

        <Route path="/auth">
          <Route path="initialize" element={<InitializePage />} />
        </Route>

        <Route path='/' element={<div>Home</div>}></Route>    
      </Routes>
    );
}

export default AppRouter;