import React from 'react'

interface LogoProps { 
    width?: string;
    height?: string;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ width, height, className }) => {
  return (
      <svg width={width || "1em"} height={height || "1em"} viewBox="0 0 700 765" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className={className} d="M25 764L53.5 320.5L1.5 292.5L156 227.5L241 451L258.5 181L353.5 142L323 636L223.5 677L138 454.5L119.5 724L25 764Z" />
          <path className={className} d="M376.5 459L471 420L469.5 471L552.5 434.5L637 497L367.5 616L376.5 459Z" />
          <path className={className} d="M396 130L485 193.5L481.5 273.5L666 195.5L650.5 446L698.5 471.5L652.5 492L559.5 422.5L563.5 341L379.5 418.5L396 130Z" />
          <path className={className} d="M407.5 118L677.5 1L669 155L574 195.5L575 147L491 181.5L407.5 118Z" />
      </svg>
  )
}
