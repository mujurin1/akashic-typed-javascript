const { createFont } = require("./utils/util");
const { resolvePlayerInfo } = require("@akashic-extension/resolve-player-info");

/**
 * @typedef {NonNullable<Parameters<typeof resolvePlayerInfo>[1]>} resolvePlayerInfoParam2
 * @typedef {Parameters<resolvePlayerInfoParam2>[1]} PlayerInfo
 */

/**
 * エンティティの入れ子のサンプル
 * @param {g.GameMainParameterObject} param
 */
exports.childEntity = function default_main(param) {
  const scene = new g.Scene({
    game: g.game,
    local: "interpolate-local", // これについては [まだ存在しない].js で解説します
  });
  scene.onLoad.add(onLoaded);
  g.game.pushScene(scene);
};

/**
 * scene の準備が完了したら呼び出される
 * @param {g.Scene} scene
 */
function onLoaded(scene) {
  const { updatePlayerState } = createInfoFrame(scene);

  /**
   * `akahic serve` のデバッグメニューでは、右上のハンバーガーメニューをクリックすると、
   * 画面の下にデバッグメニューが表示されます
   * 
   * その中の「Entity Tree」では現在シーンに追加されているエンティティがツリーで表示されます
   * 
   * 参考画像: https://i.imgur.com/yo3stHt.png
   */

  const getPlayerInfoLabel = new g.Label({
    scene,
    parent: scene,
    x: 50,
    y: g.game.height - 100,
    font: createFont({ size: 50 }),
    text: "ここをクリックしてプレイヤーの情報を取得します",
    textColor: "gray",
    touchable: true,
    // tag には任意の値を入れる事ができる
    tag: { entityName: "getPlayerInfoLabel" }
  });

  getPlayerInfoLabel.onPointDown.add(() => {
    // ユーザー名を使うには resolve-player-info が必要
    // https://akashic-games.github.io/shin-ichiba/player-info.html

    getPlayerInfoLabel.destroy();

    resolvePlayerInfo({}, (error, playerInfo) => {
      updatePlayerState(playerInfo);
    });
  });
}



/**
 * `infoFrame` を生成します
 * @param {g.Scene} scene
 */
function createInfoFrame(scene) {
  /** 情報を配置するフレーム */
  const infoFrame = new g.FilledRect({
    scene,
    parent: scene,
    cssColor: "skyblue",
    x: 10,
    y: 10,
    width: 400,
    height: 400,
    touchable: true,
    // tag には任意の値を入れれるので、エンティティ名を入れておく
    tag: { entityName: "infoFrame" }
  });



  /** 持って動かすためのバー */
  const holder = createHolder(scene, infoFrame);
  holder.onPointMove.add(ev => {
    infoFrame.moveBy(ev.prevDelta.x, ev.prevDelta.y);

    // 移動可能範囲制限
    infoFrame.x = Math.max(10, infoFrame.x);
    infoFrame.x = Math.min(g.game.width - infoFrame.width - 10, infoFrame.x);
    infoFrame.y = Math.max(10, infoFrame.y);
    infoFrame.y = Math.min(g.game.height - infoFrame.height - 10, infoFrame.y);

    infoFrame.modified();
  });



  /** 最後にクリックしたエンティティの名前を表示するラベル */
  const lastClickLabel = new g.Label({
    scene,
    parent: infoFrame,
    x: holder.x,
    y: holder.y + holder.height + 30,
    font: createFont({ size: 20 }),
    text: "クリック: ",
  });
  // (エンティティの onPoint** イベントは一番上のエンティティのみイベントを受け取る)
  scene.onPointDownCapture.add(ev => {
    // scene.onPointDownCapture はシーン全体のクリックを取得する
    // エンティティがクリックされた場合もこのイベントを受け取れます

    // ev.target はクリックされたエンティティ

    // ev.target がない場合は何もクリックされてない (シーンがクリックされた)
    if (ev.target == null) {
      lastClickLabel.text = "クリック: scene";
      lastClickLabel.invalidate();
      return;
    }

    // ev.target がある場合は tag の内容を見る
    // (ここで定義している (touchable:true の) エンティティには tag.entityName を設定している)
    if (ev.target.tag?.entityName == null) return;
    lastClickLabel.text = `クリック: ${ev.target.tag.entityName}`;
    lastClickLabel.invalidate();
  });



  /** 経過時間のラベル */
  const elapsedTick = new g.Label({
    scene,
    parent: infoFrame,
    x: lastClickLabel.x,
    y: lastClickLabel.y + lastClickLabel.height + 10,
    font: createFont({ size: 20 }),
    text: "経過時間: 0",
    // 全てのエンティティは tag という好きな値を持てるプロパティが存在する
    tag: 0,
  });
  elapsedTick.onUpdate.add(() => {
    const time = Math.floor(g.game.age / g.game.fps);
    // 描画結果が同じなら描画をスキップする
    if (elapsedTick.tag === time) return;
    // 特にスキップ中は画面の更新が連続で行われるので、描画回数を減らすとスキップ時間が短くなる
    // (こういう工夫が必要なのはマルチプレイの、1回のプレイ時間が長いゲームに限るけど‥)
    if (g.game.isSkipping && time % 10 !== 0) return;
    elapsedTick.tag = time;

    elapsedTick.text = `経過時間: ${time} `;
    elapsedTick.invalidate(); // g.Label#text を変更した場合は invalidate を呼ぶ
  });



  /** スキップ中かどうかのラベル */
  const skipping = new g.Label({
    scene,
    parent: infoFrame,
    x: elapsedTick.x,
    y: elapsedTick.y + elapsedTick.height + 10,
    font: createFont({ size: 20 }),
    text: `スキップ中か ?: ${g.game.isSkipping} `,
    textColor: g.game.isSkipping ? "red" : "black",
    tag: g.game.isSkipping,
  });
  skipping.onUpdate.add(() => {
    // 描画結果が同じなら、描画をスキップする
    if (skipping.tag === g.game.isSkipping) return;
    skipping.tag = g.game.isSkipping;
    skipping.textColor = g.game.isSkipping ? "red" : "black";

    skipping.text = `スキップ中か ?: ${g.game.isSkipping} `;
    skipping.invalidate(); // g.Label#text を変更した場合は invalidate を呼ぶ
  });



  /** プレイヤーのID */
  const idLabel = new g.Label({
    scene,
    parent: infoFrame,
    x: skipping.x,
    y: skipping.y + skipping.height + 10,
    font: createFont({ size: 20 }),
    text: `プレイヤーのID: ${g.game.selfId} `,
    tag: g.game.isSkipping,
  });

  /** プレイヤーの名前 */
  const nameLabel = new g.Label({
    scene,
    parent: infoFrame,
    x: idLabel.x,
    y: idLabel.y + idLabel.height + 10,
    font: createFont({ size: 20 }),
    text: `プレイヤーの名前: ----`,
    tag: g.game.isSkipping,
  });

  /** 生ユーザー名かどうか */
  const guestLabel = new g.Label({
    scene,
    parent: infoFrame,
    x: nameLabel.x,
    y: nameLabel.y + nameLabel.height + 10,
    font: createFont({ size: 20 }),
    text: `生ユーザー名か: ----`,
    tag: g.game.isSkipping,
  });

  /** プレイヤーのプレミアム状態 */
  const premiumLabel = new g.Label({
    scene,
    parent: infoFrame,
    x: guestLabel.x,
    y: guestLabel.y + guestLabel.height + 10,
    font: createFont({ size: 20 }),
    text: `プレミアムか: ----`,
    tag: g.game.isSkipping,
  });



  return {
    infoFrame,
    /**
     * プレイヤーの情報を更新します
     * @param {PlayerInfo} playerInfo プレイヤーの情報
     */
    updatePlayerState: (playerInfo) => {
      const userData = playerInfo?.userData;
      nameLabel.text = `プレイヤーの名前: ${playerInfo?.name ?? "ゲスト"}`;
      nameLabel.invalidate();
      guestLabel.text = `生ユーザー名か: ${userData?.accepted ?? true}`;
      guestLabel.invalidate();
      premiumLabel.text = `プレミアムか: ${userData?.premium ?? false}`;
      premiumLabel.invalidate();
    }
  };
}



/**
 * 取っ手部分のエンティティ
 * @param {g.Scene} scene
 * @param {g.FilledRect} parent
 */
function createHolder(scene, parent) {
  const holder = new g.FilledRect({
    scene,
    parent,
    cssColor: "yellow",
    // x/y は infoFrame の原点を基準としている
    x: 10,
    y: 10,
    width: parent.width - 20,
    height: 30,
    touchable: true,
    // tag には任意の値を入れれるので、エンティティ名を入れておく
    tag: { entityName: "holder" }
  });
  new g.Label({
    scene,
    parent: holder,
    font: createFont({ size: 20 }),
    text: "ここをドラッグして動かせます",
    width: holder.width,
    widthAutoAdjust: false, // テキストに合わせて自動で幅を調整 を false
    textAlign: "center", // テキスト位置を中央にする (`widthAutoAdjust` が true な場合 これの指定が意味をなさない)
  });

  return holder;
}
