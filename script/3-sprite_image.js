const { createExLabel, createLabel } = require("./utils/util");

/**
 * 画像 (g.Sprite) の扱い方
 * @param {g.GameMainParameterObject} param
 */
exports.sprite_image = function default_main(param) {
  const scene = new g.Scene({
    game: g.game,
    assetIds: ["map"],
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
  /*
   * g.Sprite のプロパティには srcX, srcY, srcWidth, srcHeight があります
   * これは、src に指定された画像の表示する領域を指定します
   * 
   * srcX, srcY, は未指定時には 0
   * srcWidth, srcHeight は未指定時には width, height が入ります
   * width, height は未指定時には画像の幅、高さが入ります
   * 
   * 
   * 注意すべきなのは width, height のみを指定したときです
   * エンティティのサイズだけでなく画像の描画する範囲も変更されてしまいます
   * 
   * 例えば、300x300 の画像を src に指定して、width/height に 100 を指定した場合、
   * 画像の 0~100 の範囲しか表示されません
   * ```javascript
   * new g.Sprite({
   *   src: scene.asset.getImageById("300x300"),
   *   width: 100,
   *   height: 100,
   *   ...以下略
   * });
   * ```
   * 
   * 
   * エンティティのサイズのみ指定したい場合は、srcWidth, srcHeight を指定する必要があります
   * ```javascript
   * new g.Sprite({
   *   src: scene.asset.getImageById("300x300"),
   *   width: 100,
   *   height: 100,
   *   srcWidth: scene.asset.getImageById("300x300").width,   // 300
   *   srcHeight: scene.asset.getImageById("300x300").height, // 300
   *   ...以下略
   * });
   * ```
   * 
   * 
   * また、画像の範囲側を描画しようとすると
   * `drawImage(): out of bounds...`
   * という警告が表示されます
   * 
   * これは、画像の範囲外を含む場合の描画結果が環境によって異なるためです
   */

  /*
   * 画像を１枚に纏めて、使う時に必要な部分を取り出す時に src** 系の指定を使う
   */

  const labelY = 10;
  const labelY2 = 45;
  const spriteY = 120;

  // map 画像のサイズは 300x300
  const map = scene.asset.getImageById("map");

  createLabel(scene, "width/height 未指定", 10, labelY, "blue");
  new g.Sprite({
    scene, parent: scene, src: map,
    x: 10, y: spriteY,
  });

  createLabel(scene, "width/height 150", 360, labelY, "blue");
  new g.Sprite({
    scene, parent: scene, src: map,
    x: 360, y: spriteY,
    width: 150, height: 150,
  });

  createLabel(scene, "width/height 150", 660, labelY, "blue");
  createExLabel(scene, "srcW/srcH 300", 660, labelY2);
  new g.Sprite({
    scene, parent: scene, src: map,
    x: 660, y: spriteY,

    width: 150, height: 150,
    // 300 という値の根拠は map.width/height (src に指定した画像の元々のサイズ)
    // src 画像のうち 300/300 までの領域を表示するという指定
    // 実際の表示領域は 150x150 なのに画像は 200x200 になるので、
    // 縮小されて表示される (この縮小は生成時に見た目が縮小されるだけなので、エンティティの scale とは無関係)
    srcWidth: 300, srcHeight: 300
  });

  createLabel(scene, "width/height 150", 950, labelY, "blue");
  createExLabel(scene, "srcW/srcH 200\nsrcX/srcY 100", 950, labelY2);
  new g.Sprite({
    scene, parent: scene, src: map,
    x: 950, y: spriteY,

    width: 150, height: 150,

    // srcX/Y を指定しているので、
    // X:100,Y:100 の座標を原点として、200x200の領域を切り出して表示している
    srcWidth: 200, srcHeight: 200,
    srcX: 100, srcY: 100,
  });


  /* 
   * 画像の範囲外を描画しようとした場合、警告が表示されます
   * これは動作には影響しませんが、環境によってこのスプライトの見た目が異なってしまいます
   */
  const label = createExLabel(scene, "クリックすると範囲外を表示するスプライトを生成します", 400, 350, "red");
  label.touchable = true;

  // addOnce は１度のみ
  label.onPointDown.addOnce(() => {
    new g.Sprite({
      scene, parent: scene, src: map,
      x: 400, y: 390,

      // 画像の範囲は 300x300 なので、0-400 は範囲外を含む
      width: 400,
      height: 400,
    });

    label.text = "width/height 400";
    label.textColor = "black";
    label.invalidate();
  });
}
