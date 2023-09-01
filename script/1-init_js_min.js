// 解説: README 1.md

/**
 * `akashic init javascript-minimal` で生成される main.js を整形した内容
 * @param {g.GameMainParameterObject} param
 */
exports.init_js_min = function main(param) {
  // シーンを生成
  const scene = new g.Scene({
    game: g.game,
    // このシーンで利用するアセットのIDを列挙し、シーンに通知します
    assetIds: ["player", "shot", "se"],
    local: "interpolate-local", // これについては [まだ存在しない].js で解説します
  });

  /* 
   * scene.onLoad について
   * 
   * > 前提知識
   * >   シーンは使用するアセットを `new g.Scene({ assetIds: これ }` で指定することが出来ます
   * >   アセットは「ゲームの実行中」にネットワーク越しで読み込まれます
   * >   具体的にはそのシーンに遷移したとき ( `scene.game.pushScene` で指定されたとき) です
   * 
   * `g.game.pushScene` されてから、そのシーンで必要なアセットをダウンロードします
   * ダウンロードして準備が完了するまではそのアセットを利用することが出来ないため、
   * 準備が完了したよ！ということを伝えるために `scene.onLoad` があります
   */
  /* 
   * Trigger について
   * 
   * Trigger は AkashicEngine が提供しているクラスです
   * これは「関数を登録して登録された関数を実行する」という機能を持っています
   * 代表的なメソッドは以下です
   * * add     : 関数を登録します
   * * addOnce : 関数を登録しますが、１度呼び出されると自動的に remove されます
   * * remove  : 登録した関数を削除します
   * * fire    : 登録されている関数を呼び出します
   */
  // シーンの準備が完了したら onLoaded を実行する
  // (onLoad.add で登録した関数はシーンの読み込みが完了したら呼び出されます)
  scene.onLoad.add(onLoaded);

  // scene を現在のシーンとして設定する
  // これによりシーンの準備が開始される
  g.game.pushScene(scene);
};

/**
 * scene の準備が完了したら呼び出される
 * @param {g.Scene} scene
 */
function onLoaded(scene) {
  const player = new g.Sprite({
    scene,
    parent: scene,
    src: scene.asset.getImageById("player"),
  });

  // プレイヤーの初期座標を、画面の中心に設定します
  player.x = (g.game.width - player.width) / 2;
  player.y = (g.game.height - player.height) / 2;
  player.onUpdate.add(() => {
    player.y =
      (g.game.height - player.height) / 2 + Math.sin((g.game.age % (g.game.fps * 100)) / 4) * 100;
    player.modified();
  });

  // 画面をタッチしたら弾を生成する
  scene.onPointDownCapture.add(() => createShot(scene, player));
}

/**
 * 弾を生成する
 * @param {g.Scene} scene
 * @param {g.Sprite} player
 */
function createShot(scene, player) {
  const shotImageAsset = scene.asset.getImageById("shot");
  const seAudioAsset = scene.asset.getAudioById("se");

  // SEを鳴らします
  seAudioAsset.play().changeVolume(0.2);

  // プレイヤーが発射する弾を生成します
  const shot = new g.Sprite({
    scene,
    parent: scene,
    src: shotImageAsset,
    x: player.x + player.width,
    y: player.y,
  });

  function shotUpdate() {
    // 毎フレームで座標を確認し、画面外に出ていたら弾をシーンから取り除きます
    if (shot.x > g.game.width) {
      shot.destroy(); // エンティティの削除
      return; // 削除する場合は移動は不要なので、ここで終了する
    }

    // 弾を右に動かす
    shot.x += 10;
    shot.modified();
  }

  // 毎フレーム shotUpdate を実行する
  shot.onUpdate.add(shotUpdate);
}
