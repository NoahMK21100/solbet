import React from 'react'
import styled from 'styled-components'
import { getLevelVariant, getLevelVariantStyles, LevelVariant } from '../utils/levelUtils'

interface LevelBadgeProps {
  level: number
  variant?: LevelVariant
  className?: string
}

const LevelBadgeContainer = styled.div<{ $variant: LevelVariant }>`
  display: inline-flex;
  user-select: none;
  border-radius: calc(var(--radius, 0.5rem) - 3px);
  padding: 1.5px;
  background: ${({ $variant }) => {
    const variants = {
      gray: "linear-gradient(140deg, #464646, #474747, #484848)",
      blue: "linear-gradient(140deg, #3b82f6,rgb(53, 85, 173)),rgb(26, 59, 167)",
      purple: "linear-gradient(140deg, #8b5cf6, #7c3aed)",
      pink: "linear-gradient(140deg, #ec4899, #db2777)",
      orange: "linear-gradient(140deg, #f97316, #ea580c)",
      red: "linear-gradient(140deg, #ef4444,rgb(167, 29, 29)),rgb(110, 16, 16)",
    };
    return variants[$variant];
  }};
`

const LevelBadgeInner = styled.div<{ $variant: LevelVariant }>`
  border-radius: calc(var(--radius, 0.5rem) - 4px);
  padding: 0.1875rem;
  min-width: 1.5rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  background: ${({ $variant }) => {
    const variants = {
      gray: "linear-gradient(140deg, #262626,rgb(58, 58, 58),rgb(32, 32, 32))",
      blue: "linear-gradient(140deg,rgb(19, 40, 97),rgb(44, 67, 129),rgb(19, 29, 63))",
      purple: "linear-gradient(140deg,rgb(53, 6, 124),rgb(88, 57, 134),rgb(56, 4, 145))",
      pink: "linear-gradient(140deg,rgb(172, 10, 75),rgb(136, 55, 89),rgb(109, 25, 71))",
      orange: "linear-gradient(140deg,rgb(172, 54, 15),rgb(110, 57, 39),rgb(87, 29, 8))",
      red: "linear-gradient(140deg,rgb(172, 14, 14),rgb(88, 15, 15), rgb(66, 15, 15))",
    };
    return variants[$variant];
  }};
`

const LevelBadgeText = styled.span<{ $variant: LevelVariant }>`
  font-size: 0.75rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  background: ${({ $variant }) => {
    const variants = {
      gray: "linear-gradient(140deg,rgb(202, 202, 202), #8a8a8a 50%,rgb(87, 87, 87))",
      blue: "linear-gradient(140deg,rgb(146, 173, 216),rgb(99, 135, 212) 50%,rgb(26, 59, 167))",
      purple: "linear-gradient(140deg,rgb(159, 140, 204),rgb(136, 93, 211) 50%,rgb(89, 50, 156))",
      pink: "linear-gradient(140deg,rgb(201, 135, 168),rgb(212, 89, 151),rgb(145, 32, 90))",
      orange: "linear-gradient(140deg,rgb(207, 156, 120),rgb(179, 88, 53) 50%,rgb(146, 54, 24))",
      red: "linear-gradient(140deg,rgb(209, 114, 114),rgb(158, 42, 42) 50%,rgb(143, 20, 20))",
    };
    return variants[$variant];
  }};
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`

export function LevelBadge({ level, variant, className }: LevelBadgeProps) {
  const numericLevel = typeof level === 'string' ? parseInt(level, 10) : level
  const levelVariant = variant || getLevelVariant(numericLevel)

  return (
    <LevelBadgeContainer $variant={levelVariant} className={className}>
      <LevelBadgeInner $variant={levelVariant}>
        <LevelBadgeText $variant={levelVariant}>
          {numericLevel}
        </LevelBadgeText>
      </LevelBadgeInner>
    </LevelBadgeContainer>
  )
}
