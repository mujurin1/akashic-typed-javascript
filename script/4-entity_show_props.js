const { createLabel } = require("./utils/util");

/**
 * エンティティの見た目に関するプロパティ. angle/scale/anchor
 * @param {g.GameMainParameterObject} param
 */
exports.entity_show_props = function default_main(param) {
  const scene = new g.Scene({
    game: g.game,
    assetIds: ["alien", "map"],
    local: "interpolate-local", // これについては [まだ存在しない].js で解説します
  });
  scene.onLoad.add(onLoaded);
  g.game.pushScene(scene);
};

/** @type {{state: "rotate" | "scale" | "stop"}} 拡大/縮小/停止 どれか */
const charaState = { state: "rotate" };

/**
 * scene の準備が完了したら呼び出される
 * @param {g.Scene} scene
 */
function onLoaded(scene) {
  createLabel(scene, "キャラクターの原点X/Yは全てピンク(1,1)の中央です。クリックすると３秒間消えます", 10, 10);

  // エンティティは visible():false の間はタッチに反応しない

  const changeCharaState = () => {
    if (charaState.state === "rotate") {
      charaState.state = "scale";
      return "拡縮  １ ～ -１";
    } else if (charaState.state === "scale") {
      charaState.state = "stop";
      return "停止";
    } else {
      charaState.state = "rotate";
      return "回転";
    }
  };

  /** @type {g.Sprite[]} */
  const charas = [];

  const changeLabel = createLabel(scene, "クリックすると回転/拡縮が切り替わります。 現在:回転", 10, 60, "red");
  changeLabel.touchable = true;

  changeLabel.onPointDown.add(() => {
    const text = changeCharaState();

    changeLabel.text = `クリックすると回転/拡縮が切り替わります。 現在:${text}`;
    changeLabel.invalidate();

    charas.forEach(chara => {
      chara.angle = 0;
      chara.scale(1);
    });
  });

  // angle/scale/anchor について
  charas.push(...sampleA(scene));

  // 親要素が変化すると、その子要素も一緒に動きます
  charas.push(...sampleB(scene));
}


/**
 * 画面の部分
 * @param {g.Scene} scene
 */
function sampleA(scene) {
  const labelY = 130;
  const charaY = labelY + 50;
  let x = 10;

  /** @type {g.Sprite[]} */
  const charas = [];

  createLabel(scene, "指定なし", x, labelY);
  charas.push(creaetCharaAndParent(scene, x, charaY).chara);

  /*
   * anchor はエンティティの位置 (座標/回転/拡縮) の基点です
   * anchorX, anchorY にそのエンティティのサイズ (width/height) を掛けた位置がエンティティの基点になります
   * 基本的に 0~1 の割合で指定します
   * 
   * 幅/高さが 100 のエンティティに、anchorX/Y に 0.5 を指定した場合、
   * 0 の時に比べて 50 左上の位置に
   */
  createLabel(scene, "anchor: 0.5", (x += 210), labelY);
  charas.push(creaetCharaAndParent(scene, x, charaY, { anchorX: 0.5, anchorY: 0.5 }).chara);

  createLabel(scene, "anchor: 1", (x += 210), labelY);
  charas.push(creaetCharaAndParent(scene, x, charaY, { anchorX: 1, anchorY: 1 }).chara);


  /*
   * anchorX/Y のどちらか片方でも null を指定した場合以下の動作をします
   * * X/Y は左上の位置 (0 を指定した時と同じ)
   * * angle は中央 (0.5 を指定したときと同じ)
   */
  createLabel(scene, "anchor: null", (x += 210), labelY);
  charas.push(creaetCharaAndParent(scene, x, charaY, { anchorX: null }).chara);

  createLabel(scene, "anchor: 2", (x += 210), labelY);
  charas.push(creaetCharaAndParent(scene, x, charaY, { anchorX: 2, anchorY: 2 }).chara);

  createLabel(scene, "anchor: -1", (x += 210), labelY);
  charas.push(creaetCharaAndParent(scene, x, charaY, { anchorX: -1, anchorY: -1 }).chara);

  return charas;
}


/**
 * 画面の部分
 * @param {g.Scene} scene
 */
function sampleB(scene) {
  /** @type {g.Sprite[]} */
  const charas = [];
  /** @type {g.Sprite[]} */
  const parents = [];

  let lavelX = 10;
  const labelY = 450;
  const charaY = labelY + 50;

  /**
   * @param {{ parent: g.Sprite; chara: any; }} parentAndChara
   */
  function setCharaAndParent(parentAndChara) {
    const { parent, chara } = parentAndChara;
    charas.push(chara);
    parents.push(parent);

    parent.onUpdate.add(() => {
      if (rotateWaku) {
        parent.angle = (parent.angle + 1) % 360;
        parent.modified();

        rotateLabel.text = `回転します:${parent.angle}`;
        rotateLabel.invalidate();
      }
      if (scaleWaku) {
        parent.scale(parent.scaleX - 0.02);
        if (parent.scaleX < -1) parent.scale(1);
        parent.modified();

        scaleLabel.text = `拡縮します:${parent.scaleX.toFixed(2)}`;
        scaleLabel.invalidate();
      }
      if (anchorWaku) {
        let anchor = (parent.anchorX ?? 1) - 0.02;
        if (anchor < -1) anchor = 1;

        parent.anchor(anchor, anchor);
        parent.modified();

        anchorLabel.text = `ahcorします:${anchor.toFixed(2)}`;
        anchorLabel.invalidate();
      }
    });
  }

  const y = 400;
  let rotateWaku = false;
  let scaleWaku = false;
  let anchorWaku = false;
  createLabel(scene, "クリックすると枠が", lavelX, y);
  const rotateLabel = createLabel(scene, "回転します", lavelX + 300, y, "red");
  const scaleLabel = createLabel(scene, "拡縮します", lavelX + 550, y, "red");
  const anchorLabel = createLabel(scene, "ahcorします", lavelX + 810, y, "red");
  const resetLabel = createLabel(scene, "リセット", lavelX + 1100, y, "red");
  rotateLabel.touchable = scaleLabel.touchable = anchorLabel.touchable = resetLabel.touchable = true;


  rotateLabel.onPointDown.add(() => {
    rotateWaku = !rotateWaku;
  });
  scaleLabel.onPointDown.add(() => {
    scaleWaku = !scaleWaku;
  });
  anchorLabel.onPointDown.add(() => {
    anchorWaku = !anchorWaku;
  });
  resetLabel.onPointDown.add(() => {
    rotateWaku = false;
    scaleWaku = false;
    anchorWaku = false;

    parents.forEach(parent => {
      rotateLabel.text = "回転します"; rotateLabel.invalidate();
      scaleLabel.text = "拡縮します"; scaleLabel.invalidate();
      anchorLabel.text = "ahcorします"; anchorLabel.invalidate();
      resetLabel.text = "リセット"; resetLabel.invalidate();

      parent.angle = 0;
      parent.scale(1);
      parent.anchor(0, 0);
      parent.modified();
    });
  });



  createLabel(scene, "指定なし", lavelX, labelY);
  setCharaAndParent(creaetCharaAndParent(scene, lavelX, charaY));

  createLabel(scene, "anchor: 0.5", (lavelX += 210), labelY);
  setCharaAndParent(creaetCharaAndParent(scene, lavelX, charaY, { anchorX: 0.5, anchorY: 0.5 }));

  createLabel(scene, "anchor: 1", (lavelX += 210), labelY);
  setCharaAndParent(creaetCharaAndParent(scene, lavelX, charaY, { anchorX: 1, anchorY: 1 }));

  createLabel(scene, "anchor: null", (lavelX += 210), labelY);
  setCharaAndParent(creaetCharaAndParent(scene, lavelX, charaY, { anchorX: null }));

  createLabel(scene, "anchor: 2", (lavelX += 210), labelY);
  setCharaAndParent(creaetCharaAndParent(scene, lavelX, charaY, { anchorX: 2, anchorY: 2 }));

  createLabel(scene, "anchor: -1", (lavelX += 210), labelY);
  setCharaAndParent(creaetCharaAndParent(scene, lavelX, charaY, { anchorX: -1, anchorY: -1 }));

  return charas;
}



/**
 * @param {g.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {Partial<g.SpriteParameterObject>} [props]
 */
function creaetCharaAndParent(
  scene,
  x,
  y,
  props = {
    anchorX: 0,
    anchorY: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0
  }) {
  const src = scene.asset.getImageById("map");
  const parent = new g.Sprite({
    scene, parent: scene,
    x, y,
    src: src,
    width: 150,
    height: 150,
    srcWidth: src.width,
    srcHeight: src.height
  });

  const chara = new g.Sprite({
    scene, parent,
    src: scene.asset.getImageById("alien"),
    x: parent.width / 2,
    y: parent.height / 2,
    touchable: true,
    ...props,
  });

  chara.onUpdate.add(() => {
    if (charaState.state === "rotate") {
      chara.angle += 5;
    } else if (charaState.state === "scale") {
      chara.scale(chara.scaleX - 0.03);
      if (chara.scaleX < -1) chara.scale(1);
    }

    chara.modified();
  });

  chara.onPointDown.add(() => {
    chara.hide();
    scene.setTimeout(() => {
      chara.show();
    }, 3000);
  });

  return { parent, chara };
}
