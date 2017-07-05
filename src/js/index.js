import React from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';

const SCALE = 20;

@autobind
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzle: null,
    };
  }

  handleSelectPuzzleImage(puzzle) {
    this.setState({puzzle});
  }

  render() {
    const { puzzle } = this.state;
    return (
      <div>
        {puzzle
          ? <PuzzleDisplay puzzle={puzzle} />
          : <ImageSelector onSelect={this.handleSelectPuzzleImage} />
        }
      </div>
    )
  }
}

@autobind
class ImageSelector extends React.Component {
  handleFileChange(event) {
    const imageFile = event.target.files[0];
    const image = new Image();
    image.onload = () => {
      this.props.onSelect(
        convertImageToPuzzle(image),
      );
    };
    image.src = URL.createObjectURL(imageFile);
  }

  render() {
    return (
      <label>
        <span>Custom Image:</span>
        <input type="file" onChange={this.handleFileChange} />
      </label>
    );
  }
}

class PuzzleDisplay extends React.Component {
  render() {
    const { puzzle } = this.props;
    return (
      <table className="puzzle-display">
        <tbody>
          {puzzle.data.map((row, y) => (
            <tr key={`row:${y}`}>
              {row.map((cell, x) => (
                <td key={`row:${y},col:${x}`} className={cell ? 'cell filled' : 'cell empty'} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

function convertImageToPuzzle(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  ctx.drawImage(convertTo2Bit(canvas), 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const puzzleData = [];
  for (var y = 0; y < canvas.height; y++) {
    const row = [];
    for (var x = 0; x < canvas.width; x++) {
      const index = (y * 4 * canvas.width) + (x * 4);
      row.push(imageData[index] === 0);
    }
    puzzleData.push(row);
  }
  return new Puzzle(puzzleData, canvas.width, canvas.height);
}

class Puzzle {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }

  get(x, y) {
    return this.data[y][x];
  }
}

function convertTo2Bit(originalCanvas) {
  const canvas = document.createElement('canvas');
  canvas.width = originalCanvas.width;
  canvas.height = originalCanvas.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalCanvas, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
    if (bright >= midBright) {
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
  return canvas;
}

function render(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = image.width;
  mainCanvas.height = image.height;
  mainCanvas.style.width = `${image.width * SCALE}px`;
  mainCanvas.style.height = `${image.height * SCALE}px`;
  const mainCtx = mainCanvas.getContext('2d');
  mainCtx.drawImage(convertTo2Bit(canvas), 0, 0);

  gameContainer.appendChild(mainCanvas);
}

ReactDOM.render(
  <Game />,
  document.getElementById('game')
);
