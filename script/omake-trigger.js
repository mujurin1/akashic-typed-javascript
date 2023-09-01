// `g.Trigger` の解説用のサンプル
// Triggerのリファレンスは以下. ですが、必要な内容は全て解説するので今は読まなくて良いです
// https://akashic-games.github.io/akashic-engine/v3/classes/Trigger.html

const { createFont } = require("./utils/util");

/**
 * # g.Trigger の定義
 *
 * トリガーには主に以下のメソッドが存在します
 * * add      呼び出される関数を登録します
 * * addOnce  add と同じですが、１回実行されると自動的に remove されます
 * * remove   登録した関数を削除します
 * * fire     登録されている関数を全て呼び出します
 *
 * 以下のコードを実行すると次の出力を得られます
 * > from trigger
 * > from trigger
 * > stay...
 * > from trigger
 * ```javascript
 * function log() { console.log("from trigger"); }
 * const trigger = new g.Trigger();
 *
 * trigger.add(log);
 * trigger.addOnce(log);  // addOnce は１回だけ実行される
 * trigger.add(log);
 * trigger.remove(log);   // 削除しているので、登録されている log は2つになる
 *
 * trigger.fire();          // from trigger  が２回出力される
 * console.log("stay...");  // stay...
 * trigger.fire();          // from trigger  が１回出力される
 * ```
 *
 *
 * # g.Trigger を理解する
 *
 * g.Trigger (以下トリガー) は イベント駆動なプログラムを書くために便利なクラスです
 * > イベント駆動とは
 * >   「プレイヤーが画面をクリックしたら → 弾を発射する」
 * >   「10秒経過したら → 画面にテキストを表示する」
 * > のように、何かしらの「イベント」を起点に実行するプログラミングのよくあるパターンです
 * ※ このメモの意味が分からない場合無視した方が良いメモ: ここで言っているイベントは一般的なイベントのこと. g.Event のことではない
 *
 * Akashic Engine ではトリガーは `on***` という名前の変数(プロパティ)で定義されています
 * 例えば、`scene.onLoad` や `entity.onPointDown` です
 * これらは名前の通り
 *   onLoad      : 「シーンの読み込みが完了した時」
 *   onPointDown : 「それがクリックされた時」
 * にそれぞれ登録されている関数が実行されます
 * (当たり前だが、Akashic Engine の内部でこれらの fire メソッドが適切なタイミングで呼び出されています)
 *
 *
 * # g.Trigger の引数
 *
 * g.Trigger に登録する関数は値を受け取ることが出来ます
 *
 * 以下のコードを実行すると次の出力を得られます
 * > from trigger: 1
 * > from trigger: 2
 * ```javascript
 * const trigger = new g.Trigger();
 * trigger.add(num => console.log(`from trigger: ${num}`));
 *
 * trigger.fire(1);   // from trigger: 1
 * trigger.fire(2);   // from trigger: 2
 * ```
 *
 * 上記の例で分かる通り、fire の引数がそのまま登録した関数の引数になります
 * `entity.onPointDown` の場合は `g.PointDownEvent` を受け取れます
 * > g.PointDownEvent のリファレンス https://akashic-games.github.io/akashic-engine/v3/classes/PointDownEvent.html
 *
 * ```javascript
 * const entity = new g.E({ // g.E でなくても g.Sprite や g.Label でも良い
 *   touchable: true,       // touhable: true にしないとクリックに反応しない
 *   ... // 省略
 * });
 * // エンティティがクリックされると呼び出される
 * entity.onPointDown.add(ev => {
 *   // クリックされた座標が出力される
 *   console.log(`x: ${ev.point.x}  y: ${ev.point.y}`);
 * });
 * ```
 */

/**
 * `g.Trigger` の解説用のサンプル
 * @param {g.GameMainParameterObject} param
 */
exports.omakeTrigger = function default_main(param) {
  const scene = new g.Scene({
    game: g.game,
    // このシーンで利用するアセット
    // ここで宣言したアセットの準備が完了すると、scene.onLoad.fire が呼ばれる
    assetIds: ["player"],
  });

  // onLoad もトリガーであり 「そのシーンの準備が完了」 を条件に fire される
  // MEMO: scene は、g.game.pushScene されると準備が始まり、
  //       assetIds で定義されたアセットの準備が完了すると、fire される
  scene.onLoad.add(onLoaded);

  // pushScene(scene) を呼ぶことで、そのシーンの準備が開始される
  // 準備が完了されると そのシーンが表示され、onLoad.fire が呼ばれる
  g.game.pushScene(scene);

  // 下のコメントアウトしている文は scene.onLoad.fire が呼ばれる前に実行されてしまう
  // まだシーンの準備が完了する前に、そのシーンのアセットは利用不可能なので、エラーになる
  // scene.asset.getImageById("player");  // ERROR

  console.log("まだシーンの準備は完了してないよ！");
  // 特に読まなくていいメモ: シーンの準備が完了するのは最速でも pushScene をしてから１フレーム経過後
};

/**
 * scene の準備が完了したら呼び出される
 * @param {g.Scene} scene
 */
function onLoaded(scene) {
  console.log("シーンの読み込みが完了したよ！");

  const label = new g.Label({
    scene,
    parent: scene,
    font: createFont({ size: 40 }),
    text: "この文字をクリックすると‥",
    // textColor や g.FillRect#cssColor などの色は CSS COLOR を指定可能 → https://developer.mozilla.org/ja/docs/Web/CSS/color
    // 例) "black", "#000", "#00112233", "rgb(0,0,0,0.5)", "hsl(0,0,0,.6)"
    textColor: "#F0F",
    touchable: true, // これを忘れるとクリックに反応しない‥
  });

  label.onPointDown.add(ev => {
    const x = Math.floor(ev.point.x);
    const y = Math.floor(ev.point.y);
    label.text = `文字が変わるよ！ x:${x} y:${y}`;
    label.textColor = "rgb(123,30,0)";
    label.invalidate(); // label.text を変えた場合は invalidate を呼ばないと実際の表示が変わらない
  });

  const description = new g.Label({
    scene,
    parent: scene,
    y: 100,
    font: createFont({ size: 40 }),
    textColor: "blue",
    text: "真ん中のキャラクタはドラッグで移動できます",
    touchable: true,
  });
  const descClick = () => {
    description.y += 10;
    description.modified();
    // y:200を超えたらもう動かさないようにする
    if (description.y >= 200) {
      description.onPointDown.remove(descClick);
    }
  };
  description.onPointDown.add(descClick);

  const playerSrc = scene.asset.getImageById("player");
  const player = new g.Sprite({
    scene,
    parent: scene,
    src: playerSrc,
    x: (g.game.width - playerSrc.width) / 2,
    y: (g.game.height - playerSrc.height) / 2,
    touchable: true, // 忘れない
  });

  player.onPointDown.add(ev => {
    console.log("==========================================");
    console.log("プレイヤークリック 開始");
  });
  player.onPointMove.add(ev => {
    console.log("==========================================");
    console.log("最初にクリックした位置: ", ev.point);
    console.log("最初にクリックした位置からのマウスの移動距離: ", ev.startDelta);
    console.log("前回の Move からのマウスの移動距離: ", ev.prevDelta);

    player.moveBy(ev.prevDelta.x, ev.prevDelta.y);
    player.modified(); // 座標や角度などを変えた場合は modifired を呼ばないといけない
  });

  player.onPointUp.add(ev => {
    console.log("==========================================");
    console.log("プレイヤークリック 終了");
  });
}
