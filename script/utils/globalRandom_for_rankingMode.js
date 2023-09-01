
/**
 * ランキングモードのゲームで利用可能な共通乱数を生成する
 * 
 * ※ しかし、ランキングモードでのデバッグ環境ではこれは上手く機能せずに、これは別々の乱数を生成します\
 *    ニコ生上で実行した時のみ、共通の乱数を生成します
 * @param {g.GameMainParameterObject} param
 * @param {(param: g.GameMainParameterObject, random: g.RandomGenerator) => void} callback
 * @example
 * function main(param) {
 *   globalRandom_for_rankingMode(param, _main);
 * }
 * 
 * function _main(param, random) {
 *   const scene = new g.Scene({...});
 *   ...// ここからゲームを記述する
 * }
 */
module.exports.globalRandom_for_rankingMode = function (param, callback) {
  const scene = new g.Scene({ game: g.game });

  // 特定のセッションパラメータを待ちます
  scene.onMessage.add((msg) => {
    if (msg.data == null || msg.data.type !== "start" || msg.data.parameters == null) return;

    g.game.popScene();

    if (msg.data.parameters.randomSeed != null) {
      callback(param, new g.XorshiftRandomGenerator(msg.data.parameters.randomSeed));
    } else {
      callback(param, g.game.random);
    }
  });

  // 特定のセッションパラメータが来なかった場合でもゲームが始まる様にする
  scene.onLoad.add(() => {
    let currentTickCount = 0;
    scene.onUpdate.add(() => {
      // 3Tick経過するまで待ちます
      if (++currentTickCount < 3) return;

      g.game.popScene();
      callback(param, g.game.random);
    });
  });

  g.game.pushScene(scene);
};
