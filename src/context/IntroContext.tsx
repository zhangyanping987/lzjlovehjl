import { createContext, useContext } from 'react'

export interface IntroState {
  progress: number
  active: boolean
}

export const IntroContext = createContext<IntroState>({
  progress: 1,
  active: false,
})

export function useIntro() {
  return useContext(IntroContext)
}
