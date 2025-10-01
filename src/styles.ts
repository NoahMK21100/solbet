import styled from 'styled-components'

export const MainWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  transition: width .25s ease, padding .25s ease;
  margin: 0 auto;
  padding: 20px 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 90px; /* Header height */
  background: transparent; /* Remove background to show body background */
  min-height: calc(100vh - 90px); /* Full height minus header */
  
  /* Mobile: No left margin since chat is hidden */
  @media (max-width: 1023px) {
    margin-left: 0;
    width: 100vw; /* Full width when chat is hidden */
  }
  
  @media (min-width: 1024px) {
    margin-top: 90px; /* Header height */
    min-height: calc(100vh - 90px); /* Full height minus header */
    padding: 20px 1.5rem;
    width: 100vw; /* Full width - will be controlled by ResponsiveMainWrapper */
    margin-left: 0; /* No margin - will be controlled by ResponsiveMainWrapper */
    margin-right: 0; /* No right margin */
    position: relative;
    left: 0; /* No centering - fill available space */
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (min-width: 1920px) {
    margin-top: 90px; /* Header height */
    min-height: calc(100vh - 90px); /* Full height minus header */
    padding: 20px 1.5rem;
    width: 100vw; /* Full width - will be controlled by ResponsiveMainWrapper */
    margin-left: 0; /* No margin - will be controlled by ResponsiveMainWrapper */
    margin-right: 0; /* No right margin */
    position: relative;
    left: 0; /* No centering - fill available space */
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (min-width: 600px) {
    padding: 20px 1.5rem;
  }
  @media (min-width: 1280px) {
    padding: 20px 1.5rem;
  }
`

export const TosWrapper = styled.div`
  position: relative;
  &:after {
    content: " ";
    background: linear-gradient(180deg, transparent, #15151f);
    height: 50px;
    pointer-events: none;
    width: 100%;
    position: absolute;
    bottom: 0px;
    left: 0px;
  }
`

export const TosInner = styled.div`
  max-height: 400px;
  padding: 10px;
  overflow: auto;
  position: relative;
`
