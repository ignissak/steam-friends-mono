declare module 'steam' {
  export type User = {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    lastlogoff: number;
    personastate: number;
    realname: string?;
    primaryclanid: string;
    timecreated: number;
    personastateflags: number;
  };

  export interface Game {
    name?: string;
    steam_appid?: number;
    appid?: number;
    is_free?: boolean;
    header_image?: string;
    price_overview?: {
      currency: string;
      initial: number;
      final: number;
      discount_percent: number;
      initial_formatted: string;
      final_formatted: string;
    };
    platforms?: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    categories?: {
      id: number;
      description: string;
    }[];
    genres?: {
      id: string;
      description: string;
    }[];
    playtime_forever?: number;
    playtime_windows_forever?: number;
    playtime_mac_forever?: number;
    playtime_linux_forever?: number;
    rtime_last_played?: number;
    playtime_disconnected?: number;
  }

  export type Comparison = {
    id: string;
    users: User[];
    calculated: { game: Game; users: User[] }[];
    createdAt: number;
  };
}

declare module '@morev/vue-transitions' {
  const VueTransitions: any;
  export default VueTransitions;
}

declare module '@aacassandra/vue3-progressbar' {
  const VueProgressBar: any;
  export default VueProgressBar;
}
