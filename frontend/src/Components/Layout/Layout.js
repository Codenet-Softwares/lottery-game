import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div class="container-fluid ">
      <Outlet />
    </div>
  );
};

export default Layout;
