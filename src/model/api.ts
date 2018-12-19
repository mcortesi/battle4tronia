import { genArray } from '../utils';
import { Move, winningsFor } from './reel';

export type Address = string;

export interface Collectable {
  id: Address;
}

export interface Player {
  name: string;
  tronium: number;
  fame: number;
  collectables: Collectable[];
  item1: null | Collectable;
  item2: null | Collectable;
  item3: null | Collectable;
  item4: null | Collectable;
}

export interface Bet {
  tronium: number;
  lines: number;
}

export interface Villain {
  hp: number;
  readonly maxHp: number;
}

export const enum BattleStatus {
  READY = 'READY',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
}

export interface Battle {
  status: BattleStatus;
  villain: Villain;
  famePoints: number;
  tronium: number;
  score: number;
}

export interface SpinResult {
  player: Player;
  bet: Bet;
  result: number[];
  currentBattle: Battle;
}

export const enum GameStatus {
  INSTALL_TRONLINK = 'INSTALL_TRONLINK',
  LOGIN_TRONLINK = 'LOGIN_TRONLINK',
  NO_CHANNEL_OPENED = 'NO_CHANNEL_OPENED',
  NOT_ENOUGH_BALANCE = 'NOT_ENOUGH_BALANCE',
  READY = 'READY',
  ERROR = 'ERROR',
}

export interface FightStats {
  famePoints: number;
  troniums: number;
  seconds: number;
}

export interface PlayerStats {
  bestFight: FightStats;
  villainsDefeated: number;
}

export interface GlobalStats {
  allTime: FightStats[]; // sorted by famepoints descending
  villainsDefeated: number; // total
  bestFightWeek: FightStats;
}

export interface API {
  /**
   * Need to check this constantly (every x sec) to proactively check for errors
   */
  getStatus(): Promise<GameStatus>;

  openChannel(tronium: number): Promise<boolean>;

  addTronium(tronium: number): Promise<boolean>;

  getPlayer(): Promise<Player>;

  updatePlayerName(name: string): Promise<Player>;

  updatePlayerItems(
    item1: null | Collectable,
    item2: null | Collectable,
    item3: null | Collectable,
    item4: null | Collectable
  ): Promise<Player>;

  getCurrentBattle(): Promise<Battle>;

  closeChannel(): Promise<boolean>;

  spin(bet: Bet): Promise<SpinResult>;

  getGlobalStats(): Promise<GlobalStats>;

  getPlayerStats(): Promise<PlayerStats>;
}

function clonePlayer(player: Player) {
  return {
    ...player,
    collectables: ([] as Collectable[]).concat(player.collectables),
  };
}
function cloneBattle(battle: Battle) {
  return {
    ...battle,
    villain: {
      ...battle.villain,
    },
  };
}

export class FakeApi implements API {
  private status: GameStatus;
  private player: Player;
  private battle: null | Battle = null;

  constructor() {
    this.status = GameStatus.NO_CHANNEL_OPENED;
    this.player = {
      name: 'Papu',
      tronium: 1000,
      fame: 2000,
      collectables: [],
      item1: null,
      item2: null,
      item3: null,
      item4: null,
    };
  }

  /**
   * Need to check this constantly (every x sec) to proactively check for errors
   */
  async getStatus(): Promise<GameStatus> {
    return this.status;
  }

  async openChannel(tronium: number): Promise<boolean> {
    this.status = GameStatus.READY;
    return true;
  }

  async addTronium(tronium: number): Promise<boolean> {
    return true;
  }

  async getPlayer(): Promise<Player> {
    return clonePlayer(this.player);
  }

  async updatePlayerName(name: string): Promise<Player> {
    this.player.name = name;
    return this.getPlayer();
  }

  updatePlayerItems(
    item1: null | Collectable,
    item2: null | Collectable,
    item3: null | Collectable,
    item4: null | Collectable
  ): Promise<Player> {
    this.player.item1 = item1;
    this.player.item2 = item2;
    this.player.item3 = item3;
    this.player.item4 = item4;
    return this.getPlayer();
  }

  async getCurrentBattle(): Promise<Battle> {
    if (this.battle == null) {
      this.battle = {
        status: BattleStatus.READY,
        villain: {
          hp: 300,
          maxHp: 300,
        },
        famePoints: 0,
        tronium: 0,
        score: 0,
      };
    }
    return cloneBattle(this.battle);
  }

  async closeChannel(): Promise<boolean> {
    this.status = GameStatus.NO_CHANNEL_OPENED;
    return true;
  }

  async spin(bet: Bet): Promise<SpinResult> {
    if (!this.battle) {
      throw new Error('Not in battle');
    }

    const lineResults = genArray(bet.lines, () => Math.random());
    const winnings = winningsFor(bet.tronium, lineResults.map(x => Move.fromDice(x)));

    this.player.tronium += winnings.troniumPayout - bet.lines * bet.tronium;
    this.player.fame += winnings.damage;

    this.battle.tronium += winnings.troniumPayout - bet.lines * bet.tronium;
    this.battle.score += winnings.damage;

    this.battle.villain.hp = Math.max(this.battle.villain.hp - winnings.damage, 0);
    this.battle.status = this.battle.villain.hp <= 0 ? BattleStatus.FINISHED : BattleStatus.ONGOING;

    return {
      result: lineResults,
      player: clonePlayer(this.player),
      currentBattle: cloneBattle(this.battle),
      bet,
    };
  }

  async getGlobalStats(): Promise<GlobalStats> {
    return null as any;
  }

  async getPlayerStats(): Promise<PlayerStats> {
    return null as any;
  }
}

/* 
Sequences:

## User Stories

1) When app loads, who do i know if there is an existent player, or no player?

switch (getStatus() {
  case INSTALL_TRONLINK:
  case LOGIN_TRONLINK:
  case NO_CHANNEL_OPENED:
    goToTitle() // with the 'connect' btn
    break;
  case NOT_ENOUGH_BALANCE:
  case READY:
    goToHome(getPlayer())
    break;
  case ERROR:
    goToErrorScreen()
    break;
})

2) When going to "battle", what do i do?

const b = getCurrentBattle()
goToBattle(player, b)






*/
