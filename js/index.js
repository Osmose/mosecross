import React from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';


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
          <tr>
            <th></th>
            {puzzle.colCounts.map((colCount, col) => (
              <th key={col}>
                <div className="count-container column-count-container">
                  {colCount.map((count, countIndex) => (
                    <div key={countIndex} className="count">{count}</div>
                  ))}
                </div>
              </th>
            ))}
            <th rowSpan="0" className="puzzle-height">{puzzle.height}</th>
          </tr>
          {puzzle.data.map((rowData, row) => (
            <tr key={`row:${row}`}>
              <th>
                <div className="count-container row-count-container">
                  {puzzle.rowCounts[row].map((count, countIndex) => (
                    <div key={countIndex} className="count">{count}</div>
                  ))}
                </div>
              </th>
              {rowData.map((cell, col) => (
                <Cell
                  key={`row:${row},col:${col}`}
                  filled={cell}
                />
              ))}
            </tr>
          ))}
          <tr><td className="puzzle-width" colSpan={puzzle.width + 2}>{puzzle.width}</td></tr>
        </tbody>
      </table>
    );
  }
}


@autobind
class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'empty',
    };
  }

  handleClick() {
    const { filled } = this.props;
    const { status } = this.state;
    if (status === 'empty') {
      let status = 'wrong';
      if (filled) {
        status = 'filled';
      }
      this.setState({ status });
    }
  }

  render() {
    const { status } = this.state;
    return (
      <td
        onClick={this.handleClick}
        className={`cell ${status}`}
      />
    )
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
  for (let row = 0; row < canvas.height; row++) {
    const rowData = [];
    for (let col = 0; col < canvas.width; col++) {
      const index = (row * 4 * canvas.width) + (col * 4);
      rowData.push(imageData[index] === 0);
    }
    puzzleData.push(rowData);
  }
  return new Puzzle(puzzleData, canvas.width, canvas.height);
}

class Puzzle {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;

    this.rowCounts = [];
    for (let row = 0; row < height; row++) {
      const count = [0];
      for (let col = 0; col < width; col++) {
        if (this.get(row, col)) {
          count[count.length - 1]++;
        } else {
          count.push(0);
        }
      }
      this.rowCounts.push(count.filter(c => c > 0));
    }

    this.colCounts = [];
    for (let col = 0; col < width; col++) {
      const count = [0];
      for (let row = 0; row < height; row++) {
        if (this.get(row, col)) {
          count[count.length - 1]++;
        } else {
          count.push(0);
        }
      }
      this.colCounts.push(count.filter(c => c > 0));
    }
  }

  get(row, col) {
    return this.data[row][col];
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

ReactDOM.render(
  <Game />,
  document.getElementById('game')
);
