import { Container, Point } from 'pixi.js';
import { Player } from '../model/api';
import { bigIcon, HowtoPlayBtn, primaryBtn, smallIcon } from './basic';
import { Dimension } from './commons';
import { GlobalDispatcher } from './GlobalDispatcher';
import { Disposable } from './MainUI';
import { MainStatBox, SecondaryStatBox } from './StatBox';
import { newContainer, newSprite, newText, postionAfterX, verticalAlignCenter } from './utils';
import { Button } from './utils/Button';

export interface HomeScreenProps {
  size: Dimension;
  gd: GlobalDispatcher;
  parent: Container;
  player: Player;
}

export function HomeScreen({ size, gd, parent, player }: HomeScreenProps): Disposable {
  const stage = newContainer();
  parent.addChild(stage);

  stage.addChild(Hero(size));

  primaryBtn('toBattle', () => gd.requestBattle(), stage);

  const balanceBox = BalanceBox({
    position: new Point(25, 25),
    value: player.tronium,
    addMore: gd.openAddMoreModal.bind(gd),
    cashOut: gd.openCashOutModal.bind(gd),
  });
  stage.addChild(balanceBox.stage);

  stage.addChild(HowtoPlayBtn(gd.showHowToPlay).stage);

  stage.addChild(
    newText(player.name, 'H1', {
      position: new Point(size.width / 2, 200),
      anchor: new Point(0.5, 0),
    })
  );

  const fameIco = smallIcon('IcoFame', {
    position: new Point(0, 250 + 6),
  });
  const fameText = newText(player.fame.toString(), 'H2', {
    position: new Point(0, 250),
  });
  const fameWidth = fameIco.width + fameText.width + 5;
  fameIco.x = (size.width - fameWidth) / 2;
  fameText.x = fameIco.x + fameIco.width + 5;

  stage.addChild(fameIco, fameText);

  const ColWidth = size.width / 5;
  const TableLayout = {
    x: [ColWidth * 1, ColWidth * 2, ColWidth * 3],
    y: [310, 420],
  };

  // stage.addChild(
  //   new Graphics()
  //     .lineStyle(1, 0xffff00)
  //     .drawRect(TableLayout.x[0], TableLayout.y[0], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[1], TableLayout.y[0], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[2], TableLayout.y[0], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[0], TableLayout.y[1], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[1], TableLayout.y[1], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  //     .drawRect(TableLayout.x[2], TableLayout.y[1], ColWidth, TableLayout.y[1] - TableLayout.y[0])
  // );

  const playerBestFightBox = MainStatBox({
    position: new Point(TableLayout.x[0], TableLayout.y[0]),
    width: ColWidth,
    header: 'YOUR BEST FIGHT',
    value: '3.588',
    footer: 'EPICNESS',
  });

  const bestFightBox = SecondaryStatBox({
    position: new Point(TableLayout.x[0], TableLayout.y[1]),
    width: ColWidth,
    header: 'BEST IN TRONIA',
    value: '55555',
  });

  const playerBestMatchBox = MainStatBox({
    position: new Point(TableLayout.x[1], TableLayout.y[0]),
    width: ColWidth,
    header: 'HIGHEST EARNINGS',
    value: '0.15 TRX',
    footer: 'IN ONE MATCH',
  });

  const bestMatchBox = SecondaryStatBox({
    position: new Point(TableLayout.x[1], TableLayout.y[1]),
    width: ColWidth,
    header: 'BEST IN TRONIA',
    value: '0.15 TRX',
  });

  const playerKillsBox = MainStatBox({
    position: new Point(TableLayout.x[2], TableLayout.y[0]),
    width: ColWidth,
    header: 'CALL TO ARMS',
    value: '35',
    footer: 'INVADERS DEFEATED',
  });

  const totalKillsBox = SecondaryStatBox({
    position: new Point(TableLayout.x[2], TableLayout.y[1]),
    width: ColWidth,
    header: 'EVERYWHERE',
    value: '1000',
  });

  stage.addChild(
    playerBestFightBox.stage,
    playerBestMatchBox.stage,
    playerKillsBox.stage,
    bestFightBox.stage,
    bestMatchBox.stage,
    totalKillsBox.stage
  );

  // const unregister = gd.registerForHomeScreen({
  //   setPlayerStats: (playerStats: PlayerStats) => {},
  // });

  const unregister = gd.registerForUIEvents({
    playerUpdated: (p: Player) => {
      balanceBox.setBalance(p.tronium);
    },
  });

  return {
    dispose: () => {
      unregister();
      parent.removeChild(stage);
      stage.destroy({ children: true });
    },
  };
}

function BalanceBox(opts: {
  position: Point;
  value: number;
  addMore: () => void;
  cashOut: () => void;
}) {
  const container = newContainer(opts.position.x, opts.position.y);

  const icon = bigIcon('IcoTronium');
  const score = newText(opts.value.toString(), 'H2');
  const addMoreSprite = newSprite('BtnAddMore.png');
  const cashoutSprite = newSprite('BtnCashoutSmall.png');

  postionAfterX(icon, score, 10);
  postionAfterX(score, addMoreSprite, 10);
  postionAfterX(addMoreSprite, cashoutSprite, 10);

  verticalAlignCenter(0, icon, score, addMoreSprite, cashoutSprite);
  container.addChild(icon, score, addMoreSprite, cashoutSprite);

  Button.from(addMoreSprite, opts.addMore);
  Button.from(cashoutSprite, opts.cashOut);

  return {
    stage: container,
    setBalance: (newVal: number) => {
      score.text = newVal.toString();
      postionAfterX(score, addMoreSprite, 10);
      postionAfterX(addMoreSprite, cashoutSprite, 10);
    },
  };
}

// function GraphicBtn(opts: {
//   text: string;
//   position: Point;
//   fill: boolean;
//   color: number;
//   onClick: () => void;
// }) {
//   const margin = 4;
//   const labelText = newText(opts.text, 'Body2', {
//     position: new Point(margin, margin),
//   });

//   const g = new Graphics();

//   if (opts.fill) {
//     g.beginFill(opts.color);
//   } else {
//     g.lineStyle(1, opts.color);
//   }
//   g.drawRoundedRect(0, 0, labelText.width + margin * 2, labelText.height + margin * 2, 5);

//   if (opts.fill) {
//     g.endFill();
//   }

//   g.addChild(labelText);

//   g.position.set(opts.position.x, opts.position.y);

//   g.interactive = true;
//   g.buttonMode = true;
//   g.on('click', () => {
//     SoundManager.playBtn();
//     opts.onClick();
//   });
//   return g;
// }

function Hero(parentSize: Dimension) {
  const hero = newSprite('Hero.png');
  hero.x = 0;
  hero.y = parentSize.height - hero.height;
  return hero;
}
