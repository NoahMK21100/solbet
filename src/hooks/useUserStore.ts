//useUserStore.ts
import { StoreApi, create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface UserProfile {
  username: string
  avatar: string
  bio: string
  level: number
  totalBets: number
  totalWon: number
  joinDate: Date
}

export interface UserStore {
  /** Show disclaimer if first time user */
  newcomer: boolean
  /** User Modal */
  userModal: boolean
  /** Show registration page if user hasn't created profile */
  needsRegistration: boolean
  /** User profile data */
  profile: UserProfile | null
  /** A list of games played. The first time a game is opened we can display info */
  gamesPlayed: Array<string>
  /** The last pool a user had selected */
  lastSelectedPool: { token: string, authority?: string } | null
  markGameAsPlayed: (gameId: string, played: boolean) => void
  set: StoreApi<UserStore>['setState']
}

/**
 * Store client settings here
 */
export const useUserStore = create(
  persist<UserStore>(
    (set, get) => ({
      newcomer: true,
      userModal: false,
      needsRegistration: true,
      profile: null,
      lastSelectedPool: null,
      gamesPlayed: [],
      markGameAsPlayed: (gameId, played) => {
        const gamesPlayed = new Set(get().gamesPlayed)
        if (played) {
          gamesPlayed.add(gameId)
        } else {
          gamesPlayed.delete(gameId)
        }
        set({ gamesPlayed: Array.from(gamesPlayed) })
      },
      set,
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
)
