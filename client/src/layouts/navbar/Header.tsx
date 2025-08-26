import React from 'react'
import { ModeToggle } from '@/components/ui/mode_toggle'

const Header: React.FC = () => {
  return (
    <nav className='sticky top-0 left-0 z-50 border-b border-foreground/60 p-2'>
      Navbar
      <ModeToggle/>
    </nav>
  )
}

export default Header
