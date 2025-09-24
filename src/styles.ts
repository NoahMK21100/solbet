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
  margin-top: 70px; /* Main header only on mobile */
  background: transparent; /* Remove background to show body background */
  min-height: calc(100vh - 70px);
  
  /* Mobile: No left margin since chat is hidden */
  @media (max-width: 1023px) {
    margin-left: 0;
  }
  
  @media (min-width: 1024px) {
    margin-top: 110px; /* Logo container (110px total height) */
    min-height: calc(100vh - 110px);
    padding: 20px 1.5rem;
    width: 1200px; /* Fixed width - wider */
    margin-left: 350px; /* Start after chat box */
    margin-right: 0; /* No right margin */
    position: relative;
    left: calc((100vw - 350px - 1200px) / 2); /* Center within remaining space */
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (min-width: 1920px) {
    margin-top: 110px; /* Logo container (110px total height) - same as 1024px for 1920x1080 */
    min-height: calc(100vh - 110px);
    padding: 20px 1.5rem;
    width: 1200px; /* Fixed width - wider */
    margin-left: 350px; /* Start after chat box */
    margin-right: 0; /* No right margin */
    position: relative;
    left: calc((100vw - 350px - 1200px) / 2); /* Center within remaining space */
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
