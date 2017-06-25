const fileInput = document.querySelector('#file');
const mainCanvas = document.querySelector('#canvas');

fileInput.addEventListener('change', event => {
  const imageFile = event.target.files[0];
  const image = new Image();
  image.onload = () => {
    render(image);
  };
  image.src = URL.createObjectURL(imageFile);
});

function render(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  const brights = new Set();
  for (let k = 0; k < data.length; k += 4) {
    const bright = (0.34 * data[k]) + (0.5 * data[k + 1]) + (0.16 * data[k + 2]);
    brights.add(bright.toFixed(2));
  }
  const sortedBrights = Array.from(brights.values()).sort();
  const midBright = sortedBrights[Math.floor(sortedBrights.length / 2)];
  for (let k = 0; k < data.length; k += 4) {
    const bright = (0.34 * data[k]) + (0.5 * data[k + 1]) + (0.16 * data[k + 2]);
    if (bright > midBright) {
      data[k] = 255;
      data[k + 1] = 255;
      data[k + 2] = 255;
      data[k + 3] = 255;
    } else {
      data[k] = 0;
      data[k + 1] = 0;
      data[k + 2] = 0;
      data[k + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  mainCanvas.width = image.width;
  mainCanvas.height = image.height;
  const mainCtx = mainCanvas.getContext('2d');
  mainCtx.drawImage(canvas, 0, 0);
}
