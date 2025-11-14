export interface AnoraUser {
  ID: string;
  Friends: string[];
  UserAccount: {
    DiscordID: string;
    Roles: string[];
    Avatar: string;
    DisplayName: string;
  };
  Profiles: {
    Athena: {
      FavoriteCharacter: string;
      SeasonLevel: number;
      SeasonXp: number;
      BookPurchased: boolean;
      BookLevel: number;
      BookXp: number;
    };
    CommonCore: {
      Vbucks: number;
    };
  };
  token: string;
}
