import Navbar from 'app/components/navbar';
import type { Route } from './+types/home';
import { useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Capstone Project' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return(
  <>
    <Navbar onMenuClick={() => setSidebarOpen(true)} />

    <h1 className={'text-3xl font-bold'}> Home </h1>
  </>
  )
}