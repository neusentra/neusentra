import { Logo } from '@/icons'
import React from 'react'

export const HomePage: React.FC = () => {
  return (
    <section className='min-h-screen max-h-screen flex items-center justify-center'>
          <Logo className='fill-black dark:fill-white' height='10rem' width='10rem' />
    </section>
  )
}